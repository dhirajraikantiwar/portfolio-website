// GPU-driven portrait assembly. All coordinates animate in shaders; React never
// handles per-frame state. The original, user-supplied portrait supplies the data.
export type PortraitController = { setScroll: (value: number) => void; setPaused: (value: boolean) => void; replay: () => void; destroy: () => void };

const vertex = `
precision highp float;
attribute vec3 aTarget;
attribute vec3 aColor;
attribute vec3 aRandom;
attribute float aKind;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uTime;
uniform float uAssembly;
uniform float uScroll;
uniform float uPixelRatio;
uniform float uMobile;
varying vec4 vColor;
void main() {
  float ratio = uResolution.x / uResolution.y;
  float portraitHeight = mix(1.10, .64, uMobile);
  vec2 center = mix(vec2(.72, .52), vec2(.60, .79), uMobile);
  vec3 point = aTarget;
  float t = uTime;
  float breakup = smoothstep(.12, .94, uScroll);
  float assembly = smoothstep(aRandom.z * .25, .78 + aRandom.z * .2, uAssembly);
  vec2 target = vec2(point.x * portraitHeight / ratio, point.y * portraitHeight) + center;
  vec2 drift = vec2(sin(t*.24 + point.y*7.0), cos(t*.19 + point.x*6.0)) * .002;
  float angle = aRandom.x * 6.28318 + t*.055;
  float radius = .2 + aRandom.y*.78;
  vec2 scatter = vec2(cos(angle)*radius/ratio, sin(angle)*radius*.6) + vec2(.52,.52);
  scatter.x += sin(scatter.y*7.0 + t*.15)*.11;
  vec2 pos = mix(scatter, target + drift, assembly * (1.0-breakup));
  pos += vec2((uPointer.x-.5)*.015, (uPointer.y-.5)*.009) * point.z;
  vec2 delta = pos-uPointer;
  delta.x *= ratio;
  float distance = length(delta);
  float force = exp(-distance*distance*95.0) * .04 * assembly;
  vec2 direction = delta/max(distance,.001);
  pos += vec2(direction.x/ratio, direction.y)*force;
  float opacity = .90 * (1.0 - smoothstep(.12,.52,point.y)*.56);
  float size = mix(3.8, 2.0, uMobile) * uPixelRatio;
  vec3 color = min(aColor * 1.18, vec3(1.0));
  if(aKind > 1.5) {
    pos += vec2(sin(t*.19 + point.y*13.0)*.018/ratio, cos(t*.12+aRandom.x*6.0)*.014);
    opacity = (.26+aRandom.z*.66)*(1.0-breakup*.4);
    color = mix(vec3(.30,.52,.68),vec3(.87,.92,.95),aRandom.z);
    size = (1.0+pow(aRandom.z,3.0)*2.7)*uPixelRatio;
  } else if(aKind > .5) {
    float theta = aRandom.x*6.28318 + t*.035;
    float r = .38 + aRandom.y*.65;
    pos = vec2(cos(theta)*r/ratio, sin(theta)*r*.39) + center;
    pos.x += sin(theta*2.0+t*.1)*.18;
    pos.y += cos(theta*3.0+t*.12)*.075;
    opacity = (.14 + aRandom.z*.55) * (1.0-breakup*.6);
    color = mix(vec3(.32,.55,.72), vec3(.82,.88,.91), aRandom.z);
    size = (.8 + pow(aRandom.z,3.0)*3.2)*uPixelRatio;
  }
  float shimmer = .91 + .09*sin(t*.8+aRandom.x*40.0);
  gl_Position = vec4(pos.x*2.0-1.0, 1.0-pos.y*2.0, 0.0, 1.0);
  gl_PointSize = size;
  vColor = vec4(color * shimmer, opacity);
}`;

const fragment = `
precision mediump float;
varying vec4 vColor;
void main() {
  float d = length(gl_PointCoord-vec2(.5));
  float alpha = 1.0-smoothstep(.25,.5,d);
  gl_FragColor = vec4(vColor.rgb, vColor.a*alpha);
}`;

