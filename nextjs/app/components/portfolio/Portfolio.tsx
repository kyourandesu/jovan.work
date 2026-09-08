"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowDown, ArrowUp, ArrowUpRight, Asterisk, Code2, Sparkles, Smile, X } from "lucide-react";
import { ABOUT, CAPABILITIES, CASE_STUDY, EXPERIENCES, PROJECTS, SITE, STATS, type Project } from "../../lib/content";
import styles from "./portfolio.module.css";

const sections = [
  { id: "top", label: "hello" },
  { id: "about", label: "about" },
  { id: "experience", label: "experience" },
  { id: "work", label: "projects" },
  { id: "contact", label: "say hi" },
];

const heroPhotos = [
  {
    src: "/jovan-mountains.jpg",
    alt: "Jovan standing in front of a mountain landscape",
    position: "50% 63%",
  },
  {
    src: "/jovan-cafe.webp",
    alt: "Jovan sitting in a warmly lit cafe",
    position: "50% 40%",
  },
  {
    src: "/jovan-conversation.jpg",
    alt: "Jovan seated with a microphone in front of a whiteboard",
    position: "50% 75%",
  },
];

const sides = [
  { label: "the developer", icon: Code2, title: "Making things that make life a little easier.", text: "From the first idea to the last little UI detail, I love turning a tricky problem into something people can actually use. I work across the stack — and I’m happiest when the thing I built finds its people.", skills: CAPABILITIES[0].items },
  { label: "the AI tinkerer", icon: Sparkles, title: "One more experiment. Just one more.", text: "Reinforcement-learning agents, neural networks, and the occasional rabbit hole. I like getting my hands dirty with AI, figuring out why it works, and finding somewhere useful to put it.", skills: [...CAPABILITIES[1].items, ...CAPABILITIES[2].items.slice(0, 3)] },
  { label: "the human", icon: Smile, title: "Still curious. Still figuring things out.", text: "I’m Jovan, a developer based in Singapore, headed to NUS Business AI Systems. I build to learn, and learn to build better. Hackathons, side projects, and good conversations tend to be where the next idea starts.", skills: ["Singapore", "NUS Business AI Systems", "learning by doing", "side quests", "good conversations"] },
];

function NextSection({ href, children }: { href: string; children: React.ReactNode }) {
  return <a className={styles.nextSection} href={href}><span>{children}</span><ArrowDown size={17} aria-hidden="true" /></a>;
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <article className={styles.projectCard}>
      <div className={styles.projectMeta}><span>{project.category}</span><span>{String(index + 1).padStart(2, "0")}</span></div>
      <h3>{project.title}</h3>
      <p>{project.desc}</p>
      <div className={styles.tags}>{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
      <div className={styles.projectLinks}>
        {project.link && <a href={project.link} target="_blank" rel="noopener noreferrer" aria-label={`Try ${project.title}`}>try it out <ArrowUpRight size={15} aria-hidden="true" /></a>}
        {project.code && <a href={project.code} target="_blank" rel="noopener noreferrer" aria-label={`${project.title} source code`}>the code <ArrowUpRight size={15} aria-hidden="true" /></a>}
        {project.submission && <a href={project.submission} target="_blank" rel="noopener noreferrer" aria-label={`${project.title} Devpost submission`}>submission <ArrowUpRight size={15} aria-hidden="true" /></a>}
        {!project.link && !project.code && !project.submission && <span className={styles.projectNote}>a little learning adventure</span>}
      </div>
    </article>
  );
}

