import{a as Ge,r as s,b as E,j as e,s as De,e as lt,d as Ye,w as qe,X as Xe,T as Ze,y as wt,B as jt,q as bt,f as St,E as Pt,S as Tt}from"./r3f-B9mOlTRz.js";import{g as Ee}from"./gsap-DaXYigii.js";import{S as ut,s as Rt,a as ft}from"./index-t90LyPZP.js";import{b as R,s as zt,I as It,am as _t,an as At,ao as Ct,ap as Ot,l as ce,aq as G,C as xe,ar as Et,w as Ft,V as ht,ai as Re,aj as ee,as as dt,o as Ke}from"./three-D0nhTf3g.js";Ee.registerPlugin(ut);const m=Math.PI/180,Lt=[{approach:{theta:62*m,phi:62*m,radius:12.5,ty:.75,fov:42},hold:{theta:96*m,phi:78*m,radius:5.4,tx:.15,ty:.35,fov:31},approachEase:"power2.out",holdEase:"sine.inOut",split:.5},{approach:{theta:148*m,phi:30*m,radius:9.4,ty:.55,fov:38},hold:{theta:182*m,phi:84*m,radius:5,tx:-.45,ty:.28,fov:34},approachEase:"power1.inOut",holdEase:"power1.out",split:.55},{approach:{theta:214*m,phi:96*m,radius:7.6,tx:.4,ty:.5,fov:46},hold:{theta:236*m,phi:81*m,radius:4.9,tx:1.05,ty:.34,fov:40,roll:-1.5*m},approachEase:"power2.inOut",holdEase:"sine.inOut",split:.45},{approach:{theta:262*m,phi:58*m,radius:6.2,ty:.4,fov:33},hold:{theta:292*m,phi:34*m,radius:13.5,ty:.9,fov:40},approachEase:"power2.in",holdEase:"power2.out",split:.35},{approach:{theta:320*m,phi:70*m,radius:10.5,ty:.7,fov:36},hold:{theta:352*m,phi:86*m,radius:4,tx:-.75,ty:.55,fov:33,roll:1.8*m},approachEase:"power3.out",holdEase:"sine.inOut",split:.4},{approach:{theta:384*m,phi:74*m,radius:7,ty:.4,fov:34},hold:{theta:412*m,phi:46*m,radius:15,ty:1,fov:42},approachEase:"sine.inOut",holdEase:"power1.inOut",split:.45}],$e={theta:-30*m,phi:76*m,radius:8.6,ty:.35,fov:35},pe={theta:-52*m,phi:40*m,radius:30,ty:1.6,fov:46};function Je(){return typeof window<"u"&&window.innerWidth<768}function Gt(){const{camera:t}=Ge(),r=s.useRef(Je()),l=s.useRef(r.current?1.34:1),a=s.useRef(r.current?1.2:1),n=s.useRef(typeof window<"u"&&window.matchMedia("(prefers-reduced-motion: reduce)").matches),c=s.useRef({theta:pe.theta,phi:pe.phi,radius:pe.radius,tx:0,ty:pe.ty,tz:0,fov:pe.fov,roll:0}),o=s.useRef(null),i=s.useRef(!1),d=s.useRef(new R),f=s.useRef(0),g=s.useRef(0),M=v=>({theta:v.theta,phi:v.phi,radius:v.radius*l.current,tx:v.tx??0,ty:v.ty??.3,tz:v.tz??0,fov:(v.fov??35)*a.current,roll:v.roll??0}),T=()=>{if(o.current)return;const x=1/(Rt.length+1-1),p=Ee.timeline({scrollTrigger:{trigger:".scroll-container",start:"top top",end:"bottom bottom",scrub:1.1,fastScrollEnd:!0,invalidateOnRefresh:!0}});Lt.forEach((y,w)=>{const P=w*x,z=y.split??.5;p.to(c.current,{...M(y.approach),duration:x*z,ease:y.approachEase??"power2.out"},P),p.to(c.current,{...M(y.hold),duration:x*(1-z),ease:y.holdEase??"sine.inOut"},P+x*z)}),o.current=p,ut.refresh()};return s.useEffect(()=>{const v=()=>{const x=Je();x!==r.current&&(r.current=x,l.current=x?1.34:1,a.current=x?1.2:1,o.current?.scrollTrigger?.kill(),o.current?.kill(),o.current=null,T())};return window.addEventListener("resize",v),()=>window.removeEventListener("resize",v)},[]),s.useEffect(()=>{const v=()=>{i.current||(i.current=!0,Ee.to(c.current,{...M($e),duration:3,ease:"power3.inOut",onComplete:()=>{T(),window.__kr8tiv_intro_zoom_complete=!0,window.dispatchEvent(new CustomEvent("intro-zoom-complete"))}}))};window.addEventListener("intro-complete",v);const x=setTimeout(()=>{c.current.radius>$e.radius*l.current+1&&v()},5e3);return()=>{window.removeEventListener("intro-complete",v),clearTimeout(x),o.current?.scrollTrigger?.kill(),o.current?.kill(),o.current=null}},[]),E((v,x)=>{const p=v.clock.elapsedTime,y=c.current,w=n.current?0:1,P=Math.min(Math.abs(window.__kr8tiv_scrollVel??0),2e3)/2e3,z=Math.sign(window.__kr8tiv_scrollVel??0)*P;f.current+=(P*.9*w-f.current)*Math.min(1,x*3),g.current+=(z*.9*m*w-g.current)*Math.min(1,x*3);const D=Math.sin(p*.07)*.055*w,X=Math.sin(p*.051+1.3)*.032*w,te=Math.sin(p*.089+.6)*.22*w,k=(Math.sin(p*.63)+Math.sin(p*1.17+2.1)*.5)*.006*w,Z=(Math.sin(p*.71+.9)+Math.sin(p*1.43)*.5)*.005*w,le=Math.sin(p*.47+1.7)*.35*m*w,oe=y.theta+D+k,ue=zt.clamp(y.phi+X+Z,.16,Math.PI-.16),se=Math.max(2.2,y.radius+te+f.current);t.position.set(se*Math.sin(ue)*Math.sin(oe),se*Math.cos(ue),se*Math.sin(ue)*Math.cos(oe)),d.current.set(y.tx,y.ty,y.tz),t.lookAt(d.current);const re=y.roll+le+g.current;re!==0&&t.rotateZ(re);const fe=t,C=y.fov+f.current*1.5;Math.abs(fe.fov-C)>.01&&(fe.fov=C,fe.updateProjectionMatrix())}),null}const ie=.25,Q=ie+.03,$=new R(-1.15,Q,0),Dt=1.15,Se=.3,O=9,H=[[-.18,0,-.15],[.11,.012,.16],[.02,.024,-.03],[-.08,.036,.11],[.19,0,-.08],[-.21,.012,.06],[.06,.048,.05],[-.02,.06,-.13],[.14,.024,.1]],Qe=[.6,-.9,.25,-.4,1.2,-.15,.8,-.65,.35];function _e(t){const r=t%3,l=Math.floor(t/3);return new R(Dt-Se+r*Se,Q,-Se+l*Se)}const Pe=ie+.46,q=.85,V=.85;function kt(t,r){const l=t*t+r*r,a=Math.min(Math.sqrt(l),q+V-.01),n=Math.max(-1,Math.min(1,(a*a-q*q-V*V)/(2*q*V))),c=Math.acos(n);return[Math.atan2(r,Math.max(t,.001))+Math.atan2(V*Math.sin(c),q+V*Math.cos(c)),-c]}const J=4,Fe=2.6,Ut=O*J+Fe,me=[0,.13,.2,.3,.56,.68,.74,.84,1],et=.2,tt=.74;function Wt(t){return t*t*(3-2*t)}function Ht({tier:t}){const r=t==="low",l=t==="medium",a=s.useRef(null),n=s.useRef(null),c=s.useRef(null),o=s.useRef(null),i=s.useRef(null),d=s.useRef(null),f=s.useRef(null),g=s.useRef(null),M=s.useRef([]),T=s.useRef([]),v=s.useRef(0),x=s.useRef(new Array(O).fill("pile")),p=s.useRef(new Array(O).fill(0)),y=s.useRef(null),w=s.useRef(null),[P,z]=s.useState(!1),D=s.useRef(new R),{raycaster:X,pointer:te,camera:k}=Ge(),Z=s.useMemo(()=>new It(2.9,2),[]),le=s.useMemo(()=>new _t(2.2,1),[]),oe=s.useRef(null),ue=s.useRef(null);s.useEffect(()=>{oe.current=new Float32Array(Z.attributes.position.array),ue.current=new Float32Array(le.attributes.position.array)},[Z,le]);const se=s.useMemo(()=>new At(new R(0,0,1),0),[]),re=s.useMemo(()=>new R,[]),fe=s.useCallback(()=>{X.setFromCamera(te,k),X.ray.intersectPlane(se,re),D.current.copy(re)},[X,te,k,se,re]),C=s.useMemo(()=>new R,[]),N=s.useMemo(()=>new R,[]),ye=s.useMemo(()=>new R,[]),Ue=s.useMemo(()=>new R,[]),We=s.useMemo(()=>new R,[]),ge=s.useMemo(()=>new R,[]),ze=s.useRef(null),Ie=s.useRef(null),He=(_,j,b)=>{const I=ye.set($.x+H[b][0],Q+H[b][1],$.z+H[b][2]),A=_e(b);switch(j){case 0:return _.set(0,Pe+.55,.4);case 1:return _.set(I.x,I.y+.42,I.z);case 2:return _.set(I.x,I.y+.13,I.z);case 3:return _.set(I.x,I.y+.6,I.z);case 4:return _.set((I.x+A.x)/2,Q+.95,(I.z+A.z)/2);case 5:return _.set(A.x,A.y+.45,A.z);case 6:return _.set(A.x,A.y+.14,A.z);case 7:return _.set(A.x,A.y+.5,A.z);default:return _.set(0,Pe+.55,.4)}};E((_,j)=>{const b=_.clock.elapsedTime;P&&fe();const A=1+Math.min(Math.abs(window.__kr8tiv_scrollVel??0),1200)/1200*.9;v.current=(v.current+Math.min(j,.05)*A)%Ut;const he=v.current,K=he>=O*J,B=Math.min(Math.floor(he/J),O-1),F=K?1:(he-B*J)/J;if(K){const u=(he-O*J)/Fe;for(let h=0;h<O;h++){const S=Math.sin(u*Math.PI*3+h*.3)*.5+.5;p.current[h]=Math.max(0,(1-u)*(.55+S*.45));const W=M.current[h];if(W&&x.current[h]==="placed"){const ae=W.material;ae.opacity=Math.max(0,1-u*1.6),u>.85&&(x.current[h]="pile")}}}else F>=et&&x.current[B]==="pile"&&(x.current[B]="carried"),F>=tt&&x.current[B]==="carried"&&(x.current[B]="placed",p.current[B]=1.4);let Y=0;for(;Y<me.length-2&&F>me[Y+1];)Y++;const mt=Wt(Math.max(0,Math.min(1,(F-me[Y])/(me[Y+1]-me[Y]))));He(ye,Y,B);const vt=C.copy(ye);if(He(Ue,Y+1,B),vt.lerp(Ue,mt),K){const u=(he-O*J)/Fe;C.set(Math.sin(u*Math.PI*2)*.8,Pe+.5,.5)}const xt=Math.atan2(C.z,C.x),yt=Math.max(.15,Math.sqrt(C.x*C.x+C.z*C.z)),[gt,Mt]=kt(yt,C.y-Pe);if(a.current){let u=xt-a.current.rotation.y;for(;u>Math.PI;)u-=Math.PI*2;for(;u<-Math.PI;)u+=Math.PI*2;a.current.rotation.y+=u*Math.min(1,j*7)}n.current&&(n.current.rotation.z+=(gt-n.current.rotation.z)*Math.min(1,j*9)),c.current&&(c.current.rotation.z+=(Mt-c.current.rotation.z)*Math.min(1,j*9)),o.current&&n.current&&c.current&&(o.current.rotation.z=-Math.PI/2-(n.current.rotation.z+c.current.rotation.z));const Ve=!K&&F>=et&&F<tt?.035:.075;d.current&&(d.current.position.x+=(Ve-d.current.position.x)*.25),f.current&&(f.current.position.x+=(-Ve-f.current.position.x)*.25),i.current&&i.current.getWorldPosition(N);for(let u=0;u<O;u++){const h=M.current[u];if(!h)continue;const S=h.material,W=x.current[u];if(W==="pile")h.position.set($.x+H[u][0],Q+H[u][1],$.z+H[u][2]),h.rotation.set(0,Qe[u],0),S.opacity=Math.min(1,S.opacity+j*1.5),S.emissive.setHex(16777215),S.emissiveIntensity=.32+Math.sin(b*1.4+u)*.06;else if(W==="carried")h.position.lerp(ye.set(N.x,N.y-.09,N.z),Math.min(1,j*18)),h.rotation.y+=(0-h.rotation.y)*.1,S.opacity=1,S.emissiveIntensity=.55;else{const ae=_e(u);h.position.lerp(ae,Math.min(1,j*10)),h.rotation.y+=(0-h.rotation.y)*.2,K||(S.opacity=1),S.emissive.setHex(13936723),S.emissiveIntensity=.5+Math.sin(b*2+u)*.08}}for(let u=0;u<O;u++){const h=T.current[u];if(!h)continue;if(!K){const W=x.current[u]==="placed"?.55:.05;p.current[u]+=(W-p.current[u])*Math.min(1,j*3)}const S=h.material;S.emissiveIntensity=p.current[u]}if(g.current){const u=!K&&(F>.13&&F<.28||F>.62&&F<.8),h=g.current.material;if(h.opacity+=((u?.22:0)-h.opacity)*.2,h.opacity>.01){const S=Math.max(.05,N.y-Q);g.current.position.set(N.x,N.y-S/2,N.z),g.current.scale.set(1,S,1)}}if(ze.current){const u=ze.current.material,h=r?.46:l?.5:.54;u.emissiveIntensity=h+Math.sin(b*.6)*.05}if(Ie.current&&(Ie.current.intensity=.1+Math.sin(b*.6)*.02),y.current&&oe.current){y.current.rotation.y=b*.015,y.current.rotation.x=Math.sin(b*.12)*.02;const u=y.current.material;if(u.opacity=P?.16:.06,u.emissiveIntensity=P?.2:.07,!r){const h=y.current.geometry.attributes.position,S=oe.current,W=D.current,ae=P?.35:0;for(let L=0;L<h.count;L++){const we=S[L*3],je=S[L*3+1],be=S[L*3+2];We.set(we,je+.3,be);const Ne=We.distanceTo(W);if(Ne<2.2&&ae>0){const de=1-Ne/2.2,ne=de*de*ae;ge.set(we,je,be).normalize(),h.setXYZ(L,we+ge.x*ne,je+ge.y*ne,be+ge.z*ne)}else{const de=h.getX(L),ne=h.getY(L),Be=h.getZ(L);h.setXYZ(L,de+(we-de)*.08,ne+(je-ne)*.08,Be+(be-Be)*.08)}}h.needsUpdate=!0}}if(w.current){w.current.rotation.y=-b*.02,w.current.rotation.z=Math.sin(b*.1)*.015;const u=w.current.material;u.opacity=P?.1:.035,u.emissiveIntensity=P?.14:.05}});const U=s.useMemo(()=>new Ct({color:"#0c0d13",metalness:.92,roughness:.26,envMapIntensity:1.6,clearcoat:.4,clearcoatRoughness:.2}),[]),Me=s.useMemo(()=>new Ot({color:"#d4a853",emissive:"#d4a853",emissiveIntensity:.5,toneMapped:!1}),[]);return e.jsxs("group",{position:[0,0,0],children:[e.jsxs("mesh",{castShadow:!0,receiveShadow:!0,children:[e.jsx("boxGeometry",{args:[4.2,.5,2.2]}),e.jsx("meshPhysicalMaterial",{color:"#050508",metalness:.95,roughness:.08,envMapIntensity:2,clearcoat:.5,clearcoatRoughness:.1})]}),e.jsxs("mesh",{position:[0,.251,0],rotation:[-Math.PI/2,0,0],children:[e.jsx("planeGeometry",{args:[4.14,2.14]}),e.jsx("meshPhysicalMaterial",{color:"#07080e",metalness:.9,roughness:.12,clearcoat:1,clearcoatRoughness:.08,envMapIntensity:1.4})]}),e.jsxs("mesh",{ref:ze,position:[0,0,1.112],children:[e.jsx("boxGeometry",{args:[4,.06,.02]}),e.jsx("meshStandardMaterial",{color:"#d4a853",emissive:"#d4a853",emissiveIntensity:.5,toneMapped:!1})]}),e.jsxs("mesh",{position:[0,0,-1.112],children:[e.jsx("boxGeometry",{args:[4,.06,.02]}),e.jsx("meshStandardMaterial",{color:"#d4a853",emissive:"#d4a853",emissiveIntensity:.4,toneMapped:!1})]}),e.jsxs("mesh",{position:[2.112,0,0],children:[e.jsx("boxGeometry",{args:[.02,.04,2]}),e.jsx("meshStandardMaterial",{color:"#ffffff",emissive:"#ffffff",emissiveIntensity:.25,toneMapped:!1})]}),e.jsxs("mesh",{position:[-2.112,0,0],children:[e.jsx("boxGeometry",{args:[.02,.04,2]}),e.jsx("meshStandardMaterial",{color:"#ffffff",emissive:"#ffffff",emissiveIntensity:.25,toneMapped:!1})]}),e.jsxs("mesh",{position:[$.x,ie+.005,0],rotation:[-Math.PI/2,0,0],children:[e.jsx("ringGeometry",{args:[.52,.55,40]}),e.jsx("meshStandardMaterial",{color:"#d4a853",emissive:"#d4a853",emissiveIntensity:.18,transparent:!0,opacity:.55,toneMapped:!1})]}),Array.from({length:O},(_,j)=>{const b=_e(j);return e.jsxs("group",{children:[e.jsxs("mesh",{position:[b.x,ie+.004,b.z],rotation:[-Math.PI/2,0,0],children:[e.jsx("planeGeometry",{args:[.28,.22]}),e.jsx("meshStandardMaterial",{color:"#03030a",metalness:.8,roughness:.3})]}),e.jsxs("mesh",{ref:I=>{T.current[j]=I},position:[b.x,ie+.006,b.z],rotation:[-Math.PI/2,0,0],children:[e.jsx("ringGeometry",{args:[.13,.15,4,1,Math.PI/4]}),e.jsx("meshStandardMaterial",{color:"#d4a853",emissive:"#d4a853",emissiveIntensity:.05,transparent:!0,opacity:.9,toneMapped:!1})]})]},`cell-${j}`)}),Array.from({length:O},(_,j)=>e.jsxs("mesh",{ref:b=>{M.current[j]=b},position:[$.x+H[j][0],Q+H[j][1],$.z+H[j][2]],rotation:[0,Qe[j],0],children:[e.jsx("boxGeometry",{args:[.18,.012,.13]}),e.jsx("meshStandardMaterial",{color:"#e9e6dd",emissive:"#ffffff",emissiveIntensity:.32,transparent:!0,opacity:1,toneMapped:!1})]},`chit-${j}`)),e.jsxs("group",{ref:a,position:[0,ie,0],children:[e.jsx("mesh",{position:[0,.07,0],material:U,children:e.jsx("cylinderGeometry",{args:[.3,.34,.14,32]})}),e.jsx("mesh",{position:[0,.145,0],material:Me,children:e.jsx("torusGeometry",{args:[.24,.012,10,40]})}),e.jsx("mesh",{position:[0,.28,0],material:U,children:e.jsx("cylinderGeometry",{args:[.11,.14,.3,24]})}),e.jsxs("group",{ref:n,position:[0,.46,0],children:[e.jsx("mesh",{rotation:[Math.PI/2,0,0],material:U,children:e.jsx("cylinderGeometry",{args:[.11,.11,.22,24]})}),e.jsx("mesh",{rotation:[Math.PI/2,0,0],position:[0,0,.115],material:Me,children:e.jsx("torusGeometry",{args:[.08,.01,8,32]})}),e.jsx("mesh",{position:[q/2,0,0],rotation:[0,0,Math.PI/2],material:U,children:e.jsx("capsuleGeometry",{args:[.065,q-.12,6,16]})}),e.jsxs("group",{ref:c,position:[q,0,0],children:[e.jsx("mesh",{rotation:[Math.PI/2,0,0],material:U,children:e.jsx("cylinderGeometry",{args:[.08,.08,.18,20]})}),e.jsx("mesh",{rotation:[Math.PI/2,0,0],position:[0,0,.095],material:Me,children:e.jsx("torusGeometry",{args:[.06,.008,8,28]})}),e.jsx("mesh",{position:[(V-.14)/2,0,0],rotation:[0,0,Math.PI/2],material:U,children:e.jsx("capsuleGeometry",{args:[.05,V-.26,6,14]})}),e.jsxs("group",{ref:o,position:[V-.14,0,0],children:[e.jsx("mesh",{material:U,children:e.jsx("cylinderGeometry",{args:[.05,.06,.1,16]})}),e.jsx("mesh",{position:[0,-.04,0],material:Me,children:e.jsx("torusGeometry",{args:[.045,.007,8,24]})}),e.jsx("mesh",{ref:d,position:[.075,-.1,0],material:U,children:e.jsx("boxGeometry",{args:[.018,.1,.05]})}),e.jsx("mesh",{ref:f,position:[-.075,-.1,0],material:U,children:e.jsx("boxGeometry",{args:[.018,.1,.05]})}),e.jsx("object3D",{ref:i,position:[0,-.14,0]})]})]})]})]}),e.jsxs("mesh",{ref:g,children:[e.jsx("cylinderGeometry",{args:[.035,.06,1,12,1,!0]}),e.jsx("meshBasicMaterial",{color:"#d4a853",transparent:!0,opacity:0,blending:G,depthWrite:!1,side:ce})]}),e.jsx("mesh",{ref:y,geometry:Z,position:[0,.3,0],onPointerEnter:()=>z(!0),onPointerLeave:()=>z(!1),children:e.jsx("meshStandardMaterial",{color:"#b0b0b0",emissive:"#ffffff",emissiveIntensity:.12,wireframe:!0,transparent:!0,opacity:.06,toneMapped:!1})}),e.jsx("mesh",{ref:w,geometry:le,position:[0,.3,0],children:e.jsx("meshStandardMaterial",{color:"#909090",emissive:"#cccccc",emissiveIntensity:.08,wireframe:!0,transparent:!0,opacity:.035,toneMapped:!1})}),e.jsx("pointLight",{ref:Ie,position:[0,.6,0],color:"#d4a853",intensity:.1,distance:4.5,decay:2})]})}const Vt=`
varying vec2 vUv;
varying vec3 vWorldPos;

void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,Nt=`
precision mediump float;

