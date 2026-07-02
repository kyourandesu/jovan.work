"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { AudioLines, Info, KeyRound, TriangleAlert } from "lucide-react";
import { ENGINE_META, getEngine } from "@/app/lib/tts/registry";
import { render } from "@/app/lib/tts/render";
import { disposeAligner } from "@/app/lib/tts/align";
import { encodeWav } from "@/app/lib/tts/wav";
import { providerLabel, type ByokProvider } from "@/app/lib/tts/byok";
import type { EngineId, ProgressEvent, RenderOutput, Voice } from "@/app/lib/tts/types";
import EngineSelect from "./EngineSelect";
import VoicePicker from "./VoicePicker";
import TextEditor from "./TextEditor";
import InstructionsField from "./InstructionsField";
import GenerateBar from "./GenerateBar";
import Player from "./Player";
import DownloadMenu from "./DownloadMenu";
import ProgressReadout from "./ProgressReadout";
import ApiKeyDialog from "./ApiKeyDialog";
import { useAudioExport } from "../hooks/useAudioExport";
import { useByokKey } from "../hooks/useByokKey";
import { loadEngine, loadVoice, saveEngine, saveVoice } from "../lib/prefs";

/** Cloud engines map 1:1 to a BYOK provider; on-device engines have none. */
function byokProviderFor(engineId: EngineId): ByokProvider | null {
  return engineId === "openai" || engineId === "gemini" ? engineId : null;
}

const CLOUD_CHAR_LIMIT = 2000; // mirrors server TTS_MAX_CHARS default
const PREVIEW_TEXT = "Hi — this is how I sound. What would you like me to read?";
const PREVIEW_CACHE_MAX = 24;
const SAMPLE_TEXT =
  "The studio runs entirely in your browser. Choose a voice, press generate, and watch each word light up as it's spoken. When you're happy, download the audio as WAV or MP3.";