export default function Portfolio() {
  const [active, setActive] = useState("top");
  const [side, setSide] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuButton = useRef<HTMLButtonElement>(null);
  const currentSide = sides[side];
  const SideIcon = currentSide.icon;

  useEffect(() => {
    // A narrow band keeps tall sections active while their content is read.
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) setActive(entry.target.id);
      }
    }, { rootMargin: "-18% 0px -62% 0px", threshold: 0 });
    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  function changeTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % sides.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + sides.length) % sides.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = sides.length - 1;
    else return;
    event.preventDefault();
    setSide(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <div className={styles.portfolio}>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <header className={styles.header} onKeyDown={event => {
        if (event.key === "Escape" && menuOpen) {
          setMenuOpen(false);
          menuButton.current?.focus();
        }
      }}>
        <nav className={styles.nav} aria-label="Main navigation">
          <a href="#top" className={styles.wordmark} onClick={() => setMenuOpen(false)}>jovan<span>.work</span><Asterisk size={18} aria-hidden="true" /></a>
          <button className={styles.menuButton} ref={menuButton} aria-expanded={menuOpen} aria-controls="portfolio-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <>close <X size={15} aria-hidden="true" /></> : "menu +"}</button>
          <div id="portfolio-navigation" className={`${styles.navLinks} ${menuOpen ? styles.menuOpen : ""}`}>
            {sections.slice(1).map(section => <a key={section.id} href={`#${section.id}`} aria-current={active === section.id ? "location" : undefined} onClick={() => setMenuOpen(false)}>{section.label}{section.id === "contact" && <ArrowUpRight size={14} aria-hidden="true" />}</a>)}
          </div>
        </nav>
      </header>

      <main id="main-content" tabIndex={-1}>
        <section id="top" tabIndex={-1} className={`${styles.section} ${styles.hero}`} aria-labelledby="hello-heading">
          <div className={styles.heroLayout}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}><span className={styles.locationDot} /> Singapore · developer & curious human</p>
              <h1 id="hello-heading">hey, I’m <em>Jovan.</em><span className={styles.helloStar} aria-hidden="true">✳</span></h1>
              <p className={styles.heroSubtitle}>a little curious.<br />always <span>building something.</span></p>
              <p className={styles.heroDescription}>I turn AI ideas into things people can use.<br />Welcome to my little corner of the internet.</p>
              <a href="#work" className={styles.textLink}>take a look around <ArrowUpRight size={18} aria-hidden="true" /></a>
            </div>

            <div className={styles.photoArea}>
              <span className={styles.photoAnnotation}>the human behind the code ↴</span>
              <button
                type="button"
                className={styles.polaroid}
                onClick={() => setPhotoIndex(index => (index + 1) % heroPhotos.length)}
                aria-label="Show next photo of Jovan"
                aria-describedby="hero-photo-status"
              >
                <span className={styles.tape} aria-hidden="true" />
                <span className={styles.photoFrame}>
                  <span className={styles.photoImage}>
                    {heroPhotos.map((photo, index) => (
                      <Image
                        key={photo.src}
                        src={photo.src}
                        alt={photo.alt}
                        aria-hidden={index !== photoIndex}
                        fill
                        priority={index === 0}
                        loading={index === 0 ? undefined : "eager"}
                        sizes="(max-width: 600px) 246px, (min-width: 1500px) 365px, 338px"
                        className={`${styles.photoSlide} ${index === photoIndex ? styles.photoActive : ""}`}
                        style={{ objectPosition: photo.position }}
                      />
                    ))}
                  </span>
                  <span className={styles.photoCaption}>click me <Smile size={17} aria-hidden="true" /></span>
                </span>
              </button>
              <span id="hero-photo-status" className={styles.photoHint} role="status">psst… give the photo a tap · {photoIndex + 1} / {heroPhotos.length}</span>
            </div>
          </div>
          <div className={styles.heroBottom}><span className={styles.smallNote}>a work in progress, just like me.</span><NextSection href="#about">a little about me</NextSection><span className={styles.edition}>portfolio / 2026</span></div>
        </section>

        <section id="about" tabIndex={-1} className={`${styles.section} ${styles.about}`} aria-labelledby="about-heading">
          <div className={styles.sectionInner}>
            <p className={styles.eyebrow}>01 / a little introduction</p>
            <h2 id="about-heading">A few sides of <em>me.</em></h2>
            <div className={styles.aboutLayout}>
              <div>
                <div className={styles.tabs} role="tablist" aria-label="Get to know Jovan">
                  {sides.map(({ label, icon: Icon }, index) => <button key={label} ref={element => { tabRefs.current[index] = element; }} id={`side-tab-${index}`} role="tab" aria-selected={side === index} aria-controls="side-panel" tabIndex={side === index ? 0 : -1} onClick={() => setSide(index)} onKeyDown={event => changeTab(event, index)}><Icon size={16} aria-hidden="true" />{label}</button>)}
                </div>
                <div id="side-panel" role="tabpanel" aria-labelledby={`side-tab-${side}`} tabIndex={0} className={styles.aboutPanel}>
                  <SideIcon className={styles.aboutIcon} size={30} aria-hidden="true" />
                  <h3>{currentSide.title}</h3>
                  <p>{currentSide.text}</p>
                  <div className={styles.skillStickers} aria-label="Skills and interests">{currentSide.skills.map((skill, index) => <span key={skill} style={{ rotate: `${[ -3, 2, -1, 3, 0 ][index % 5]}deg` }}>{skill}</span>)}</div>
                </div>
              </div>
              <aside className={styles.noteCard}>
                <span className={styles.tape} aria-hidden="true" />
                <span className={styles.noteLabel}>a few things along the way</span>
                <div className={styles.stats}>{STATS.map(stat => <div key={stat.label}><strong>{stat.value.toLocaleString("en-SG")}{stat.suffix}</strong><span>{stat.label.toLowerCase()}</span></div>)}</div>
                <p>learning by doing,<br /><em>one project at a time.</em></p>
                <Asterisk className={styles.noteStar} size={45} strokeWidth={1} aria-hidden="true" />
              </aside>
            </div>
          </div>
          <NextSection href="#experience">where I’ve been building</NextSection>
        </section>

        <section id="experience" tabIndex={-1} className={`${styles.section} ${styles.experience}`} aria-labelledby="experience-heading">
          <div className={styles.sectionInner}>
            <p className={styles.eyebrow}>02 / the journey so far</p>
            <div className={styles.sectionHeading}><h2 id="experience-heading">Good people.<br /><em>Interesting problems.</em></h2><p>Some places I’ve learned,<br />built, and figured things out.</p></div>
            <div className={styles.experienceList}>{EXPERIENCES.map((experience, index) => <article key={experience.company} className={styles.experienceRow}>
              <span className={styles.experienceNumber}>0{index + 1}</span>
              <div className={styles.experienceTitle}><h3>{experience.company}</h3><p>{experience.role}</p><span>{experience.period}</span></div>
              <div className={styles.experienceDetail}><p>{experience.desc}</p><div className={styles.tags}>{experience.skills.map(skill => <span key={skill}>{skill}</span>)}</div>{experience.link && <a className={styles.textLink} href={experience.link.href} target="_blank" rel="noopener noreferrer">{experience.link.label}<ArrowUpRight size={15} aria-hidden="true" /></a>}</div>
            </article>)}</div>
          </div>
          <NextSection href="#work">the things I’ve made</NextSection>
        </section>

        <section id="work" tabIndex={-1} className={`${styles.section} ${styles.work}`} aria-labelledby="work-heading">
          <div className={styles.sectionInner}>
            <p className={styles.eyebrow}>03 / made with curiosity</p>
            <div className={styles.sectionHeading}><h2 id="work-heading">Things I’ve <em>put into the world.</em></h2><p>Big ideas, weekend experiments,<br />and a few happy accidents.</p></div>
            <article className={styles.featured}>
              <div className={styles.featuredMark}><span>’Sup<span className={styles.supStar}>✳</span></span><span>your next chapter starts here.</span></div>
              <div className={styles.featuredCopy}><span className={styles.eyebrow}>a project close to my heart</span><h3>From “what if” to 2,000+ users.</h3><p>{CASE_STUDY.headline} As CTO, I led eight developers and built across the whole stack.</p><div className={styles.tags}>{CASE_STUDY.tags.map(tag => <span key={tag}>{tag}</span>)}</div><a className={styles.textLink} href={CASE_STUDY.link.href} target="_blank" rel="noopener noreferrer">{CASE_STUDY.link.label} <ArrowUpRight size={17} aria-hidden="true" /></a></div>
            </article>
            <div className={styles.projectGrid}>{PROJECTS.slice(0, 6).map((project, index) => <ProjectCard project={project} index={index} key={project.title} />)}</div>
            <button className={styles.moreButton} aria-expanded={expanded} aria-controls="more-projects" onClick={() => setExpanded(!expanded)}>{expanded ? "a little less" : `there’s more in the notebook (${PROJECTS.length - 6})`}<span aria-hidden="true">{expanded ? "−" : "+"}</span></button>
            <div id="more-projects" className={styles.projectGrid} hidden={!expanded}>{PROJECTS.slice(6).map((project, index) => <ProjectCard project={project} index={index + 6} key={project.title} />)}</div>
            <div className={styles.achievements}>
              <span className={styles.eyebrow}>a few happy milestones</span>
              <div>
                {ABOUT.achievements.map(item => (
                  <p key={item.title}>
                    <Asterisk size={16} aria-hidden="true" />
                    {item.href ? (
                      <a href={item.href} target="_blank" rel="noopener noreferrer">
                        {item.title} <ArrowUpRight size={14} aria-hidden="true" />
                      </a>
                    ) : <span>{item.title}</span>}
                    <span>{item.year}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
          <NextSection href="#contact">your turn</NextSection>
        </section>

        <section id="contact" tabIndex={-1} className={`${styles.section} ${styles.contact}`} aria-labelledby="contact-heading">
          <div className={styles.contactInner}>
            <span className={styles.contactStar} aria-hidden="true">✳</span>
            <p className={styles.eyebrow}>04 / good things start with a hello</p>
            <h2 id="contact-heading">Got a little <em>idea?</em></h2>
            <p>A project, a hackathon, or a conversation about something cool.<br />I’m always up for building something together.</p>
            <a className={styles.emailLink} href={`mailto:${SITE.email}`}>let’s talk <ArrowUpRight aria-hidden="true" /></a>
            <div className={styles.socials}><a href={SITE.github} target="_blank" rel="noopener noreferrer">github <ArrowUpRight size={15} aria-hidden="true" /></a><a href={SITE.linkedin} target="_blank" rel="noopener noreferrer">linkedin <ArrowUpRight size={15} aria-hidden="true" /></a><a href={`mailto:${SITE.email}`}>email <ArrowUpRight size={15} aria-hidden="true" /></a></div>
          </div>
          <footer className={styles.footer}><span>© {new Date().getFullYear()} Jovan Tan</span><span>built with curiosity & a lot of little iterations.</span><a href="#top">back to top <ArrowUp size={14} aria-hidden="true" /></a></footer>
        </section>
      </main>
      <nav className={styles.sectionDots} aria-label="Section shortcuts">{sections.map(section => <a key={section.id} href={`#${section.id}`} aria-label={section.label} aria-current={active === section.id ? "location" : undefined}><span>{section.label}</span></a>)}</nav>
    </div>
  );
}