varying vec2 vUv;
varying vec3 vWorldPos;

uniform float uTime;
uniform float uOpacity;
uniform float uScale;
uniform float uSpeed;
uniform float uSeed;
uniform float uEdge;      // how hard the sheet fades at its border
uniform float uCore;      // brightness of the lit core
uniform vec3  uColor;
uniform vec3  uCamPos;
uniform float uNearFade;  // metres of fade-out as the camera enters the sheet
uniform float uHoleRadius; // keeps the machine readable through the haze

// -- value noise + fbm (cheap: no permutation tables) --
float hash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float vnoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
        mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
        mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
    f.z
  );
}

// Two octaves is all this reads at fog opacities, and fog is pure overdraw —
// the third octave cost real frames at 1440 for no visible gain.
float fbm(vec3 p) {
  float v = vnoise(p) * 0.62;
  v += vnoise(p * 2.03) * 0.31;
  return v;
}

void main() {
  // ── Everything that does NOT need noise is computed first, so the
  //    expensive fbm only runs on pixels that can actually contribute.
  //    (Fog is nearly all overdraw: this early-out is the whole ball game.)

  // Soft border so a sheet never shows its rectangle
  vec2 c = (vUv - 0.5) * 2.0;
  float radial = 1.0 - smoothstep(uEdge, 1.0, length(c));
  float vertical = smoothstep(0.0, 0.45, vUv.y) * smoothstep(1.0, 0.62, vUv.y);
  float shape = radial * mix(0.55, 1.0, vertical);

  // Do not bury the machine: thin the haze right around the centre
  float centreDist = length(vWorldPos.xz);
  shape *= mix(0.35, 1.0, smoothstep(uHoleRadius, uHoleRadius + 5.0, centreDist));

  // Fade as the camera pushes through a sheet
  float camDist = distance(vWorldPos, uCamPos);
  shape *= smoothstep(0.6, uNearFade, camDist);

  if (shape * uOpacity < 0.004) discard;

  float t = uTime * uSpeed;
  float n = fbm(vec3(vUv * uScale, uSeed) + vec3(t * 0.55, -t * 0.32, t * 0.11));

  float density = smoothstep(0.16, 0.92, n * shape);
  float alpha = density * uOpacity;
  if (alpha < 0.003) discard;

  gl_FragColor = vec4(uColor * (1.0 + n * uCore), alpha);
}
`;function ot({position:t,size:r,seed:l,opacity:a,scale:n,speed:c,color:o,billboard:i=!1,flat:d=!1,additive:f=!0,edge:g=.25,core:M=.6,nearFade:T=4.5,holeRadius:v=2.4,spin:x=0}){const p=s.useRef(null),y=s.useRef(null),w=s.useMemo(()=>({uTime:{value:l*12},uOpacity:{value:a},uScale:{value:n},uSpeed:{value:c},uSeed:{value:l},uEdge:{value:g},uCore:{value:M},uColor:{value:o},uCamPos:{value:new R},uNearFade:{value:T},uHoleRadius:{value:v}}),[l,a,n,c,o,g,M,T,v]);return E((P,z)=>{if(y.current&&(y.current.uniforms.uTime.value+=z,y.current.uniforms.uCamPos.value.copy(P.camera.position)),!!p.current)if(i){const D=P.camera.position;p.current.rotation.y=Math.atan2(D.x-t[0],D.z-t[2])}else d&&x&&(p.current.rotation.z+=z*x)}),e.jsxs("mesh",{ref:p,position:t,rotation:d?[-Math.PI/2,0,l*2]:[0,0,0],renderOrder:d?1:3,frustumCulled:!1,children:[e.jsx("planeGeometry",{args:[r[0],r[1],1,1]}),e.jsx("shaderMaterial",{ref:y,uniforms:w,vertexShader:Vt,fragmentShader:Nt,transparent:!0,depthWrite:!1,side:ce,blending:f?G:Et,toneMapped:!1})]})}function Bt({tier:t}){const r=t==="high"?{banks:6,ground:2,opacity:1.55,hole:3.4,groundHole:1.6}:t==="medium"?{banks:5,ground:2,opacity:1.6,hole:3.2,groundHole:1.5}:{banks:5,ground:2,opacity:2,hole:1.8,groundHole:1},l=s.useMemo(()=>new xe("#aab6d8"),[]),a=s.useMemo(()=>new xe("#6f79ab"),[]),n=s.useMemo(()=>Array.from({length:r.banks},(o,i)=>{const d=i/r.banks*Math.PI*2+.4,f=6.2+i%3*1.6;return{key:`b${i}`,position:[Math.sin(d)*f,1.15+i%4*.5,Math.cos(d)*f],size:[11+i%3*3,6+i%2*2],seed:i*1.37+.5,opacity:(.165-i%3*.03)*r.opacity,scale:1.5+i%3*.6,speed:.05+i%4*.014}}),[r.banks,r.opacity]),c=s.useMemo(()=>Array.from({length:r.ground},(o,i)=>({key:`g${i}`,position:[0,.08+i*.42,0],size:[24+i*5,24+i*5],seed:7.3+i*2.1,opacity:(.24-i*.045)*r.opacity,scale:2.2+i*.7,speed:.035+i*.012,spin:(i%2===0?1:-1)*.012})),[r.ground,r.opacity]);return e.jsxs("group",{children:[n.map(o=>e.jsx(ot,{position:o.position,size:o.size,seed:o.seed,opacity:o.opacity,scale:o.scale,speed:o.speed,color:l,billboard:!0,additive:!0,edge:.18,core:.5,nearFade:5.5,holeRadius:r.hole},o.key)),c.map(o=>e.jsx(ot,{position:o.position,size:o.size,seed:o.seed,opacity:o.opacity,scale:o.scale,speed:o.speed,color:a,flat:!0,additive:!1,edge:.05,core:.35,nearFade:3.2,holeRadius:r.groundHole,spin:o.spin},o.key))]})}const Yt=`
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
`,qt=`
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
`,Xt=De({uTime:0,uSpeed:.3,uAmplitude:.8,uPhase:0,uLayerOffset:0,uOpacity:.04,uCenterFloor:.1},Yt,qt);lt({StreamLayerMaterial:Xt});const Zt=18,Kt=3,$t=28,Jt=5,Qt=.8,eo=80;function to({index:t,total:r,opacityMultiplier:l,centerFloor:a}){const n=s.useRef(null),c=t/Math.max(r-1,1)*2-1,o=c*Kt,d=.018*(1-Math.abs(c)*.4)*l,f=s.useMemo(()=>new Ft($t,Jt,eo,1),[]);return E(g=>{n.current&&(n.current.uTime=g.clock.elapsedTime)}),e.jsx("mesh",{geometry:f,renderOrder:2,children:e.jsx("streamLayerMaterial",{ref:n,uSpeed:.25,uAmplitude:.9,uPhase:0,uLayerOffset:o,uOpacity:d,uCenterFloor:a,transparent:!0,depthWrite:!1,side:ce,blending:G,toneMapped:!1})})}function oo({layerCount:t=Zt,opacityMultiplier:r=1,centerFloor:l=.1}){const a=s.useMemo(()=>Array.from({length:t},(n,c)=>c),[t]);return e.jsx("group",{position:[0,Qt,0],children:a.map(n=>e.jsx(to,{index:n,total:t,opacityMultiplier:r,centerFloor:l},n))})}function so({tier:t}){const r=t==="low",l=t==="medium";return e.jsxs("mesh",{rotation:[-Math.PI/2,0,0],position:[0,-.6,0],children:[e.jsx("planeGeometry",{args:[80,80]}),e.jsx("meshStandardMaterial",{color:"#010104",metalness:r?.4:l?.65:.9,roughness:r?.82:l?.45:.15,envMapIntensity:r?.015:l?.03:.05})]})}const st=new ht(15e-5,15e-5),rt=new ht(15e-5,15e-5);function ro({tier:t}){const r=t==="high",l=t==="low",a=Ge(c=>c.gl),n=l&&a.capabilities.isWebGL2;return E(()=>{const o=Math.min(Math.abs(window.__kr8tiv_scrollVel??0),1500)/1500,i=r?4e-4:25e-5,d=r?2e-4:12e-5;rt.set(i+o*d,i+o*d),st.lerp(rt,.12)}),l?n?e.jsxs(Ye,{multisampling:0,children:[e.jsx(qe,{luminanceThreshold:.68,luminanceSmoothing:.8,intensity:.42,mipmapBlur:!0,levels:3}),e.jsx(Xe,{mode:Ze.ACES_FILMIC})]}):null:e.jsxs(Ye,{multisampling:0,children:[e.jsx(qe,{luminanceThreshold:r?.6:.72,luminanceSmoothing:r?.7:.78,intensity:r?.5:.32,mipmapBlur:!0,levels:r?5:4}),e.jsx(wt,{blendFunction:jt.NORMAL,offset:st,radialModulation:r,modulationOffset:r?.5:.2}),e.jsx(Xe,{mode:Ze.ACES_FILMIC}),e.jsx(bt,{darkness:r?.7:.55,offset:r?.2:.24})]})}const ao=`
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
`,no=`
precision highp float;
uniform vec3 uColor;
uniform float uOpacity;
uniform sampler2D uTexture;
varying float vAlpha;