export default function StudioTool() {
  const [engineId, setEngineId] = useState<EngineId>(() => loadEngine() ?? "kokoro");
  const [voices, setVoices] = useState<Voice[]>([]);
  const [voicesLoading, setVoicesLoading] = useState(true);
  const [voice, setVoice] = useState("");

  const [text, setText] = useState(SAMPLE_TEXT);
  const [instructions, setInstructions] = useState("");

  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<ProgressEvent | null>(null);
  const [output, setOutput] = useState<RenderOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);
  const [previewPlayingId, setPreviewPlayingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState<"wav" | "mp3" | null>(null);

  const genAbort = useRef<AbortController | null>(null);
  const previewAbort = useRef<AbortController | null>(null);
  const previewAudio = useRef<HTMLAudioElement | null>(null);
  const previewCache = useRef<Map<string, Blob>>(new Map());

  const [keyDialogOpen, setKeyDialogOpen] = useState(false);

  const { downloadWav, downloadMp3 } = useAudioExport();
  const engine = getEngine(engineId);
  const meta = ENGINE_META[engineId];
  const isCloud = engine.type === "cloud";
  const byokProvider = byokProviderFor(engineId);
  const byokKey = useByokKey(byokProvider ?? "openai");
  // Only meaningful for cloud engines; on-device engines never use a key.
  const activeKey = byokProvider ? byokKey : null;

  // Load voices whenever the engine changes; restore the saved voice if present.
  useEffect(() => {
    let cancelled = false;
    setVoicesLoading(true);
    setVoice("");
    engine
      .listVoices()
      .then((list) => {
        if (cancelled) return;
        setVoices(list);
        const saved = loadVoice(engine.id);
        const restored = saved && list.some((v) => v.id === saved) ? saved : list[0]?.id ?? "";
        setVoice(restored);
      })
      .catch(() => !cancelled && setVoices([]))
      .finally(() => !cancelled && setVoicesLoading(false));
    return () => {
      cancelled = true;
    };
  }, [engine]);

  // Persist engine + voice on change.
  useEffect(() => saveEngine(engineId), [engineId]);
  useEffect(() => {
    if (voice) saveVoice(engineId, voice);
  }, [engineId, voice]);

  // Free the previous engine's resources (e.g. Piper's worker) on switch-away.
  // Switching is disabled while busy, so this only runs between generations.
  const prevEngineId = useRef(engineId);
  useEffect(() => {
    const prev = prevEngineId.current;
    if (prev !== engineId) {
      getEngine(prev).dispose?.();
      prevEngineId.current = engineId;
    }
  }, [engineId]);

  // On unmount, free the current engine and the Whisper alignment worker.
  const engineIdRef = useRef(engineId);
  engineIdRef.current = engineId;
  useEffect(() => {
    return () => {
      getEngine(engineIdRef.current).dispose?.();
      disposeAligner();
    };
  }, []);

  const stopPreview = useCallback(() => {
    previewAbort.current?.abort();
    if (previewAudio.current) {
      previewAudio.current.pause();
      previewAudio.current.src = "";
      previewAudio.current = null;
    }
    setPreviewLoadingId(null);
    setPreviewPlayingId(null);
  }, []);

  const playBlob = useCallback((voiceId: string, blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    const cleanup = () => {
      URL.revokeObjectURL(url);
      if (previewAudio.current === audio) {
        previewAudio.current = null;
        setPreviewPlayingId(null);
      }
    };
    audio.addEventListener("ended", cleanup);
    previewAudio.current = audio;
    setPreviewPlayingId(voiceId);
    audio.play().catch(cleanup);
  }, []);

  const handlePreview = useCallback(
    async (voiceId: string) => {
      // Clicking the active (loading or playing) voice stops it.
      if (previewLoadingId === voiceId || previewPlayingId === voiceId) {
        stopPreview();
        return;
      }
      stopPreview();
      setError(null);

      const key = `${engineId}:${voiceId}:${instructions}`;
      const cached = previewCache.current.get(key);
      if (cached) {
        // Refresh LRU order.
        previewCache.current.delete(key);
        previewCache.current.set(key, cached);
        playBlob(voiceId, cached);
        return;
      }

      setPreviewLoadingId(voiceId);
      const controller = new AbortController();
      previewAbort.current = controller;
      try {
        const result = await render({
          engineId,
          text: PREVIEW_TEXT,
          voice: voiceId,
          instructions,
          speed: 1,
          align: false,
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        const blob = encodeWav(result.audio, result.sampleRate);
        previewCache.current.set(key, blob);
        // Simple LRU: drop the oldest entries past the cap.
        while (previewCache.current.size > PREVIEW_CACHE_MAX) {
          const oldest = previewCache.current.keys().next().value;
          if (oldest === undefined) break;
          previewCache.current.delete(oldest);
        }
        playBlob(voiceId, blob);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setError(preview(err));
      } finally {
        if (previewAbort.current === controller) setPreviewLoadingId(null);
      }
    },
    [engineId, instructions, previewLoadingId, previewPlayingId, stopPreview, playBlob]
  );

  const handleGenerate = useCallback(async () => {
    stopPreview();
    setError(null);
    setOutput(null);
    setBusy(true);
    const controller = new AbortController();
    genAbort.current = controller;
    try {
      const result = await render(
        {
          engineId,
          text,
          voice,
          instructions,
          speed: 1,
          align: true,
          signal: controller.signal,
          // Audio ready: show the player immediately and drop the busy/progress
          // UI. Word timings (if still pending) patch in when render() resolves.
          onAudioReady: (audioOut) => {
            if (controller.signal.aborted) return;
            setOutput(audioOut);
            setBusy(false);
            setProgress(null);
          },
        },
        (p) => setProgress(p)
      );
      // Overwrite the pending output with the final (aligned) timings.
      if (!controller.signal.aborted) setOutput(result);
      // Cancelled during alignment: keep the playable audio, drop the spinner.
      else setOutput((prev) => (prev?.timingSource === "pending" ? { ...prev, timingSource: "none" } : prev));
    } catch (err) {
      if ((err as Error).name !== "AbortError") setError((err as Error).message);
    } finally {
      setBusy(false);
      setProgress(null);
      genAbort.current = null;
    }
  }, [engineId, text, voice, instructions, stopPreview]);

  const handleCancel = useCallback(() => genAbort.current?.abort(), []);

  const runExport = useCallback(
    async (kind: "wav" | "mp3") => {
      if (!output) return;
      setExporting(kind);
      try {
        if (kind === "wav") downloadWav(output.audio, output.sampleRate, "speech");
        else await downloadMp3(output.audio, output.sampleRate, "speech");
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setExporting(null);
      }
    },
    [output, downloadWav, downloadMp3]
  );

  // The 2000-char cap only applies to the owner-funded proxy. With the user's
  // own key there's no server cap — chunking still splits long text automatically.
  const overLimit = isCloud && !activeKey && text.length > CLOUD_CHAR_LIMIT;
  const canGenerate = !busy && !voicesLoading && !!voice && text.trim().length > 0 && !overLimit;

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
      {/* Controls */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <span className="text-eyebrow text-fg-faint">Engine</span>
          <EngineSelect value={engineId} onChange={setEngineId} disabled={busy} />
          <div className="flex items-start justify-between gap-3">
            <p className="flex items-start gap-2 text-xs text-fg-faint">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {isCloud
                ? activeKey && byokProvider
                  ? `Runs in the cloud with your API key — requests go straight from your browser to ${providerLabel(byokProvider)}.`
                  : "Runs in the cloud — free to use with fair-use limits. Word timing is aligned after generation."
                : `Runs on your device — the first use downloads the model (${meta.specs[1] ?? meta.specs[0]}), then it's cached and offline.`}
            </p>
            {byokProvider && (
              activeKey ? (
                <button
                  type="button"
                  onClick={() => setKeyDialogOpen(true)}
                  className="inline-flex shrink-0 items-center gap-1 rounded-pill bg-accent-weak px-2.5 py-1 text-[11px] font-medium text-accent transition-[filter] hover:brightness-110"
                >
                  <KeyRound className="h-3 w-3" /> Your key
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setKeyDialogOpen(true)}
                  className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-accent transition-[filter] hover:brightness-110"
                >
                  <KeyRound className="h-3 w-3" /> Use your own key
                </button>
              )
            )}
          </div>
        </div>

        <VoicePicker
          voices={voices}
          value={voice}
          onChange={setVoice}
          onPreview={handlePreview}
          previewLoadingId={previewLoadingId}
          previewPlayingId={previewPlayingId}
          loading={voicesLoading}
          disabled={busy}
        />

        <TextEditor
          value={text}
          onChange={setText}
          cloudLimit={isCloud && !activeKey ? CLOUD_CHAR_LIMIT : undefined}
          onInsertSample={() => setText(SAMPLE_TEXT)}
          disabled={busy}
        />

        {engine.supportsInstructions && (
          <InstructionsField value={instructions} onChange={setInstructions} disabled={busy} />
        )}

        <GenerateBar
          onGenerate={handleGenerate}
          onCancel={handleCancel}
          busy={busy}
          disabled={!canGenerate}
          progress={progress}
        />

        {error && (
          <div className="flex items-start gap-2 rounded-card border border-accent/40 bg-accent-weak p-3 text-sm text-fg">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <div className="flex flex-col gap-1.5">
              <span>{error}</span>
              {byokProvider && !activeKey && error.includes("isn't configured on the server") && (
                <button
                  type="button"
                  onClick={() => setKeyDialogOpen(true)}
                  className="inline-flex w-fit items-center gap-1 text-xs font-medium text-accent transition-[filter] hover:brightness-110"
                >
                  <KeyRound className="h-3 w-3" /> Use your own {providerLabel(byokProvider)} key
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Output */}
      <div className="lg:sticky lg:top-28 lg:self-start">
        {output ? (
          <Player
            output={output}
            actions={
              <DownloadMenu
                onWav={() => runExport("wav")}
                onMp3={() => runExport("mp3")}
                exporting={exporting}
              />
            }
          />
        ) : (
          <div
            className={clsx(
              "flex min-h-72 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line bg-surface/50 p-8 text-center",
              busy && "border-accent/40"
            )}
          >
            <AudioLines className={clsx("h-8 w-8", busy ? "animate-pulse text-accent" : "text-fg-faint")} />
            <p className="max-w-xs text-sm text-fg-muted">
              {busy
                ? "Generating your audio — the transcript will highlight word-by-word here."
                : "Your audio will appear here. Pick a voice, preview it, then generate."}
            </p>
            {busy && progress && <ProgressReadout progress={progress} className="mt-2 w-full max-w-xs" />}
            {busy && (
              <p className="max-w-xs text-xs text-fg-faint">
                First run downloads the model — this can take a moment on a slow connection, then it&rsquo;s cached.
              </p>
            )}
          </div>
        )}
      </div>

      {byokProvider && (
        <ApiKeyDialog
          provider={byokProvider}
          open={keyDialogOpen}
          onClose={() => setKeyDialogOpen(false)}
        />
      )}
    </div>
  );
}

function preview(err: unknown): string {
  const m = (err as Error)?.message ?? "Preview failed";
  return `Preview failed: ${m}`;
}