export function createPortrait(canvas: HTMLCanvasElement, image: HTMLImageElement, onReady: () => void, onFailure?: () => void): PortraitController | null {
  const gl = canvas.getContext("webgl", { alpha: true, antialias: false, depth: false, powerPreference: "low-power" });
  if (!gl) return null;
  const shaders: WebGLShader[] = [];
  const buffers: WebGLBuffer[] = [];
  function compile(type: number, source: string) {
    const shader = gl!.createShader(type);
    if (!shader) throw new Error("Shader unavailable");
    shaders.push(shader); gl!.shaderSource(shader, source); gl!.compileShader(shader);
    if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) throw new Error(gl!.getShaderInfoLog(shader) || "Shader failed");
    return shader;
  }
  const program = gl.createProgram();
  if (!program) return null;
  try {
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Link failed");
  } catch {
    shaders.forEach(s => gl.deleteShader(s)); gl.deleteProgram(program); return null;
  }
  const sampling = document.createElement("canvas");
  const sampleWidth = 420;
  sampling.width = sampleWidth; sampling.height = Math.round(sampleWidth * image.height / image.width);
  const context = sampling.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  context.drawImage(image, 0, 0, sampling.width, sampling.height);
  const { data } = context.getImageData(0, 0, sampling.width, sampling.height);
  const targets: number[] = [], colors: number[] = [], randoms: number[] = [], kinds: number[] = [];
  let seed = 42;
  const random = () => { seed = (1664525*seed+1013904223) >>> 0; return seed/4294967296; };
  for (let y = 0; y < sampling.height; y++) {
    for (let x = 0; x < sampling.width; x++) {
      const i = (y*sampling.width+x)*4;
      const light = (data[i]*.2126+data[i+1]*.7152+data[i+2]*.0722)/255;
      if(data[i+3]<100 || light<.035 || random()>.95) continue;
      targets.push(((x+random()*.7)/sampling.width-.44)*image.width/image.height, (y+random()*.7)/sampling.height-.5, light);
      const luminance = Math.pow(light,.64);
      colors.push(data[i]/255*.65+luminance*.35+.045, data[i+1]/255*.65+luminance*.35+.05, data[i+2]/255*.65+luminance*.35+.065);
      randoms.push(random(),random(),random()); kinds.push(0);
      if(y > sampling.height*.59 && random() > .78) {
        const side=x/sampling.width<.44?-1:1;
        targets.push(((x/sampling.width-.44)*image.width/image.height)+side*(.018+Math.pow(random(),2)*.16),y/sampling.height-.5+random()*.045,light);
        colors.push(.55,.72,.84); randoms.push(random(),random(),random()); kinds.push(2);
      }
    }
  }
  const dustCount = window.innerWidth < 760 ? 900 : 3500;
  for(let i=0;i<dustCount;i++) { targets.push(0,0,0); colors.push(.5,.7,.8); randoms.push(random(),random(),random()); kinds.push(1); }
  gl.useProgram(program);
  const attribute = (name: string, values: number[], size: number) => {
    const buffer = gl.createBuffer(); if (!buffer) return;
    buffers.push(buffer); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(values), gl.STATIC_DRAW);
    const location = gl.getAttribLocation(program, name); gl.enableVertexAttribArray(location); gl.vertexAttribPointer(location,size,gl.FLOAT,false,0,0);
  };
  attribute("aTarget",targets,3); attribute("aColor",colors,3); attribute("aRandom",randoms,3); attribute("aKind",kinds,1);
  const uniforms = Object.fromEntries(["uResolution","uPointer","uTime","uAssembly","uScroll","uPixelRatio","uMobile"].map(name=>[name,gl.getUniformLocation(program,name)]));
  gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA); gl.clearColor(0,0,0,0);
  let width=1,height=1,dpr=1,frame=0,scroll=0,paused=false,visible=true,destroyed=false,dirty=true;
  let time=0,last=performance.now(),assemblyStart=0,pointerX=.7,pointerY=.5,targetX=.7,targetY=.5;
  function resize() {
    const bounds=canvas.getBoundingClientRect(); width=bounds.width; height=bounds.height;
    dpr=Math.min(window.devicePixelRatio || 1, 1.8);
    canvas.width=Math.round(width*dpr); canvas.height=Math.round(height*dpr); gl!.viewport(0,0,canvas.width,canvas.height);
    const fallback=canvas.parentElement?.querySelector<HTMLImageElement>(".portrait-fallback");
    if(fallback) { const portraitHeight=height*(width<760?.64:1.10); fallback.style.height=`${portraitHeight}px`; fallback.style.top=`${height*(width<760?.79:.52)-portraitHeight*.5}px`; fallback.style.left=`${width*(width<760?.60:.72)-portraitHeight*image.width/image.height*.44}px`; }
    dirty=true;
  }
  const resizeObserver=new ResizeObserver(resize); resizeObserver.observe(canvas); resize();
  const move=(event:PointerEvent)=> { const rect=canvas.getBoundingClientRect(); targetX=(event.clientX-rect.left)/rect.width; targetY=(event.clientY-rect.top)/rect.height; };
  const visibility=()=> { visible=!document.hidden; dirty=true; };
  const lost=()=> { onFailure?.(); };
  canvas.addEventListener("webglcontextlost",lost);
  window.addEventListener("pointermove",move,{passive:true}); document.addEventListener("visibilitychange",visibility);
  function render(now:number) {
    if(destroyed) return;
    frame=requestAnimationFrame(render);
    const elapsed=Math.min((now-last)/1000,.05); last=now;
    if(!visible || scroll>1.2 || (paused&&!dirty)) return;
    dirty=false;
    if(!paused) time+=elapsed;
    pointerX+=(targetX-pointerX)*.07; pointerY+=(targetY-pointerY)*.07;
    gl!.clear(gl!.COLOR_BUFFER_BIT);
    gl!.uniform2f(uniforms.uResolution,width,height);
    gl!.uniform2f(uniforms.uPointer,paused ? -.5 : pointerX, paused ? -.5 : pointerY);
    gl!.uniform1f(uniforms.uTime,time);
    gl!.uniform1f(uniforms.uAssembly,paused?1:Math.min((time-assemblyStart)/3.6,1));
    gl!.uniform1f(uniforms.uScroll,paused?0:scroll);
    gl!.uniform1f(uniforms.uPixelRatio,dpr);
    gl!.uniform1f(uniforms.uMobile,width<760?1:0);
    gl!.drawArrays(gl!.POINTS,0,kinds.length);
    const reveal=paused?1:Math.min(Math.max((time-assemblyStart)/3.6,0),1);
    canvas.parentElement?.style.setProperty("--portrait-reveal",String(Math.pow(reveal,4)*.24*(1-Math.min(scroll,1))));
  }
  frame=requestAnimationFrame(render); onReady();
  return { setScroll(value) { scroll=value; dirty=true; }, setPaused(value) { paused=value; dirty=true; }, replay() {assemblyStart=time;dirty=true;}, destroy() {
    destroyed=true; cancelAnimationFrame(frame); resizeObserver.disconnect(); window.removeEventListener("pointermove",move); document.removeEventListener("visibilitychange",visibility);
    buffers.forEach(b=>gl.deleteBuffer(b)); shaders.forEach(s=>gl.deleteShader(s)); gl.deleteProgram(program);
    canvas.removeEventListener("webglcontextlost",lost);
  }};
}