void main() {
  vec4 tex = texture2D(uTexture, gl_PointCoord);
  gl_FragColor = vec4(uColor, tex.a * uOpacity * vAlpha);
}
`,io=`
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
`,co=`
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
`,lo=De({uTime:0,uBaseSize:.4,uColor:new xe("#667799"),uOpacity:.035,uTexture:null},ao,no),uo=De({uTime:0,uBaseSize:.2,uColor:new xe("#d4a853"),uOpacity:.06,uTexture:null},io,co);lt({FogParticleMaterial:lo,GoldParticleMaterial:uo});function ke(t,r,l=2){const a=document.createElement("canvas");a.width=t,a.height=t;const n=a.getContext("2d"),c=t/2,o=n.createRadialGradient(c,c,0,c,c,c);o.addColorStop(0,r),o.addColorStop(.3/l,r),o.addColorStop(.6,"rgba(0,0,0,0.02)"),o.addColorStop(1,"rgba(0,0,0,0)"),n.fillStyle=o,n.fillRect(0,0,t,t);const i=new dt(a);return i.needsUpdate=!0,i}const Ae=400;function fo(){const t=s.useRef(null),r=s.useMemo(()=>ke(128,"rgba(100,120,160,0.15)",1.5),[]),l=s.useMemo(()=>{const a=new Float32Array(Ae*3),n=new Float32Array(Ae*3);for(let o=0;o<Ae;o++){const i=Math.random()*Math.PI*2,d=.8+Math.random()*6;a[o*3]=Math.cos(i)*d,a[o*3+1]=(Math.random()-.5)*5,a[o*3+2]=Math.sin(i)*d,n[o*3]=Math.random()*100,n[o*3+1]=.3+Math.random()*.7,n[o*3+2]=Math.random()*Math.PI*2}const c=new Re;return c.setAttribute("position",new ee(a,3)),c.setAttribute("aSeed",new ee(n,3)),c},[]);return E(a=>{t.current&&(t.current.uTime=a.clock.elapsedTime)}),e.jsx("points",{geometry:l,children:e.jsx("fogParticleMaterial",{ref:t,uTexture:r,transparent:!0,blending:G,depthWrite:!1})})}const Ce=80;function ho(){const t=s.useRef(null),r=s.useMemo(()=>ke(64,"rgba(255,255,255,0.15)",2),[]),l=s.useMemo(()=>{const a=new Float32Array(Ce*3),n=new Float32Array(Ce*3);for(let o=0;o<Ce;o++){const i=Math.random()*Math.PI*2,d=.5+Math.random()*2.5;a[o*3]=Math.cos(i)*d,a[o*3+1]=(Math.random()-.5)*2,a[o*3+2]=Math.sin(i)*d,n[o*3]=Math.random()*100,n[o*3+1]=.5+Math.random()*1,n[o*3+2]=Math.random()*Math.PI*2}const c=new Re;return c.setAttribute("position",new ee(a,3)),c.setAttribute("aSeed",new ee(n,3)),c},[]);return E(a=>{t.current&&(t.current.uTime=a.clock.elapsedTime)}),e.jsx("points",{geometry:l,children:e.jsx("fogParticleMaterial",{ref:t,uTexture:r,uColor:new xe("#ffffff"),uBaseSize:.15,uOpacity:.03,transparent:!0,blending:G,depthWrite:!1})})}const Te=200;function po(){const t=s.useRef(null),r=s.useMemo(()=>ke(64,"rgba(212,168,83,0.25)",2),[]),l=s.useMemo(()=>{const a=new Float32Array(Te*3),n=new Float32Array(Te*3);for(let o=0;o<Te;o++){const i=o/Te*Math.PI*2;a[o*3]=Math.cos(i)*2,a[o*3+1]=.3,a[o*3+2]=Math.sin(i)*2,n[o*3]=Math.random()*100,n[o*3+1]=.3+Math.random()*.7,n[o*3+2]=i}const c=new Re;return c.setAttribute("position",new ee(a,3)),c.setAttribute("aSeed",new ee(n,3)),c},[]);return E(a=>{t.current&&(t.current.uTime=a.clock.elapsedTime)}),e.jsx("points",{geometry:l,children:e.jsx("goldParticleMaterial",{ref:t,uTexture:r,transparent:!0,blending:G,depthWrite:!1})})}function mo(){return e.jsxs("group",{children:[e.jsx(fo,{}),e.jsx(ho,{}),e.jsx(po,{})]})}const at=`
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,nt=`
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
`,it=2.05,vo=.05,xo=.4,Le=3.3,ct=Le/2.67,Oe=.2555,pt=1.55,yo=pt/2.67,go=.78;function Mo({compact:t=!1}){const r=s.useRef(null),l=s.useRef(null),a=s.useRef(0),n=St(ft("/images/kr8tiv-logo.png"));s.useMemo(()=>{n.minFilter=Ke,n.magFilter=Ke,n.generateMipmaps=!1},[n]);const c=s.useMemo(()=>({uniforms:{uTime:{value:0},uLogoTexture:{value:n},uIntensity:{value:t?.95:1.75}},vertexShader:at,fragmentShader:nt,transparent:!0,depthWrite:!1,side:ce,blending:G,toneMapped:!1}),[n,t]),o=s.useMemo(()=>({uniforms:{uTime:{value:0},uLogoTexture:{value:n},uIntensity:{value:.85}},vertexShader:at,fragmentShader:nt,transparent:!0,depthWrite:!1,side:ce,blending:G,toneMapped:!1}),[n]),i=s.useRef(null);E(M=>{const T=M.clock.elapsedTime;if(r.current){r.current.position.y=(t?1:it)+Math.sin(T*xo)*vo;const v=M.camera.position;let p=Math.atan2(v.x,v.z)-a.current;for(;p>Math.PI;)p-=Math.PI*2;for(;p<-Math.PI;)p+=Math.PI*2;a.current+=p*.06,r.current.rotation.y=a.current+Math.sin(T*.15)*.015}l.current&&(l.current.uniforms.uTime.value=T),i.current&&(i.current.uniforms.uTime.value=T)});const d=t?Le*.62:Le,f=t?ct*.62:ct,g=t?1:it;return e.jsxs(e.Fragment,{children:[e.jsxs("group",{ref:r,position:[0,g,0],children:[e.jsxs("mesh",{children:[e.jsx("planeGeometry",{args:[d,f]}),e.jsx("shaderMaterial",{ref:l,args:[c]})]}),e.jsx("pointLight",{position:[0,-.5,.2],color:"#ffffff",intensity:.22,distance:3.4,decay:2})]}),e.jsxs("mesh",{position:[0,(g+Oe)/2,0],renderOrder:2,children:[e.jsx("cylinderGeometry",{args:[d*.34,.16,g-Oe,16,1,!0]}),e.jsx("meshBasicMaterial",{color:"#cfd8ff",transparent:!0,opacity:.045,depthWrite:!1,side:ce,blending:G,toneMapped:!1})]}),e.jsxs("mesh",{position:[0,Oe,go],rotation:[-Math.PI/2,0,Math.PI],renderOrder:2,children:[e.jsx("planeGeometry",{args:[pt,yo]}),e.jsx("shaderMaterial",{ref:i,args:[o]})]})]})}function wo(){const t=s.useRef(null),r=s.useRef(new R(0,2,5));return E(l=>{const{pointer:a,viewport:n}=l;r.current.set(a.x*n.width/2,a.y*n.height/2+1,4),t.current&&t.current.position.lerp(r.current,.06)}),e.jsx("pointLight",{ref:t,intensity:.08,color:"#ffffff",distance:6,decay:2})}const ve=12;function jo(){const t=document.createElement("canvas");t.width=64,t.height=64;const r=t.getContext("2d"),l=32,a=r.createRadialGradient(l,l,0,l,l,l);a.addColorStop(0,"rgba(255,255,255,0.5)"),a.addColorStop(.2,"rgba(255,255,255,0.2)"),a.addColorStop(.5,"rgba(212,168,83,0.06)"),a.addColorStop(1,"rgba(0,0,0,0)"),r.fillStyle=a,r.fillRect(0,0,64,64);const n=new dt(t);return n.needsUpdate=!0,n}function bo(){const t=s.useRef(null),r=s.useRef(new R(0,1,4)),l=s.useRef(new R),a=s.useMemo(()=>jo(),[]),{geometry:n,seeds:c}=s.useMemo(()=>{const o=new Float32Array(ve*3),i=new Float32Array(ve*4);for(let f=0;f<ve;f++){const g=f/ve*Math.PI*2,M=.5+Math.random()*.8;o[f*3]=Math.cos(g)*M,o[f*3+1]=.3+Math.random()*.4,o[f*3+2]=Math.sin(g)*M,i[f*4]=Math.random()*Math.PI*2,i[f*4+1]=.15+Math.random()*.25,i[f*4+2]=g,i[f*4+3]=Math.random()}const d=new Re;return d.setAttribute("position",new ee(o,3)),{geometry:d,seeds:i}},[]);return E(o=>{if(!t.current)return;const{pointer:i,viewport:d}=o,f=o.clock.elapsedTime;l.current.set(i.x*d.width/2,i.y*d.height/2+1,3.5),r.current.lerp(l.current,.04);const g=t.current.geometry.attributes.position;for(let M=0;M<ve;M++){const T=c[M*4],v=c[M*4+1],x=c[M*4+2],p=(Math.sin(f*v+T)+1)/2,y=.6+Math.sin(f*.3+T)*.2,w=Math.cos(x+f*.05)*y,P=.3+Math.sin(f*.4+T)*.15,z=Math.sin(x+f*.05)*y,D=r.current.x*.3,X=r.current.y*.3,te=r.current.z*.2,k=p*p*(3-2*p),Z=Math.sin(k*Math.PI)*.2;g.setXYZ(M,w+(D-w)*k,P+(X-P)*k+Z,z+(te-z)*k)}g.needsUpdate=!0}),e.jsx("points",{ref:t,geometry:n,children:e.jsx("pointsMaterial",{map:a,color:"#ffffff",size:.18,transparent:!0,opacity:.1,blending:G,depthWrite:!1,sizeAttenuation:!0})})}function Io({tier:t}){const r=t==="high"?{stream:{layerCount:10,opacityMultiplier:1.5,centerFloor:.3}}:t==="medium"?{stream:{layerCount:8,opacityMultiplier:1.5,centerFloor:.28}}:{stream:{layerCount:6,opacityMultiplier:1.8,centerFloor:.3}};return e.jsxs(e.Fragment,{children:[e.jsx(Pt,{files:ft("/hdr/studio_small_03_1k.hdr"),environmentIntensity:t==="high"?.3:.22}),e.jsx("fog",{attach:"fog",args:["#070a16",6,30]}),e.jsx("ambientLight",{intensity:.05}),e.jsx("directionalLight",{position:[5,8,3],intensity:.25,castShadow:!0}),e.jsx("spotLight",{position:[-3,6,-3],angle:.35,penumbra:.9,intensity:.25,color:"#ffd4a0"}),e.jsx("pointLight",{position:[5,2,3],intensity:.06,color:"#ffffff",distance:12}),e.jsx("pointLight",{position:[-5,2,-3],intensity:.04,color:"#ffffff",distance:12}),e.jsx(Gt,{}),e.jsx(Ht,{tier:t}),e.jsx(Mo,{compact:t==="low"}),e.jsx(Bt,{tier:t}),e.jsx(oo,{...r.stream}),e.jsx(mo,{}),e.jsx(Tt,{count:60,speed:.2,opacity:.15,color:"#d4a853",size:.6,scale:[3.5,1.5,3.5],position:[0,.5,0],noise:[.5,.3,.5]}),e.jsx(wo,{}),e.jsx(bo,{}),e.jsx(so,{tier:t}),e.jsx(ro,{tier:t})]})}export{Io as default};
