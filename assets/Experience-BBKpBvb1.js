import{a as Ke,r,b as z,j as e,s as ye,e as Ae,d as ut,w as ft,y as mt,B as dt,X as pt,T as ht,q as xt,f as vt,E as yt,S as gt}from"./r3f-BiB7X7ot.js";import{g as Ie}from"./gsap-DhWVUmVr.js";import{s as ze,S as $e,a as Je}from"./index-CVZCoWuz.js";import{b as h,I as Mt,am as wt,an as St,ao as bt,ap as Tt,l as De,aq as q,ae as zt,s as jt,w as Pt,V as Qe,ai as ge,aj as H,C as Ce,ar as et,o as Ue}from"./three-7s4jzxwR.js";Ie.registerPlugin($e);const _t=-Math.PI/6,It=Math.PI/2.3,Ne=9,Rt=.3,At=-Math.PI/4,Dt=Math.PI/3.5,Ct=28,Lt=1.5,pe=typeof window<"u"&&window.innerWidth<768?1.45:1;function Ot(){const{camera:t}=Ke(),s=r.useRef({theta:At,phi:Dt,radius:Ct,targetY:Lt}),c=r.useRef(null),n=r.useRef(!1),i=()=>{if(c.current)return;const o=1/(ze.length+1-1),u=Ie.timeline({scrollTrigger:{trigger:".scroll-container",start:"top top",end:"bottom bottom",scrub:1.2,fastScrollEnd:!0,invalidateOnRefresh:!0}});ze.forEach((f,m)=>{const y=(m+1)*o;if(m===3){const g=ze[m-1];u.to(s.current,{theta:(f.angle+g.angle)/2,phi:f.phi,radius:(f.radius+3)*pe,targetY:f.targetY+.2,duration:o*.4,ease:"power2.out"},y-o),u.to(s.current,{theta:f.angle,phi:f.phi,radius:f.radius*pe,targetY:f.targetY,duration:o*.6,ease:"power2.inOut"})}else u.to(s.current,{theta:f.angle,phi:f.phi,radius:f.radius*pe,targetY:f.targetY,duration:o,ease:"none"},y-o)}),c.current=u,$e.refresh()};return r.useEffect(()=>{const a=()=>{n.current||(n.current=!0,Ie.to(s.current,{theta:_t,phi:It,radius:Ne*pe,targetY:Rt,duration:3,ease:"power3.inOut",onComplete:()=>{i(),window.__kr8tiv_intro_zoom_complete=!0,window.dispatchEvent(new CustomEvent("intro-zoom-complete"))}}))};window.addEventListener("intro-complete",a);const o=setTimeout(()=>{s.current.radius>Ne+1&&a()},5e3);return()=>{window.removeEventListener("intro-complete",a),clearTimeout(o),c.current?.scrollTrigger?.kill(),c.current?.kill(),c.current=null}},[]),z(()=>{const{theta:a,phi:o,radius:u,targetY:f}=s.current;t.position.x=u*Math.sin(o)*Math.sin(a),t.position.y=u*Math.cos(o),t.position.z=u*Math.sin(o)*Math.cos(a),t.lookAt(0,f,0)}),null}const $=.25,Y=$+.03,N=new h(-1.15,Y,0),Et=1.15,he=.3,b=9,L=[[-.18,0,-.15],[.11,.012,.16],[.02,.024,-.03],[-.08,.036,.11],[.19,0,-.08],[-.21,.012,.06],[.06,.048,.05],[-.02,.06,-.13],[.14,.024,.1]],Ve=[.6,-.9,.25,-.4,1.2,-.15,.8,-.65,.35];function je(t){const s=t%3,c=Math.floor(t/3);return new h(Et-he+s*he,Y,-he+c*he)}const xe=$+.46,B=.85,O=.85;function Ft(t,s){const c=t*t+s*s,n=Math.min(Math.sqrt(c),B+O-.01),i=Math.max(-1,Math.min(1,(n*n-B*B-O*O)/(2*B*O))),a=Math.acos(i);return[Math.atan2(s,Math.max(t,.001))+Math.atan2(O*Math.sin(a),B+O*Math.cos(a)),-a]}const V=4,Re=2.6,Gt=b*V+Re,re=[0,.13,.2,.3,.56,.68,.74,.84,1],Ye=.2,He=.74;function kt(t){return t*t*(3-2*t)}function Bt({tier:t}){const s=t==="low",c=t==="medium",n=r.useRef(null),i=r.useRef(null),a=r.useRef(null),o=r.useRef(null),u=r.useRef(null),f=r.useRef(null),m=r.useRef(null),y=r.useRef(null),g=r.useRef([]),X=r.useRef([]),J=r.useRef(0),T=r.useRef(new Array(b).fill("pile")),_=r.useRef(new Array(b).fill(0)),I=r.useRef(null),E=r.useRef(null),[R,Q]=r.useState(!1),ae=r.useRef(new h),{raycaster:ee,pointer:ie,camera:W}=Ke(),te=r.useMemo(()=>new Mt(2.9,2),[]),Me=r.useMemo(()=>new wt(2.2,1),[]),we=r.useRef(null),ot=r.useRef(null);r.useEffect(()=>{we.current=new Float32Array(te.attributes.position.array),ot.current=new Float32Array(Me.attributes.position.array)},[te,Me]);const Oe=r.useMemo(()=>new St(new h(0,0,1),0),[]),Se=r.useMemo(()=>new h,[]),st=r.useCallback(()=>{ee.setFromCamera(ie,W),ee.ray.intersectPlane(Oe,Se),ae.current.copy(Se)},[ee,ie,W,Oe,Se]),A=r.useMemo(()=>new h,[]),F=r.useMemo(()=>new h,[]),ce=r.useMemo(()=>new h,[]),Ee=r.useMemo(()=>new h,[]),Fe=r.useMemo(()=>new h,[]),le=r.useMemo(()=>new h,[]),be=r.useRef(null),Te=r.useRef(null),Ge=(w,p,x)=>{const M=ce.set(N.x+L[x][0],Y+L[x][1],N.z+L[x][2]),S=je(x);switch(p){case 0:return w.set(0,xe+.55,.4);case 1:return w.set(M.x,M.y+.42,M.z);case 2:return w.set(M.x,M.y+.13,M.z);case 3:return w.set(M.x,M.y+.6,M.z);case 4:return w.set((M.x+S.x)/2,Y+.95,(M.z+S.z)/2);case 5:return w.set(S.x,S.y+.45,S.z);case 6:return w.set(S.x,S.y+.14,S.z);case 7:return w.set(S.x,S.y+.5,S.z);default:return w.set(0,xe+.55,.4)}};z((w,p)=>{const x=w.clock.elapsedTime;R&&st();const S=1+Math.min(Math.abs(window.__kr8tiv_scrollVel??0),1200)/1200*.9;J.current=(J.current+Math.min(p,.05)*S)%Gt;const oe=J.current,U=oe>=b*V,G=Math.min(Math.floor(oe/V),b-1),j=U?1:(oe-G*V)/V;if(U){const l=(oe-b*V)/Re;for(let d=0;d<b;d++){const v=Math.sin(l*Math.PI*3+d*.3)*.5+.5;_.current[d]=Math.max(0,(1-l)*(.55+v*.45));const C=g.current[d];if(C&&T.current[d]==="placed"){const Z=C.material;Z.opacity=Math.max(0,1-l*1.6),l>.85&&(T.current[d]="pile")}}}else j>=Ye&&T.current[G]==="pile"&&(T.current[G]="carried"),j>=He&&T.current[G]==="carried"&&(T.current[G]="placed",_.current[G]=1.4);let k=0;for(;k<re.length-2&&j>re[k+1];)k++;const rt=kt(Math.max(0,Math.min(1,(j-re[k])/(re[k+1]-re[k]))));Ge(ce,k,G);const nt=A.copy(ce);if(Ge(Ee,k+1,G),nt.lerp(Ee,rt),U){const l=(oe-b*V)/Re;A.set(Math.sin(l*Math.PI*2)*.8,xe+.5,.5)}const at=Math.atan2(A.z,A.x),it=Math.max(.15,Math.sqrt(A.x*A.x+A.z*A.z)),[ct,lt]=Ft(it,A.y-xe);if(n.current){let l=at-n.current.rotation.y;for(;l>Math.PI;)l-=Math.PI*2;for(;l<-Math.PI;)l+=Math.PI*2;n.current.rotation.y+=l*Math.min(1,p*7)}i.current&&(i.current.rotation.z+=(ct-i.current.rotation.z)*Math.min(1,p*9)),a.current&&(a.current.rotation.z+=(lt-a.current.rotation.z)*Math.min(1,p*9)),o.current&&i.current&&a.current&&(o.current.rotation.z=-Math.PI/2-(i.current.rotation.z+a.current.rotation.z));const ke=!U&&j>=Ye&&j<He?.035:.075;f.current&&(f.current.position.x+=(ke-f.current.position.x)*.25),m.current&&(m.current.position.x+=(-ke-m.current.position.x)*.25),u.current&&u.current.getWorldPosition(F);for(let l=0;l<b;l++){const d=g.current[l];if(!d)continue;const v=d.material,C=T.current[l];if(C==="pile")d.position.set(N.x+L[l][0],Y+L[l][1],N.z+L[l][2]),d.rotation.set(0,Ve[l],0),v.opacity=Math.min(1,v.opacity+p*1.5),v.emissive.setHex(16777215),v.emissiveIntensity=.32+Math.sin(x*1.4+l)*.06;else if(C==="carried")d.position.lerp(ce.set(F.x,F.y-.09,F.z),Math.min(1,p*18)),d.rotation.y+=(0-d.rotation.y)*.1,v.opacity=1,v.emissiveIntensity=.55;else{const Z=je(l);d.position.lerp(Z,Math.min(1,p*10)),d.rotation.y+=(0-d.rotation.y)*.2,U||(v.opacity=1),v.emissive.setHex(13936723),v.emissiveIntensity=.5+Math.sin(x*2+l)*.08}}for(let l=0;l<b;l++){const d=X.current[l];if(!d)continue;if(!U){const C=T.current[l]==="placed"?.55:.05;_.current[l]+=(C-_.current[l])*Math.min(1,p*3)}const v=d.material;v.emissiveIntensity=_.current[l]}if(y.current){const l=!U&&(j>.13&&j<.28||j>.62&&j<.8),d=y.current.material;if(d.opacity+=((l?.22:0)-d.opacity)*.2,d.opacity>.01){const v=Math.max(.05,F.y-Y);y.current.position.set(F.x,F.y-v/2,F.z),y.current.scale.set(1,v,1)}}if(be.current){const l=be.current.material,d=s?.46:c?.5:.54;l.emissiveIntensity=d+Math.sin(x*.6)*.05}if(Te.current&&(Te.current.intensity=.1+Math.sin(x*.6)*.02),I.current&&we.current){I.current.rotation.y=x*.015,I.current.rotation.x=Math.sin(x*.12)*.02;const l=I.current.material;if(l.opacity=R?.16:.06,l.emissiveIntensity=R?.2:.07,!s){const d=I.current.geometry.attributes.position,v=we.current,C=ae.current,Z=R?.35:0;for(let P=0;P<d.count;P++){const fe=v[P*3],me=v[P*3+1],de=v[P*3+2];Fe.set(fe,me+.3,de);const Be=Fe.distanceTo(C);if(Be<2.2&&Z>0){const se=1-Be/2.2,K=se*se*Z;le.set(fe,me,de).normalize(),d.setXYZ(P,fe+le.x*K,me+le.y*K,de+le.z*K)}else{const se=d.getX(P),K=d.getY(P),We=d.getZ(P);d.setXYZ(P,se+(fe-se)*.08,K+(me-K)*.08,We+(de-We)*.08)}}d.needsUpdate=!0}}if(E.current){E.current.rotation.y=-x*.02,E.current.rotation.z=Math.sin(x*.1)*.015;const l=E.current.material;l.opacity=R?.1:.035,l.emissiveIntensity=R?.14:.05}});const D=r.useMemo(()=>new bt({color:"#0c0d13",metalness:.92,roughness:.26,envMapIntensity:1.6,clearcoat:.4,clearcoatRoughness:.2}),[]),ue=r.useMemo(()=>new Tt({color:"#d4a853",emissive:"#d4a853",emissiveIntensity:.5,toneMapped:!1}),[]);return e.jsxs("group",{position:[0,0,0],children:[e.jsxs("mesh",{castShadow:!0,receiveShadow:!0,children:[e.jsx("boxGeometry",{args:[4.2,.5,2.2]}),e.jsx("meshPhysicalMaterial",{color:"#050508",metalness:.95,roughness:.08,envMapIntensity:2,clearcoat:.5,clearcoatRoughness:.1})]}),e.jsxs("mesh",{position:[0,.251,0],rotation:[-Math.PI/2,0,0],children:[e.jsx("planeGeometry",{args:[4.14,2.14]}),e.jsx("meshPhysicalMaterial",{color:"#07080e",metalness:.9,roughness:.12,clearcoat:1,clearcoatRoughness:.08,envMapIntensity:1.4})]}),e.jsxs("mesh",{ref:be,position:[0,0,1.112],children:[e.jsx("boxGeometry",{args:[4,.06,.02]}),e.jsx("meshStandardMaterial",{color:"#d4a853",emissive:"#d4a853",emissiveIntensity:.5,toneMapped:!1})]}),e.jsxs("mesh",{position:[0,0,-1.112],children:[e.jsx("boxGeometry",{args:[4,.06,.02]}),e.jsx("meshStandardMaterial",{color:"#d4a853",emissive:"#d4a853",emissiveIntensity:.4,toneMapped:!1})]}),e.jsxs("mesh",{position:[2.112,0,0],children:[e.jsx("boxGeometry",{args:[.02,.04,2]}),e.jsx("meshStandardMaterial",{color:"#ffffff",emissive:"#ffffff",emissiveIntensity:.25,toneMapped:!1})]}),e.jsxs("mesh",{position:[-2.112,0,0],children:[e.jsx("boxGeometry",{args:[.02,.04,2]}),e.jsx("meshStandardMaterial",{color:"#ffffff",emissive:"#ffffff",emissiveIntensity:.25,toneMapped:!1})]}),e.jsxs("mesh",{position:[N.x,$+.005,0],rotation:[-Math.PI/2,0,0],children:[e.jsx("ringGeometry",{args:[.52,.55,40]}),e.jsx("meshStandardMaterial",{color:"#d4a853",emissive:"#d4a853",emissiveIntensity:.18,transparent:!0,opacity:.55,toneMapped:!1})]}),Array.from({length:b},(w,p)=>{const x=je(p);return e.jsxs("group",{children:[e.jsxs("mesh",{position:[x.x,$+.004,x.z],rotation:[-Math.PI/2,0,0],children:[e.jsx("planeGeometry",{args:[.28,.22]}),e.jsx("meshStandardMaterial",{color:"#03030a",metalness:.8,roughness:.3})]}),e.jsxs("mesh",{ref:M=>{X.current[p]=M},position:[x.x,$+.006,x.z],rotation:[-Math.PI/2,0,0],children:[e.jsx("ringGeometry",{args:[.13,.15,4,1,Math.PI/4]}),e.jsx("meshStandardMaterial",{color:"#d4a853",emissive:"#d4a853",emissiveIntensity:.05,transparent:!0,opacity:.9,toneMapped:!1})]})]},`cell-${p}`)}),Array.from({length:b},(w,p)=>e.jsxs("mesh",{ref:x=>{g.current[p]=x},position:[N.x+L[p][0],Y+L[p][1],N.z+L[p][2]],rotation:[0,Ve[p],0],children:[e.jsx("boxGeometry",{args:[.18,.012,.13]}),e.jsx("meshStandardMaterial",{color:"#e9e6dd",emissive:"#ffffff",emissiveIntensity:.32,transparent:!0,opacity:1,toneMapped:!1})]},`chit-${p}`)),e.jsxs("group",{ref:n,position:[0,$,0],children:[e.jsx("mesh",{position:[0,.07,0],material:D,children:e.jsx("cylinderGeometry",{args:[.3,.34,.14,32]})}),e.jsx("mesh",{position:[0,.145,0],material:ue,children:e.jsx("torusGeometry",{args:[.24,.012,10,40]})}),e.jsx("mesh",{position:[0,.28,0],material:D,children:e.jsx("cylinderGeometry",{args:[.11,.14,.3,24]})}),e.jsxs("group",{ref:i,position:[0,.46,0],children:[e.jsx("mesh",{rotation:[Math.PI/2,0,0],material:D,children:e.jsx("cylinderGeometry",{args:[.11,.11,.22,24]})}),e.jsx("mesh",{rotation:[Math.PI/2,0,0],position:[0,0,.115],material:ue,children:e.jsx("torusGeometry",{args:[.08,.01,8,32]})}),e.jsx("mesh",{position:[B/2,0,0],rotation:[0,0,Math.PI/2],material:D,children:e.jsx("capsuleGeometry",{args:[.065,B-.12,6,16]})}),e.jsxs("group",{ref:a,position:[B,0,0],children:[e.jsx("mesh",{rotation:[Math.PI/2,0,0],material:D,children:e.jsx("cylinderGeometry",{args:[.08,.08,.18,20]})}),e.jsx("mesh",{rotation:[Math.PI/2,0,0],position:[0,0,.095],material:ue,children:e.jsx("torusGeometry",{args:[.06,.008,8,28]})}),e.jsx("mesh",{position:[(O-.14)/2,0,0],rotation:[0,0,Math.PI/2],material:D,children:e.jsx("capsuleGeometry",{args:[.05,O-.26,6,14]})}),e.jsxs("group",{ref:o,position:[O-.14,0,0],children:[e.jsx("mesh",{material:D,children:e.jsx("cylinderGeometry",{args:[.05,.06,.1,16]})}),e.jsx("mesh",{position:[0,-.04,0],material:ue,children:e.jsx("torusGeometry",{args:[.045,.007,8,24]})}),e.jsx("mesh",{ref:f,position:[.075,-.1,0],material:D,children:e.jsx("boxGeometry",{args:[.018,.1,.05]})}),e.jsx("mesh",{ref:m,position:[-.075,-.1,0],material:D,children:e.jsx("boxGeometry",{args:[.018,.1,.05]})}),e.jsx("object3D",{ref:u,position:[0,-.14,0]})]})]})]})]}),e.jsxs("mesh",{ref:y,children:[e.jsx("cylinderGeometry",{args:[.035,.06,1,12,1,!0]}),e.jsx("meshBasicMaterial",{color:"#d4a853",transparent:!0,opacity:0,blending:q,depthWrite:!1,side:De})]}),e.jsx("mesh",{ref:I,geometry:te,position:[0,.3,0],onPointerEnter:()=>Q(!0),onPointerLeave:()=>Q(!1),children:e.jsx("meshStandardMaterial",{color:"#b0b0b0",emissive:"#ffffff",emissiveIntensity:.12,wireframe:!0,transparent:!0,opacity:.06,toneMapped:!1})}),e.jsx("mesh",{ref:E,geometry:Me,position:[0,.3,0],children:e.jsx("meshStandardMaterial",{color:"#909090",emissive:"#cccccc",emissiveIntensity:.08,wireframe:!0,transparent:!0,opacity:.035,toneMapped:!1})}),e.jsx("pointLight",{ref:Te,position:[0,.6,0],color:"#d4a853",intensity:.1,distance:4.5,decay:2})]})}const Wt=24,Ut=2,Nt=`
varying vec3 vWorldPos;

void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,Vt=`
precision highp float;

