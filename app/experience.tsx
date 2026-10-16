"use client";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUpRight, Pause, Play, SpeakerHigh, SpeakerSlash, ArrowClockwise } from "@phosphor-icons/react";
import { createPortrait, type PortraitController } from "./particle-engine";

type ExperienceState = { paused: boolean; sound: boolean; loading: boolean; toggleSound: () => void };
const ExperienceContext = createContext<ExperienceState>({ paused: false, sound: false, loading: false, toggleSound() {} });
export function useExperience() { return useContext(ExperienceContext); }

export function Experience({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false), [sound, setSound] = useState(false), [loading, setLoading] = useState(false), [error, setError] = useState(false);
  const tracks = useRef<HTMLAudioElement[]>([]);
  const audioState = useRef({ enabled: false, active: 0, fading: false });
  const busy = useRef(false);
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPaused(reduced.matches); update(); reduced.addEventListener("change", update);
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), { threshold: .08 });
    document.querySelectorAll("[data-reveal]").forEach(item => observer.observe(item));
    const progress = () => document.documentElement.style.setProperty("--page-progress", String(scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)));
    window.addEventListener("scroll", progress, { passive: true }); progress();
    return () => { reduced.removeEventListener("change", update); observer.disconnect(); window.removeEventListener("scroll", progress); };
  }, []);
  useEffect(() => { document.documentElement.dataset.motion = paused ? "paused" : "on"; }, [paused]);
  useEffect(() => {
    const first = new Audio("/audio/signal-to-scale.mp3"), second = new Audio("/audio/signal-to-scale.mp3");
    first.preload = "none"; second.preload = "none"; first.volume = .2; second.volume = 0; tracks.current = [first, second];
    let frame = 0;
    const tick = () => {
      const state = audioState.current;
      if (!state.enabled || state.fading || document.hidden) return;
      const current = tracks.current[state.active];
      if (Number.isFinite(current.duration) && current.duration - current.currentTime < 4.2) {
        const nextIndex = 1 - state.active, next = tracks.current[nextIndex]; next.currentTime = 0; next.volume = 0; state.fading = true;
        void next.play().then(() => {
          if (!state.enabled || document.hidden) { next.pause(); state.fading = false; return; }
          const start = performance.now();
          const fade = (now: number) => {
            if (!state.enabled || document.hidden) { state.fading = false; return; }
            const p = Math.min((now - start) / 4000, 1);
            current.volume = Math.cos(p * Math.PI / 2) * .2; next.volume = Math.sin(p * Math.PI / 2) * .2;
            if (p < 1) frame = requestAnimationFrame(fade);
            else { current.pause(); current.currentTime = 0; state.active = nextIndex; state.fading = false; }
          }; frame = requestAnimationFrame(fade);
        }).catch(() => { state.fading = false; current.loop = true; });
      }
    };
    first.addEventListener("timeupdate", tick); second.addEventListener("timeupdate", tick);
    const visibility = () => {
      cancelAnimationFrame(frame); first.pause(); second.pause(); audioState.current.fading = false;
      if (!document.hidden && audioState.current.enabled) { const active = tracks.current[audioState.current.active]; active.volume = .2; void active.play().catch(() => { audioState.current.enabled = false; setSound(false); }); }
    };
    document.addEventListener("visibilitychange", visibility);
    return () => { cancelAnimationFrame(frame); first.pause(); second.pause(); first.removeEventListener("timeupdate", tick); second.removeEventListener("timeupdate", tick); document.removeEventListener("visibilitychange", visibility); tracks.current = []; };
  }, []);
  const toggleSound = async () => {
    if (busy.current || !tracks.current.length) return;
    if (audioState.current.enabled) { audioState.current.enabled = false; tracks.current.forEach(track => track.pause()); setSound(false); return; }
    busy.current = true; setLoading(true); setError(false);
    try { const track = tracks.current[audioState.current.active]; track.volume = .2; await track.play(); audioState.current.enabled = true; setSound(true); }
    catch { setError(true); } finally { busy.current = false; setLoading(false); }
  };
  return <ExperienceContext.Provider value={{ paused, sound, loading, toggleSound }}>
    {children}
    <div className="experience-controls" aria-label="Experience controls" data-sound={sound ? "on" : "off"}>
      <button className="motion-toggle" onClick={() => setPaused(value => !value)} aria-label={paused ? "Enable motion" : "Pause motion"} aria-pressed={paused} title={paused ? "Enable motion" : "Pause motion"}>{paused ? <Play /> : <Pause />}</button>
      <button className={`sound-toggle ${sound ? "is-playing" : ""}`} onClick={toggleSound} disabled={loading} aria-pressed={sound} aria-label={sound ? "Mute soundtrack" : "Play soundtrack"}><span className="sound-bars" aria-hidden="true"><i /><i /><i /><i /><i /></span><span>{loading ? "Loading" : error ? "Retry sound" : sound ? "Sound on" : "Sound off"}</span></button>
    </div><p className="sr-only" role="status">{error ? "Soundtrack unavailable. Retry using the sound control." : ""}</p>
  </ExperienceContext.Provider>;
}
export function SoundEntry() {
  const { sound, loading, toggleSound } = useContext(ExperienceContext);
  return <button className="sound-entry" onClick={toggleSound} disabled={loading} aria-pressed={sound}><span className="circle-icon">{sound ? <SpeakerSlash /> : <SpeakerHigh />}</span><span>{loading ? "Preparing the soundtrack…" : sound ? "Mute soundtrack" : "Enter with sound"}</span></button>;
}
export function PortraitStage() {
  const canvas = useRef<HTMLCanvasElement>(null), stage = useRef<HTMLDivElement>(null), controller = useRef<PortraitController | null>(null);
  const [ready, setReady] = useState(false); const { paused } = useContext(ExperienceContext);
  useEffect(() => {
    let mounted = true; const image = new Image(); image.src = "/assets/plates/portrait.png";
    image.onload = () => { if (!mounted || !canvas.current) return; controller.current = createPortrait(canvas.current, image, () => setReady(true), () => setReady(false)); controller.current?.setPaused(matchMedia("(prefers-reduced-motion: reduce)").matches); };
    const scroll = () => { const parent = stage.current?.closest<HTMLElement>(".hero"); if (!parent) return; const p = Math.max(0, -parent.getBoundingClientRect().top / Math.max(1, parent.offsetHeight - innerHeight)); controller.current?.setScroll(p); stage.current?.parentElement?.style.setProperty("--hero-progress", String(Math.min(p, 1))); };
    window.addEventListener("scroll", scroll, { passive: true });
    return () => { mounted = false; controller.current?.destroy(); window.removeEventListener("scroll", scroll); };
  }, []);
  useEffect(() => { controller.current?.setPaused(paused); }, [paused, ready]);
  return <div ref={stage} className={`portrait-stage ${ready ? "portrait-ready" : ""}`}>
    <img className="portrait-fallback" src="/assets/plates/portrait.png" alt="Dhiraj Raikantiwar" /><canvas ref={canvas} className="portrait-canvas" aria-hidden="true" />
    <svg className="signal-threads" viewBox="0 0 1600 1000" fill="none" preserveAspectRatio="none" aria-hidden="true">{Array.from({ length: 22 }, (_, i) => { const d = `M ${-180 + i * 9} ${890 + i * 9} C ${550 + i * 8} ${840 - i * 13}, ${1110 - i * 8} ${810 - i * 9}, 1730 ${90 + i * 30}`; return <g key={i}><path className="thread-base" d={d} stroke="currentColor" strokeWidth={i % 4 === 0 ? 1 : .5} /><path className="thread-highlight" d={d} stroke="currentColor" strokeWidth={i % 4 === 0 ? 1.5 : .8} pathLength="1" /></g>; })}</svg>
    <button className="replay-portrait" onClick={() => controller.current?.replay()} disabled={paused || !ready} aria-label="Replay portrait assembly"><ArrowClockwise /><span>Reassemble</span></button>
  </div>;
}
export function MagneticLink({ children, href, className = "", external = false }: { children: ReactNode; href: string; className?: string; external?: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null); const { paused } = useContext(ExperienceContext);
  return <a ref={ref} href={href} className={`magnetic-link ${className}`} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} onPointerMove={event => { if (paused || event.pointerType !== "mouse" || !ref.current) return; const r = ref.current.getBoundingClientRect(); ref.current.style.setProperty("--mx", `${(event.clientX - r.left - r.width / 2) * .12}px`); ref.current.style.setProperty("--my", `${(event.clientY - r.top - r.height / 2) * .14}px`); }} onPointerLeave={() => { ref.current?.style.setProperty("--mx", "0px"); ref.current?.style.setProperty("--my", "0px"); }}>{children}</a>;
}
export function ScrollCue() { return <a className="scroll-cue" href="#about"><span>Scroll to my career</span><ArrowDown /></a>; }
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  return <div className="mobile-nav"><button aria-expanded={open} aria-controls="mobile-links" onClick={() => setOpen(!open)}>{open ? "Close" : "Menu"}<span className={open ? "menu-lines open" : "menu-lines"}><i /><i /></span></button><nav id="mobile-links" hidden={!open} aria-label="Mobile navigation">{[["Career journey", "#about"], ["Selected work", "#work"], ["Executive Series", "#executive-series"], ["Multimodal AI album", "#experimentation"], ["Contact", "#contact"]].map(([label, href]) => <a href={href} key={label} onClick={() => setOpen(false)}>{label}<ArrowUpRight /></a>)}</nav></div>;
}
export function ChapterVisual({ mode }: { mode: "banking" | "media" | "retail" }) {
  const ref = useRef<HTMLCanvasElement>(null), pauseRef = useRef(false); const { paused } = useContext(ExperienceContext);
  useEffect(() => { pauseRef.current = paused; }, [paused]);
  useEffect(() => {
    const canvas = ref.current, ctx = canvas?.getContext("2d"); if (!canvas || !ctx) return;
    let w = 0, h = 0, frame = 0, time = 0, last = performance.now(), visible = false;
    const resize = () => { const r = canvas.getBoundingClientRect(); w = r.width; h = r.height; const dpr = Math.min(devicePixelRatio, 1.5); canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const ro = new ResizeObserver(resize); ro.observe(canvas); resize(); const io = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }); io.observe(canvas);
    const draw = (now: number) => {
      frame = requestAnimationFrame(draw); const dt = Math.min((now - last) / 1000, .05); last = now;
      if (!visible || document.hidden) return; if (!pauseRef.current) time += dt; ctx.clearRect(0, 0, w, h); const scale = Math.min(w, h) * .38;
      if (mode === "banking") {
        const nodes: { x: number; y: number; z: number }[] = [];
        for (let i = 0; i < 240; i++) { const y = 1 - i / 239 * 2, r = Math.sqrt(1 - y * y), a = i * 2.39996 + time * .09; nodes.push({ x: Math.cos(a) * r, y, z: Math.sin(a) * r }); }
        nodes.forEach((p, i) => { const x = w / 2 + p.x * scale, y = h / 2 + p.y * scale; ctx.fillStyle = `rgba(189,224,245,${.3 + (p.z + 1) * .34})`; ctx.beginPath(); ctx.arc(x, y, 1.2 + (p.z + 1) * .7, 0, Math.PI * 2); ctx.fill(); for (let j = i + 1; j < Math.min(i + 18, nodes.length); j++) { const q = nodes[j], d = Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z); if (d < .36) { ctx.strokeStyle = `rgba(111,174,212,${(.36 - d) * .6})`; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(w / 2 + q.x * scale, h / 2 + q.y * scale); ctx.stroke(); } } });
      } else if (mode === "media") {
        for (let line = 0; line < 38; line++) { ctx.beginPath(); ctx.strokeStyle = `rgba(230,237,213,${.2 + line / 70})`; ctx.lineWidth = .8; for (let x = 0; x < 100; x++) { const p = x / 99, y = Math.sin(p * 12 + time * .6 + line * .1) * Math.sin(p * 4 + time * .22) * scale * .4 * Math.sin(p * Math.PI), px = w * .06 + p * w * .88, py = h * .29 + line * h * .012 + y; if (x === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); } ctx.stroke(); }
      } else {
        for (let z = 0; z < 24; z++) for (let x = 0; x < 28; x++) { const height = (Math.sin(x * .18 + time * .4) * Math.cos(z * .2 - time * .2) + 1) * scale * .18, px = w / 2 + (x - z - 2) * scale * .033, py = h * .54 + (x + z - 24) * scale * .018 - height; ctx.strokeStyle = `rgba(241,214,186,${.28 + height / scale})`; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py + height * .8 + 7); ctx.stroke(); ctx.fillStyle = "#f1d6ba"; ctx.fillRect(px - 1, py - 1, 2, 2); }
      }
    }; frame = requestAnimationFrame(draw); return () => { cancelAnimationFrame(frame); ro.disconnect(); io.disconnect(); };
  }, [mode]);
  return <canvas ref={ref} className={`chapter-canvas ${mode}`} aria-hidden="true" />;
}
