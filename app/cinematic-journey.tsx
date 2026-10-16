"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowRight, Plus, Sparkle } from "@phosphor-icons/react";
import { cases } from "./content";
import { useExperience } from "./experience";

const clamp = (value:number,min=0,max=1) => Math.max(min,Math.min(max,value));
const words = ["Connect.", "Understand.", "Scale."];
const names = ["Banking", "Media", "Retail"];

export function TransformationJourney() {
  const root=useRef<HTMLElement>(null), canvas=useRef<HTMLCanvasElement>(null);
  const phase=useRef(0), pausedRef=useRef(false), impulse=useRef(0);
  const [active,setActive]=useState(0), [ready,setReady]=useState(false);
  const {paused}=useExperience();
  useEffect(()=>{pausedRef.current=paused;},[paused]);
  useEffect(()=>{
    const el=root.current; if(!el)return;
    let frame=0;
    const measure=()=>{frame=0; const rect=el.getBoundingClientRect(); const progress=clamp(-rect.top/Math.max(1,el.offsetHeight-innerHeight)); phase.current=progress*2.7; const selected=Math.min(2,Math.floor(progress*3)); setActive(selected); el.style.setProperty("--journey-progress",String(progress));};
    const request=()=>{if(!frame)frame=requestAnimationFrame(measure);};
    window.addEventListener("scroll",request,{passive:true}); window.addEventListener("resize",request);measure();
    return()=>{cancelAnimationFrame(frame);window.removeEventListener("scroll",request);window.removeEventListener("resize",request);};
  },[]);
  useEffect(()=>{
    const el=canvas.current,ctx=el?.getContext("2d");if(!el||!ctx)return;
    let w=1,h=1,dpr=1,frame=0,time=0,last=performance.now(),visible=false,rotation=0,targetRotation=0,tilt=0,targetTilt=0,dragging=false,lastX=0,dirty=true;
    const points=Array.from({length:2100},(_,i)=>{const y=1-i/2099*2,r=Math.sqrt(1-y*y),a=i*2.399963;const column=i%70,row=Math.floor(i/70);return {sphere:[Math.cos(a)*r,y,Math.sin(a)*r],wave:[(column/69-.5)*2.6,Math.sin(column*.12+row*.18)*.40+(row/29-.5)*.62,Math.cos(column*.08+row*.14)*.6],land:[(column/69-.5)*2.4,-.1-Math.sin(column*.1)*Math.cos(row*.19)*.65,(row/29-.5)*2.1],seed:(i*.618033)%1};});
    const resize=()=>{const r=el.getBoundingClientRect();w=r.width;h=r.height;dpr=Math.min(devicePixelRatio,1.5);el.width=w*dpr;el.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);dirty=true;};
    const ro=new ResizeObserver(resize);ro.observe(el);resize();
    const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;dirty=true;});io.observe(el);
    const move=(event:PointerEvent)=>{const rect=el.getBoundingClientRect();targetTilt=((event.clientY-rect.top)/rect.height-.5)*.32;if(dragging){targetRotation+=(event.clientX-lastX)*.009;lastX=event.clientX;}else targetRotation=((event.clientX-rect.left)/rect.width-.5)*.65;dirty=true;};
    const down=(event:PointerEvent)=>{dragging=true;lastX=event.clientX;el.setPointerCapture(event.pointerId);el.style.cursor="grabbing";};
    const up=()=>{dragging=false;el.style.cursor="grab";};
    el.addEventListener("pointermove",move);el.addEventListener("pointerdown",down);el.addEventListener("pointerup",up);el.addEventListener("pointercancel",up);
    let lastPhase=-1,hasReady=false;
    const draw=(now:number)=>{
      frame=requestAnimationFrame(draw);const dt=Math.min((now-last)/1000,.045);last=now;if(!visible||document.hidden)return;
      const p=clamp(phase.current,0,2);if(pausedRef.current&&!dirty&&lastPhase===p)return;dirty=false;lastPhase=p;
      if(!pausedRef.current)time+=dt;rotation+=(targetRotation-rotation)*.06;tilt+=(targetTilt-tilt)*.06;impulse.current*=.94;
      ctx.clearRect(0,0,w,h);const mobile=w<760,scale=Math.min(w*(mobile?.38:.24),h*.42),cx=w*(mobile?.5:.69),cy=h*(mobile?.30:.48);
      const blend=clamp((p%1-.12)/.76),smooth=blend*blend*(3-2*blend),segment=Math.floor(p);
      const yaw=time*.08+rotation,cos=Math.cos(yaw),sin=Math.sin(yaw),pitch=-.18+tilt;
      const projected=points.map(point=>{const from=segment===0?point.sphere:point.wave,to=segment===0?point.wave:point.land,k=p>=2?1:smooth;let [x,y,z]=from.map((v,j)=>v+(to[j]-v)*k);const pulse=Math.sin(time*.6+x*4+z*3)*.025;y+=pulse;
        const burst=pausedRef.current?0:impulse.current*(.3+point.seed);x*=1+burst;y*=1+burst;z*=1+burst;
        const rx=x*cos+z*sin,rz=z*cos-x*sin,ry=y*Math.cos(pitch)-rz*Math.sin(pitch),depth=rz*Math.cos(pitch)+y*Math.sin(pitch),perspective=3.5/(3.5-depth);
        return {x:cx+rx*scale*perspective,y:cy+ry*scale*perspective,z:depth,size:(.7+point.seed*.85)*perspective};});
      const colors=[[171,216,246],[204,229,187],[240,201,161]],c1=colors[Math.min(1,segment)],c2=colors[Math.min(2,segment+1)],k=p>=2?1:smooth,rgb=c1.map((v,i)=>Math.round(v+(c2[i]-v)*k)).join(",");
      ctx.lineWidth=.5;
      for(let i=0;i<projected.length;i++){const q=projected[i];ctx.fillStyle=`rgba(${rgb},${clamp(.36+(q.z+1)*.22,.18,.9)})`;ctx.beginPath();ctx.arc(q.x,q.y,q.size,0,Math.PI*2);ctx.fill();if(i%70!==69&&i%2===0){const next=projected[i+1];if(Math.hypot(next.x-q.x,next.y-q.y)<scale*.12){ctx.strokeStyle=`rgba(${rgb},.19)`;ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(next.x,next.y);ctx.stroke();}}}
      if(!hasReady){hasReady=true;setReady(true);}
    };frame=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(frame);ro.disconnect();io.disconnect();el.removeEventListener("pointermove",move);el.removeEventListener("pointerdown",down);el.removeEventListener("pointerup",up);el.removeEventListener("pointercancel",up);};
  },[]);
  function jump(index:number){const el=root.current;if(!el)return;const y=el.getBoundingClientRect().top+scrollY+(el.offsetHeight-innerHeight)*(index/3+.045);window.scrollTo({top:y,behavior:paused?"instant":"smooth"});}
  return <section ref={root} id="work" className="transformation-journey" aria-label="Selected transformation stories" data-scene={active}>
    {cases.map((item,i)=><span className="scene-anchor" id={`case-${i+1}`} key={item.title} style={{top:`${i/3*100}%`}} />)}
    <div className="journey-window">
      <canvas ref={canvas} className={`journey-canvas ${ready?"ready":""}`} aria-hidden="true" />
      <div className="journey-heading"><h2>Decisions that<br />change the business.</h2><span>Enterprise work anonymized.</span></div>
      <div className="journey-word" aria-hidden="true" key={active}>{words[active]}</div>
      <div className="journey-stories">{cases.map((item,i)=><article key={item.title} className={`journey-story ${active===i?"active":""}`} aria-hidden={active!==i} inert={active!==i}>
        <h3>{item.title}</h3><p className="journey-sector">{item.kicker}</p><p>{item.description}</p>
        <details className="journey-details"><summary>Inside the decision <Plus /></summary><div><h4>My ownership</h4><p>{item.ownership}</p><h4>The context</h4><p>{item.context}</p><h4>The decision</h4><p>{item.decision}</p><h4>What changed</h4><p>{item.change}</p><ul>{item.proof.map(text=><li key={text}>{text}</li>)}</ul></div></details>
      </article>)}</div>
      <button className="signal-play" onClick={()=>{impulse.current=1.8;}} disabled={paused}><Sparkle /><span>Disrupt the signal</span></button>
      <span className="journey-instruction">Drag to explore the form</span>
      <div className="journey-bottom"><nav aria-label="Select a transformation">{names.map((name,i)=><button key={name} aria-current={active===i?"step":undefined} onClick={()=>jump(i)}><span>{name}</span><ArrowRight /></button>)}</nav><a href="#leadership" className="journey-next">Keep exploring <ArrowDown /></a></div>
    </div>
  </section>;
}

export function ProductJourney({children}:{children:ReactNode}) {
  const ref=useRef<HTMLElement>(null);
  const {paused}=useExperience();
  useEffect(()=>{const el=ref.current;if(!el)return;let frame=0;const update=()=>{frame=0;const p=clamp(-el.getBoundingClientRect().top/Math.max(1,el.offsetHeight-innerHeight));el.style.setProperty("--product-progress",String(p));el.querySelectorAll<HTMLElement>(".product-feature").forEach((item,index)=>{item.inert=!paused&&index!==Math.round(p);});};const request=()=>{if(!frame)frame=requestAnimationFrame(update);};window.addEventListener("scroll",request,{passive:true});window.addEventListener("resize",request);update();return()=>{cancelAnimationFrame(frame);window.removeEventListener("scroll",request);window.removeEventListener("resize",request);};},[paused]);
  return <section ref={ref} className="products product-journey" id="products" aria-labelledby="products-title"><div className="product-window">{children}</div></section>;
}