varying vec3 vWorldPos;

uniform float uTime;
uniform vec3 uBoxMin;
uniform vec3 uBoxMax;
uniform vec3 uWindDirection;
uniform float uWindSpeed;
uniform float uDensityMultiplier;
uniform float uAbsorption;
uniform vec3 uLightDir;
uniform vec3 uLightColor;
uniform float uLightIntensity;
uniform float uPhaseG;
uniform float uNoiseScale;
uniform float uDensityThreshold;
uniform float uScrollVelocity;

#define NUM_STEPS ${Wt}
#define SHADOW_STEPS ${Ut}
#define PI 3.14159265359

/* ── Simplex 3D Noise (ashima/webgl-noise, MIT license) ──── */

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x2_ = x_ * ns.x + ns.yyyy;
  vec4 y2_ = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x2_) - abs(y2_);

  vec4 b0 = vec4(x2_.xy, y2_.xy);
  vec4 b1 = vec4(x2_.zw, y2_.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

/* ── FBM — 3 octaves (was 4, saves ~25% of noise cost) ──── */

float fbm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  vec3 wind = uWindDirection * uTime * uWindSpeed;

  for (int i = 0; i < 3; i++) {
    vec3 offset = wind * (0.4 + float(i) * 0.35);
    value += amplitude * snoise((p + offset) * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return value;
}

/* ── Jitter hash ─────────────────────────────────────────── */

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

/* ── Ray-AABB intersection ───────────────────────────────── */

vec2 intersectAABB(vec3 ro, vec3 rd, vec3 bmin, vec3 bmax) {
  vec3 invDir = 1.0 / rd;
  vec3 t0 = (bmin - ro) * invDir;
  vec3 t1 = (bmax - ro) * invDir;
  vec3 tmin = min(t0, t1);
  vec3 tmax = max(t0, t1);
  float tNear = max(max(tmin.x, tmin.y), tmin.z);
  float tFar = min(min(tmax.x, tmax.y), tmax.z);
  return vec2(tNear, tFar);
}

/* ── Henyey-Greenstein phase function ────────────────────── */

float henyeyGreenstein(float cosTheta, float g) {
  float g2 = g * g;
  float denom = 1.0 + g2 - 2.0 * g * cosTheta;
  return (1.0 - g2) / (4.0 * PI * pow(denom, 1.5));
}

/* ── Gerstner wave displacement ──────────────────────────── */
/* Creates realistic ocean-like rolling formations in the smoke */

vec3 gerstnerDisplace(vec3 p) {
  // Scroll velocity adds turbulence — faster scroll = wilder smoke
  float scrollBoost = 1.0 + abs(uScrollVelocity) * 0.3;

  // Wave 1: Deep, slow, majestic swell
  float k1 = 6.28 / 4.5;
  float c1 = sqrt(9.8 / k1);
  float f1 = k1 * (p.x * 0.8 + p.z * 0.3 - c1 * uTime * 0.15 * scrollBoost);
  float steep1 = 0.35;
  float a1 = steep1 / k1;

  // Wave 2: Cross-swell, different direction
  float k2 = 6.28 / 3.0;
  float c2 = sqrt(9.8 / k2);
  float f2 = k2 * (p.x * -0.3 + p.z * 0.7 - c2 * uTime * 0.2 * scrollBoost);
  float steep2 = 0.2;
  float a2 = steep2 / k2;

  // Wave 3: Fast ripple
  float k3 = 6.28 / 1.8;
  float c3 = sqrt(9.8 / k3);
  float f3 = k3 * (p.x * 0.5 + p.z * -0.5 - c3 * uTime * 0.3 * scrollBoost);
  float steep3 = 0.12;
  float a3 = steep3 / k3;

  return vec3(
    a1 * cos(f1) * 0.8 + a2 * cos(f2) * -0.3 + a3 * cos(f3) * 0.5,
    a1 * sin(f1) + a2 * sin(f2) + a3 * sin(f3),
    a1 * cos(f1) * 0.3 + a2 * cos(f2) * 0.7 + a3 * cos(f3) * -0.5
  );
}

/* ── Density sampling with Gerstner waves ────────────────── */

float sampleDensity(vec3 worldPos) {
  // Gerstner displacement warps the sample position before noise eval
  vec3 displaced = worldPos + gerstnerDisplace(worldPos) * 0.6;
  vec3 samplePos = displaced * uNoiseScale;

  float density = fbm(samplePos);
  density = smoothstep(uDensityThreshold, uDensityThreshold + 0.3, density * 0.5 + 0.5);

  // Gentle breathing pulse
  float pulse = sin(uTime * 0.6) * 0.08 + 0.92;
  density *= pulse;

  // ── Boundary fades ──
  vec3 center = (uBoxMin + uBoxMax) * 0.5;
  vec3 halfSize = (uBoxMax - uBoxMin) * 0.5;
  vec3 d = abs(worldPos - center) / halfSize;

  float edgeFade = 1.0 - smoothstep(0.25, 0.78, max(max(d.x, d.y), d.z));

  float normalizedY = (worldPos.y - uBoxMin.y) / (uBoxMax.y - uBoxMin.y);
  float heightFade = smoothstep(0.0, 0.2, normalizedY) * smoothstep(1.0, 0.35, normalizedY);

  float radialDist = length(worldPos.xz - center.xz) / halfSize.x;
  float radialFade = 1.0 - smoothstep(0.35, 0.92, radialDist);

  return density * edgeFade * heightFade * radialFade * uDensityMultiplier;
}

/* ── Volumetric self-shadowing ───────────────────────────── */

float volumetricShadow(vec3 pos) {
  float shadowDensity = 0.0;
  float shadowStepSize = 1.0 / float(SHADOW_STEPS);

  for (int j = 0; j < SHADOW_STEPS; j++) {
    pos += uLightDir * shadowStepSize;
    shadowDensity += sampleDensity(pos) * shadowStepSize;
  }

  return exp(-shadowDensity * uAbsorption * 2.0);
}

/* ── Main ────────────────────────────────────────────────── */

void main() {
  vec3 ro = cameraPosition;
  vec3 rd = normalize(vWorldPos - cameraPosition);

  vec2 t = intersectAABB(ro, rd, uBoxMin, uBoxMax);
  t.x = max(t.x, 0.0);
  if (t.x >= t.y) discard;

  float stepSize = (t.y - t.x) / float(NUM_STEPS);

  float jitter = hash(gl_FragCoord.xy + fract(uTime * 0.17)) * stepSize;

  float transmittance = 1.0;
  vec3 scattered = vec3(0.0);

  for (int i = 0; i < NUM_STEPS; i++) {
    float tCur = t.x + (float(i) + 0.5) * stepSize + jitter;
    if (tCur > t.y) break;

    vec3 pos = ro + rd * tCur;
    float density = sampleDensity(pos);

    if (density > 0.001) {
      float extinction = density * uAbsorption;
      float stepTrans = exp(-extinction * stepSize);

      float cosTheta = dot(uLightDir, rd);
      float phase = henyeyGreenstein(cosTheta, uPhaseG);
      float shadow = volumetricShadow(pos);

      vec3 luminance = uLightColor * uLightIntensity * phase * shadow;

      // Dual-phase: add back-scattering for deeper volume feel
      float backPhase = henyeyGreenstein(cosTheta, -0.3);
      vec3 backLuminance = uLightColor * uLightIntensity * 0.15 * backPhase * shadow;
      luminance += backLuminance;

      vec3 integScatter = luminance * (1.0 - stepTrans) / max(extinction, 0.0001);
      scattered += transmittance * integScatter;
      transmittance *= stepTrans;

      if (transmittance < 0.01) break;
    }
  }

  // Warm-cool ambient gradient
  float ambientDensity = 1.0 - transmittance;
  vec3 warmAmb = vec3(0.09, 0.075, 0.06);
  vec3 coolAmb = vec3(0.06, 0.07, 0.10);
  scattered += mix(warmAmb, coolAmb, 0.5) * ambientDensity * 0.7;

  gl_FragColor = vec4(scattered, 1.0 - transmittance);
}
`,Yt=ye({uTime:0,uBoxMin:new h(-4,-.75,-4),uBoxMax:new h(4,2.75,4),uWindDirection:new h(1,.08,.25).normalize(),uWindSpeed:.22,uDensityMultiplier:.28,uAbsorption:.38,uLightDir:new h(5,8,3).normalize(),uLightColor:new h(1,.97,.92),uLightIntensity:1.8,uPhaseG:.25,uNoiseScale:2,uDensityThreshold:.35,uScrollVelocity:0},Nt,Vt);Ae({VolumetricSmokeMaterial:Yt});function Ht({densityMultiplier:t=.2,absorption:s=.34,lightIntensity:c=1.45,densityThreshold:n=.34,volumeScale:i=[12,5.2,12],volumePos:a=[0,1,0]}={}){const o=r.useRef(null),{boxMin:u,boxMax:f}=r.useMemo(()=>({boxMin:new h(a[0]-i[0]/2,a[1]-i[1]/2,a[2]-i[2]/2),boxMax:new h(a[0]+i[0]/2,a[1]+i[1]/2,a[2]+i[2]/2)}),[a,i]);return z(m=>{if(!o.current)return;o.current.uTime=m.clock.elapsedTime,o.current.uBoxMin=u,o.current.uBoxMax=f,o.current.uDensityMultiplier=t,o.current.uAbsorption=s,o.current.uLightIntensity=c,o.current.uDensityThreshold=n;const y=window.__kr8tiv_scrollVel??0;o.current.uScrollVelocity=jt.lerp(o.current.uScrollVelocity,Math.min(Math.abs(y)/800,1),.05)}),e.jsxs("mesh",{position:a,scale:i,renderOrder:1,children:[e.jsx("boxGeometry",{args:[1,1,1]}),e.jsx("volumetricSmokeMaterial",{ref:o,transparent:!0,depthWrite:!1,side:zt})]})}const qt=`
uniform float uTime;
uniform float uSpeed;
uniform float uAmplitude;
uniform float uPhase;
uniform float uLayerOffset;

varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;

// Simple noise for organic variation
vec3 mod289v(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289v(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permutev(vec4 x) { return mod289v(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrtv(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289v(i);
  vec4 p = permutev(permutev(permutev(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x2v = x_ * ns.x + ns.yyyy;
  vec4 y2v = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x2v) - abs(y2v);
  vec4 b0 = vec4(x2v.xy, y2v.xy);
  vec4 b1 = vec4(x2v.zw, y2v.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrtv(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

void main() {
  vUv = uv;
  vec3 pos = position;
  float t = uTime * uSpeed;

  // Each layer gets slightly different phase from uLayerOffset
  float layerPhase = uPhase + uLayerOffset * 0.4;

  // Primary wave — slow, deep, majestic
  float wave1 = sin(pos.x * 0.35 + t + layerPhase) * uAmplitude;

  // Secondary wave — creates the rolling feel
  float wave2 = sin(pos.x * 0.55 - t * 0.7 + layerPhase * 1.5) * uAmplitude * 0.35;

  // Noise — each layer gets different turbulence from its offset
  float noiseVal = snoise(vec3(
    pos.x * 0.12 + t * 0.08,
    uLayerOffset * 0.5,
    layerPhase * 0.3
  )) * 0.5;

  pos.y += wave1 + wave2 + noiseVal;

  // Z offset — layers spread in depth
  pos.z += uLayerOffset;

  vec4 wp = modelMatrix * vec4(pos, 1.0);
  vWorldPos = wp.xyz;
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,Xt=`
precision highp float;

varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;

uniform float uTime;
uniform float uPhase;
uniform float uOpacity;
uniform float uLayerOffset;
uniform float uCenterFloor;

void main() {
  // ── Soft vertical gaussian — wide, dreamy falloff ──
  float distFromCenter = abs(vUv.y - 0.5) * 2.0;
  float gauss = exp(-distFromCenter * distFromCenter * 2.5);

  // ── Internal fiber texture — subtle contour lines ──
  // This creates the "layered light painting" look from the reference
  float fiber = sin(vUv.y * 40.0 + uLayerOffset * 8.0 + uTime * 0.5) * 0.5 + 0.5;
  fiber = smoothstep(0.3, 0.7, fiber);
  float fiberEffect = 0.7 + fiber * 0.3;

  // ── Very slow brightness variation along length ──
  float lengthVar = sin(vUv.x * 4.0 - uTime * 0.8 + uPhase) * 0.5 + 0.5;
  lengthVar = 0.8 + lengthVar * 0.2;

  float intensity = gauss * fiberEffect * lengthVar;

  // ── Horizontal edge fade ──
  float edgeFade = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x);
  intensity *= edgeFade;

  // ── Center protection zone — wide fade so product + text stay clear ──
  float centerDist = length(vWorldPos.xz);
  float centerFade = smoothstep(3.5, 12.0, centerDist);
  intensity *= mix(uCenterFloor, 1.0, centerFade);

  // Keep the stream volumetric, not a foreground slab.
  vec3 viewDir = normalize(cameraPosition - vWorldPos);
  float facing = abs(dot(normalize(vWorldNormal), viewDir));
  float facingFade = smoothstep(0.12, 0.45, facing);
  intensity *= facingFade;

  float cameraDistance = distance(vWorldPos, cameraPosition);
  float nearCameraFade = smoothstep(2.8, 5.4, cameraDistance);
  intensity *= nearCameraFade;

  // ── Pure white ──
  float alpha = intensity * uOpacity;

  gl_FragColor = vec4(vec3(1.0), alpha);
}
`,Zt=ye({uTime:0,uSpeed:.3,uAmplitude:.8,uPhase:0,uLayerOffset:0,uOpacity:.04,uCenterFloor:.1},qt,Xt);Ae({StreamLayerMaterial:Zt});const Kt=18,$t=3,Jt=28,Qt=5,eo=.8,to=80;function oo({index:t,total:s,opacityMultiplier:c,centerFloor:n}){const i=r.useRef(null),a=t/Math.max(s-1,1)*2-1,o=a*$t,f=.018*(1-Math.abs(a)*.4)*c,m=r.useMemo(()=>new Pt(Jt,Qt,to,1),[]);return z(y=>{i.current&&(i.current.uTime=y.clock.elapsedTime)}),e.jsx("mesh",{geometry:m,renderOrder:2,children:e.jsx("streamLayerMaterial",{ref:i,uSpeed:.25,uAmplitude:.9,uPhase:0,uLayerOffset:o,uOpacity:f,uCenterFloor:n,transparent:!0,depthWrite:!1,side:De,blending:q,toneMapped:!1})})}function so({layerCount:t=Kt,opacityMultiplier:s=1,centerFloor:c=.1}){const n=r.useMemo(()=>Array.from({length:t},(i,a)=>a),[t]);return e.jsx("group",{position:[0,eo,0],children:n.map(i=>e.jsx(oo,{index:i,total:t,opacityMultiplier:s,centerFloor:c},i))})}function ro({tier:t}){const s=t==="low",c=t==="medium";return e.jsxs("mesh",{rotation:[-Math.PI/2,0,0],position:[0,-.6,0],children:[e.jsx("planeGeometry",{args:[80,80]}),e.jsx("meshStandardMaterial",{color:"#010104",metalness:s?.4:c?.65:.9,roughness:s?.82:c?.45:.15,envMapIntensity:s?.015:c?.03:.05})]})}const qe=new Qe(15e-5,15e-5),Xe=new Qe(15e-5,15e-5);function no({tier:t}){const s=t==="high";return z(()=>{const n=Math.min(Math.abs(window.__kr8tiv_scrollVel??0),1500)/1500,i=s?4e-4:25e-5,a=s?2e-4:12e-5;Xe.set(i+n*a,i+n*a),qe.lerp(Xe,.12)}),e.jsxs(ut,{multisampling:0,children:[e.jsx(ft,{luminanceThreshold:s?.6:.72,luminanceSmoothing:s?.7:.78,intensity:s?.5:.32,mipmapBlur:!0,levels:s?5:4}),e.jsx(mt,{blendFunction:dt.NORMAL,offset:qe,radialModulation:s,modulationOffset:s?.5:.2}),e.jsx(pt,{mode:ht.ACES_FILMIC}),e.jsx(xt,{darkness:s?.7:.55,offset:s?.2:.24})]})}const ao=`
attribute vec3 aSeed;  // x: phase, y: speed, z: angleOffset

uniform float uTime;
uniform float uBaseSize;

varying float vAlpha;

void main() {
  float phase = aSeed.x;
  float speed = aSeed.y;
  float angOff = aSeed.z;

  // Slow orbital drift with gentle vertical rise
  float t = uTime;
  float angle = angOff + t * 0.05 * speed;
  float radius = 0.8 + sin(t * 0.03 + phase) * 2.0 + cos(t * 0.07 + phase * 2.0) * 1.5;

  // Vertical: slow rise with sine wobble, wrapping
  float baseY = mod(position.y + t * 0.0004 * speed + phase * 0.3, 5.0) - 2.5;
  float yWobble = sin(t * 0.15 + phase) * 0.3;

  vec3 pos = vec3(
    cos(angle) * radius + sin(t * 0.02 + phase) * 0.5,
    baseY + yWobble,
    sin(angle) * radius + cos(t * 0.03 + phase) * 0.5
  );

  // Distance fade
  float dist = length(pos.xz);
  vAlpha = smoothstep(8.0, 5.0, dist) * smoothstep(-2.5, -1.5, pos.y) * smoothstep(2.5, 1.5, pos.y);

  // Size variation — breathing
  float sizePulse = 1.0 + sin(t * 0.3 + phase * 3.0) * 0.2;

  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPos;
  gl_PointSize = uBaseSize * sizePulse * (300.0 / -mvPos.z);
}
`,io=`
precision highp float;
uniform vec3 uColor;
uniform float uOpacity;
uniform sampler2D uTexture;
varying float vAlpha;

void main() {
  vec4 tex = texture2D(uTexture, gl_PointCoord);
  gl_FragColor = vec4(uColor, tex.a * uOpacity * vAlpha);
}
`,co=`
attribute vec3 aSeed;  // x: phase, y: speed, z: baseAngle

uniform float uTime;
uniform float uBaseSize;

varying float vAlpha;
varying float vPulse;

void main() {
  float phase = aSeed.x;
  float speed = aSeed.y;
  float baseAngle = aSeed.z;

  float t = uTime;

  // Helical orbit — DNA strand feel
  float orbitAngle = baseAngle + t * 0.03 * speed;
  float radius = 1.5 + sin(t * 0.1 + phase) * 0.5;
  float helixY = sin(orbitAngle * 2.0 + phase) * 0.4;
  float yOffset = sin(t * 0.2 * speed + phase) * 0.3;

  vec3 pos = vec3(
    cos(orbitAngle) * radius,
    0.3 + helixY + yOffset,
    sin(orbitAngle) * radius
  );

  float dist = length(pos.xz);
  vAlpha = smoothstep(3.5, 2.5, dist);
  vPulse = sin(t * 1.5 + phase * 5.0) * 0.5 + 0.5;

  float sizePulse = 1.0 + vPulse * 0.3;

  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPos;
  gl_PointSize = uBaseSize * sizePulse * (300.0 / -mvPos.z);
}
`,lo=`
precision highp float;
uniform vec3 uColor;
uniform float uOpacity;
uniform sampler2D uTexture;
varying float vAlpha;
varying float vPulse;

void main() {
  vec4 tex = texture2D(uTexture, gl_PointCoord);
  float alpha = tex.a * uOpacity * vAlpha * (0.5 + vPulse * 0.5);
  gl_FragColor = vec4(uColor * (0.8 + vPulse * 0.4), alpha);
}
`,uo=ye({uTime:0,uBaseSize:.4,uColor:new Ce("#667799"),uOpacity:.035,uTexture:null},ao,io),fo=ye({uTime:0,uBaseSize:.2,uColor:new Ce("#d4a853"),uOpacity:.06,uTexture:null},co,lo);Ae({FogParticleMaterial:uo,GoldParticleMaterial:fo});function Le(t,s,c=2){const n=document.createElement("canvas");n.width=t,n.height=t;const i=n.getContext("2d"),a=t/2,o=i.createRadialGradient(a,a,0,a,a,a);o.addColorStop(0,s),o.addColorStop(.3/c,s),o.addColorStop(.6,"rgba(0,0,0,0.02)"),o.addColorStop(1,"rgba(0,0,0,0)"),i.fillStyle=o,i.fillRect(0,0,t,t);const u=new et(n);return u.needsUpdate=!0,u}const Pe=400;function mo(){const t=r.useRef(null),s=r.useMemo(()=>Le(128,"rgba(100,120,160,0.15)",1.5),[]),c=r.useMemo(()=>{const n=new Float32Array(Pe*3),i=new Float32Array(Pe*3);for(let o=0;o<Pe;o++){const u=Math.random()*Math.PI*2,f=.8+Math.random()*6;n[o*3]=Math.cos(u)*f,n[o*3+1]=(Math.random()-.5)*5,n[o*3+2]=Math.sin(u)*f,i[o*3]=Math.random()*100,i[o*3+1]=.3+Math.random()*.7,i[o*3+2]=Math.random()*Math.PI*2}const a=new ge;return a.setAttribute("position",new H(n,3)),a.setAttribute("aSeed",new H(i,3)),a},[]);return z(n=>{t.current&&(t.current.uTime=n.clock.elapsedTime)}),e.jsx("points",{geometry:c,children:e.jsx("fogParticleMaterial",{ref:t,uTexture:s,transparent:!0,blending:q,depthWrite:!1})})}const _e=80;function po(){const t=r.useRef(null),s=r.useMemo(()=>Le(64,"rgba(255,255,255,0.15)",2),[]),c=r.useMemo(()=>{const n=new Float32Array(_e*3),i=new Float32Array(_e*3);for(let o=0;o<_e;o++){const u=Math.random()*Math.PI*2,f=.5+Math.random()*2.5;n[o*3]=Math.cos(u)*f,n[o*3+1]=(Math.random()-.5)*2,n[o*3+2]=Math.sin(u)*f,i[o*3]=Math.random()*100,i[o*3+1]=.5+Math.random()*1,i[o*3+2]=Math.random()*Math.PI*2}const a=new ge;return a.setAttribute("position",new H(n,3)),a.setAttribute("aSeed",new H(i,3)),a},[]);return z(n=>{t.current&&(t.current.uTime=n.clock.elapsedTime)}),e.jsx("points",{geometry:c,children:e.jsx("fogParticleMaterial",{ref:t,uTexture:s,uColor:new Ce("#ffffff"),uBaseSize:.15,uOpacity:.03,transparent:!0,blending:q,depthWrite:!1})})}const ve=200;function ho(){const t=r.useRef(null),s=r.useMemo(()=>Le(64,"rgba(212,168,83,0.25)",2),[]),c=r.useMemo(()=>{const n=new Float32Array(ve*3),i=new Float32Array(ve*3);for(let o=0;o<ve;o++){const u=o/ve*Math.PI*2;n[o*3]=Math.cos(u)*2,n[o*3+1]=.3,n[o*3+2]=Math.sin(u)*2,i[o*3]=Math.random()*100,i[o*3+1]=.3+Math.random()*.7,i[o*3+2]=u}const a=new ge;return a.setAttribute("position",new H(n,3)),a.setAttribute("aSeed",new H(i,3)),a},[]);return z(n=>{t.current&&(t.current.uTime=n.clock.elapsedTime)}),e.jsx("points",{geometry:c,children:e.jsx("goldParticleMaterial",{ref:t,uTexture:s,transparent:!0,blending:q,depthWrite:!1})})}function xo(){return e.jsxs("group",{children:[e.jsx(mo,{}),e.jsx(po,{}),e.jsx(ho,{})]})}const vo=`
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,yo=`
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform sampler2D uLogoTexture;
uniform float uIntensity;

void main() {
  // ── Sample logo alpha ──
  vec4 logoSample = texture2D(uLogoTexture, vUv);
  float logoAlpha = logoSample.a;

  // Early discard for fully transparent areas
  if (logoAlpha < 0.02) discard;

  // ── Core brightness — clean white ──
  float core = logoAlpha;

  // ── Subtle scan-line interference ──
  float scanFreq = 300.0;
  float scanSpeed = 8.0;
  float scan = sin(vUv.y * scanFreq + uTime * scanSpeed) * 0.5 + 0.5;
  scan = smoothstep(0.3, 0.7, scan);
  float scanEffect = 0.92 + scan * 0.08;

  // ── Slow horizontal sweep ──
  float sweep = sin(vUv.x * 3.14159 + uTime * 0.5) * 0.5 + 0.5;
  sweep = pow(sweep, 3.0);
  float sweepBrightness = 1.0 + sweep * 0.15;

  // ── Gentle flicker ──
  float flicker = 1.0;
  flicker *= 0.97 + sin(uTime * 1.2) * 0.03;
  flicker *= 0.98 + sin(uTime * 3.7) * 0.02;
  float glitch = step(0.995, sin(uTime * 50.0 + vUv.x * 100.0) * 0.5 + 0.5);
  flicker *= 1.0 - glitch * 0.15;

  // ── Edge glow halo ──
  float offset = 0.008;
  float edgeL = texture2D(uLogoTexture, vUv + vec2(-offset, 0.0)).a;
  float edgeR = texture2D(uLogoTexture, vUv + vec2(offset, 0.0)).a;
  float edgeT = texture2D(uLogoTexture, vUv + vec2(0.0, offset)).a;
  float edgeB = texture2D(uLogoTexture, vUv + vec2(0.0, -offset)).a;
  float edgeDetect = abs(logoAlpha - edgeL) + abs(logoAlpha - edgeR) +
                     abs(logoAlpha - edgeT) + abs(logoAlpha - edgeB);
  edgeDetect = smoothstep(0.0, 0.5, edgeDetect);
  float edgeGlow = edgeDetect * 0.4;

  // ── Outer halo ──
  float haloOffset = 0.025;
  float haloAlpha = 0.0;
  for (float a = 0.0; a < 6.28; a += 0.785) {
    vec2 haloUV = vUv + vec2(cos(a), sin(a)) * haloOffset;
    haloAlpha += texture2D(uLogoTexture, haloUV).a;
  }
  haloAlpha /= 8.0;
  float halo = haloAlpha * 0.15;

  // ── Compose ──
  float intensity = (core * scanEffect * sweepBrightness + edgeGlow + halo) * flicker * uIntensity;

  vec3 color = vec3(1.0);
  color = mix(color, vec3(0.9, 0.92, 1.0), edgeDetect * 0.3);

  gl_FragColor = vec4(color * intensity, intensity);
}
`,Ze=2,go=.04,Mo=.4,tt=2.8,wo=tt/2.67;function So(){const t=r.useRef(null),s=r.useRef(null),c=r.useRef(0),n=vt(Je("/images/kr8tiv-logo.png"));r.useMemo(()=>{n.minFilter=Ue,n.magFilter=Ue,n.generateMipmaps=!1},[n]);const i=r.useMemo(()=>({uniforms:{uTime:{value:0},uLogoTexture:{value:n},uIntensity:{value:2.2}},vertexShader:vo,fragmentShader:yo,transparent:!0,depthWrite:!1,side:De,blending:q,toneMapped:!1}),[n]);return z(a=>{const o=a.clock.elapsedTime;if(t.current){t.current.position.y=Ze+Math.sin(o*Mo)*go;const u=a.camera.position;let m=Math.atan2(u.x,u.z)-c.current;for(;m>Math.PI;)m-=Math.PI*2;for(;m<-Math.PI;)m+=Math.PI*2;c.current+=m*.06,t.current.rotation.y=c.current+Math.sin(o*.15)*.015}s.current&&(s.current.uniforms.uTime.value=o)}),e.jsxs("group",{ref:t,position:[0,Ze,0],children:[e.jsxs("mesh",{children:[e.jsx("planeGeometry",{args:[tt,wo]}),e.jsx("shaderMaterial",{ref:s,args:[i]})]}),e.jsx("pointLight",{position:[0,-.5,.2],color:"#ffffff",intensity:.15,distance:3,decay:2})]})}function bo(){const t=r.useRef(null),s=r.useRef(new h(0,2,5));return z(c=>{const{pointer:n,viewport:i}=c;s.current.set(n.x*i.width/2,n.y*i.height/2+1,4),t.current&&t.current.position.lerp(s.current,.06)}),e.jsx("pointLight",{ref:t,intensity:.08,color:"#ffffff",distance:6,decay:2})}const ne=12;function To(){const t=document.createElement("canvas");t.width=64,t.height=64;const s=t.getContext("2d"),c=32,n=s.createRadialGradient(c,c,0,c,c,c);n.addColorStop(0,"rgba(255,255,255,0.5)"),n.addColorStop(.2,"rgba(255,255,255,0.2)"),n.addColorStop(.5,"rgba(212,168,83,0.06)"),n.addColorStop(1,"rgba(0,0,0,0)"),s.fillStyle=n,s.fillRect(0,0,64,64);const i=new et(t);return i.needsUpdate=!0,i}function zo(){const t=r.useRef(null),s=r.useRef(new h(0,1,4)),c=r.useRef(new h),n=r.useMemo(()=>To(),[]),{geometry:i,seeds:a}=r.useMemo(()=>{const o=new Float32Array(ne*3),u=new Float32Array(ne*4);for(let m=0;m<ne;m++){const y=m/ne*Math.PI*2,g=.5+Math.random()*.8;o[m*3]=Math.cos(y)*g,o[m*3+1]=.3+Math.random()*.4,o[m*3+2]=Math.sin(y)*g,u[m*4]=Math.random()*Math.PI*2,u[m*4+1]=.15+Math.random()*.25,u[m*4+2]=y,u[m*4+3]=Math.random()}const f=new ge;return f.setAttribute("position",new H(o,3)),{geometry:f,seeds:u}},[]);return z(o=>{if(!t.current)return;const{pointer:u,viewport:f}=o,m=o.clock.elapsedTime;c.current.set(u.x*f.width/2,u.y*f.height/2+1,3.5),s.current.lerp(c.current,.04);const y=t.current.geometry.attributes.position;for(let g=0;g<ne;g++){const X=a[g*4],J=a[g*4+1],T=a[g*4+2],_=(Math.sin(m*J+X)+1)/2,I=.6+Math.sin(m*.3+X)*.2,E=Math.cos(T+m*.05)*I,R=.3+Math.sin(m*.4+X)*.15,Q=Math.sin(T+m*.05)*I,ae=s.current.x*.3,ee=s.current.y*.3,ie=s.current.z*.2,W=_*_*(3-2*_),te=Math.sin(W*Math.PI)*.2;y.setXYZ(g,E+(ae-E)*W,R+(ee-R)*W+te,Q+(ie-Q)*W)}y.needsUpdate=!0}),e.jsx("points",{ref:t,geometry:i,children:e.jsx("pointsMaterial",{map:n,color:"#ffffff",size:.18,transparent:!0,opacity:.1,blending:q,depthWrite:!1,sizeAttenuation:!0})})}function Ao({tier:t}){const s=t==="high"?{stream:{layerCount:20,opacityMultiplier:1.15,centerFloor:.18},volume:{densityMultiplier:.22,absorption:.38,lightIntensity:1.45,densityThreshold:.34,volumeScale:[10,4.8,10],volumePos:[0,1,0]}}:t==="medium"?{stream:{layerCount:18,opacityMultiplier:1.05,centerFloor:.14},volume:null}:null;return e.jsxs(e.Fragment,{children:[e.jsx(yt,{files:Je("/hdr/studio_small_03_1k.hdr"),environmentIntensity:t==="high"?.3:.22}),e.jsx("fog",{attach:"fog",args:["#030308",5,22]}),e.jsx("ambientLight",{intensity:.05}),e.jsx("directionalLight",{position:[5,8,3],intensity:.25,castShadow:!0}),e.jsx("spotLight",{position:[-3,6,-3],angle:.35,penumbra:.9,intensity:.25,color:"#ffd4a0"}),e.jsx("pointLight",{position:[5,2,3],intensity:.06,color:"#ffffff",distance:12}),e.jsx("pointLight",{position:[-5,2,-3],intensity:.04,color:"#ffffff",distance:12}),e.jsx(Ot,{}),e.jsx(Bt,{tier:t}),t!=="low"&&e.jsx(So,{}),t!=="low"&&s&&e.jsx(so,{...s.stream}),t==="high"&&s?.volume&&e.jsx(Ht,{...s.volume}),e.jsx(xo,{}),e.jsx(gt,{count:60,speed:.2,opacity:.15,color:"#d4a853",size:.6,scale:[3.5,1.5,3.5],position:[0,.5,0],noise:[.5,.3,.5]}),e.jsx(bo,{}),e.jsx(zo,{}),e.jsx(ro,{tier:t}),t!=="low"&&e.jsx(no,{tier:t})]})}export{Ao as default};
