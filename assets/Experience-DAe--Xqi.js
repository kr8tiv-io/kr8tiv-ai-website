import{a as He,r as a,b as U,j as e,R as _t,s as Ve,e as wt,d as et,w as tt,X as ot,T as st,y as Ot,B as Et,q as Ft,f as zt,E as Lt,S as Gt,g as kt}from"./r3f-boBB2_4x.js";import{g as De}from"./gsap-DQwqGaOy.js";import{S as bt,s as Dt,a as jt}from"./index-O-bAzeBb.js";import{b as C,t as Ut,ao as Be,ap as Wt,ag as Ht,I as Vt,aq as Bt,ar as Nt,V as ye,as as at,at as $t,m as le,au as D,C as Me,av as Yt,y as qt,al as Ee,k as oe,p as rt}from"./three-DTVirtkr.js";De.registerPlugin(bt);const b=Math.PI/180,Xt=[{approach:{theta:62*b,phi:62*b,radius:12.5,ty:.75,fov:42},hold:{theta:96*b,phi:78*b,radius:5.4,tx:.15,ty:.35,fov:31},approachEase:"power2.out",holdEase:"sine.inOut",split:.5},{approach:{theta:148*b,phi:30*b,radius:9.4,ty:.55,fov:38},hold:{theta:182*b,phi:84*b,radius:5,tx:-.45,ty:.28,fov:34},approachEase:"power1.inOut",holdEase:"power1.out",split:.55},{approach:{theta:214*b,phi:96*b,radius:7.6,tx:.4,ty:.5,fov:46},hold:{theta:236*b,phi:81*b,radius:4.9,tx:1.05,ty:.34,fov:40,roll:-1.5*b},approachEase:"power2.inOut",holdEase:"sine.inOut",split:.45},{approach:{theta:262*b,phi:58*b,radius:6.2,ty:.4,fov:33},hold:{theta:292*b,phi:34*b,radius:13.5,ty:.9,fov:40},approachEase:"power2.in",holdEase:"power2.out",split:.35},{approach:{theta:320*b,phi:70*b,radius:10.5,ty:.7,fov:36},hold:{theta:352*b,phi:86*b,radius:4,tx:-.75,ty:.55,fov:33,roll:1.8*b},approachEase:"power3.out",holdEase:"sine.inOut",split:.4},{approach:{theta:384*b,phi:74*b,radius:7,ty:.4,fov:34},hold:{theta:412*b,phi:46*b,radius:15,ty:1,fov:42},approachEase:"sine.inOut",holdEase:"power1.inOut",split:.45}],nt={theta:-30*b,phi:76*b,radius:8.6,ty:.35,fov:35},ge={theta:-52*b,phi:40*b,radius:30,ty:1.6,fov:46};function it(){return typeof window<"u"&&window.innerWidth<768}function Zt(){const{camera:t}=He(),s=a.useRef(it()),l=a.useRef(s.current?1.34:1),r=a.useRef(s.current?1.2:1),c=a.useRef(typeof window<"u"&&window.matchMedia("(prefers-reduced-motion: reduce)").matches),n=a.useRef({theta:ge.theta,phi:ge.phi,radius:ge.radius,tx:0,ty:ge.ty,tz:0,fov:ge.fov,roll:0}),o=a.useRef(null),i=a.useRef(!1),d=a.useRef(new C),f=a.useRef(0),v=a.useRef(0),x=y=>({theta:y.theta,phi:y.phi,radius:y.radius*l.current,tx:y.tx??0,ty:y.ty??.3,tz:y.tz??0,fov:(y.fov??35)*r.current,roll:y.roll??0}),p=()=>{if(o.current)return;const h=1/(Dt.length+1-1),u=De.timeline({scrollTrigger:{trigger:".scroll-container",start:"top top",end:"bottom bottom",scrub:1.1,fastScrollEnd:!0,invalidateOnRefresh:!0}});Xt.forEach((g,w)=>{const S=w*h,A=g.split??.5;u.to(n.current,{...x(g.approach),duration:h*A,ease:g.approachEase??"power2.out"},S),u.to(n.current,{...x(g.hold),duration:h*(1-A),ease:g.holdEase??"sine.inOut"},S+h*A)}),o.current=u,bt.refresh()};return a.useEffect(()=>{const y=()=>{const h=it();h!==s.current&&(s.current=h,l.current=h?1.34:1,r.current=h?1.2:1,o.current?.scrollTrigger?.kill(),o.current?.kill(),o.current=null,p())};return window.addEventListener("resize",y),()=>window.removeEventListener("resize",y)},[]),a.useEffect(()=>{const y=()=>{i.current||(i.current=!0,De.to(n.current,{...x(nt),duration:3,ease:"power3.inOut",onComplete:()=>{p(),window.__kr8tiv_intro_zoom_complete=!0,window.dispatchEvent(new CustomEvent("intro-zoom-complete"))}}))};window.addEventListener("intro-complete",y);const h=setTimeout(()=>{n.current.radius>nt.radius*l.current+1&&y()},5e3);return()=>{window.removeEventListener("intro-complete",y),clearTimeout(h),o.current?.scrollTrigger?.kill(),o.current?.kill(),o.current=null}},[]),U((y,h)=>{const u=y.clock.elapsedTime,g=n.current,w=c.current?0:1,S=Math.min(Math.abs(window.__kr8tiv_scrollVel??0),2e3)/2e3,A=Math.sign(window.__kr8tiv_scrollVel??0)*S;f.current+=(S*.9*w-f.current)*Math.min(1,h*3),v.current+=(A*.9*b*w-v.current)*Math.min(1,h*3);const z=Math.sin(u*.07)*.055*w,_=Math.sin(u*.051+1.3)*.032*w,G=Math.sin(u*.089+.6)*.22*w,V=(Math.sin(u*.63)+Math.sin(u*1.17+2.1)*.5)*.006*w,K=(Math.sin(u*.71+.9)+Math.sin(u*1.43)*.5)*.005*w,he=Math.sin(u*.47+1.7)*.35*b*w,se=g.theta+z+V,fe=Ut.clamp(g.phi+_+K,.16,Math.PI-.16),ae=Math.max(2.2,g.radius+G+f.current);t.position.set(ae*Math.sin(fe)*Math.sin(se),ae*Math.cos(fe),ae*Math.sin(fe)*Math.cos(se));const de=s.current?1:0;d.current.set(g.tx,g.ty+de,g.tz),t.lookAt(d.current);const we=g.roll+he+v.current;we!==0&&t.rotateZ(we);const O=t,k=g.fov+f.current*1.5;Math.abs(O.fov-k)>.01&&(O.fov=k,O.updateProjectionMatrix())}),null}const ue=new Map;function Oe(t){const s=document.createElement("canvas");return s.width=t,s.height=t,s}function Ne(t){let s=t>>>0;return()=>(s=s*1664525+1013904223>>>0,s/4294967296)}function $e(t,s,l){const r=new Be(t);return r.wrapS=r.wrapT=Wt,r.repeat.set(l,l),r.colorSpace=Ht,r.anisotropy=8,r.needsUpdate=!0,r}function ct(t=512,s=3){const l=`rough-${t}-${s}`,r=ue.get(l);if(r)return r;const c=Oe(t),n=c.getContext("2d"),o=Ne(20260804);n.fillStyle="#6a6a6a",n.fillRect(0,0,t,t),n.globalAlpha=.14;for(let d=0;d<t*2.2;d++){const f=o()*t,v=t*(.25+o()*.75),x=o()*t,p=Math.floor(90+o()*90);n.strokeStyle=`rgb(${p},${p},${p})`,n.lineWidth=o()<.85?1:2,n.beginPath(),n.moveTo(x,f),n.lineTo(x+v,f+(o()-.5)*1.5),n.stroke()}n.globalAlpha=.5;for(let d=0;d<26;d++){const f=o()*t,v=o()*t,x=t*(.04+o()*.13),p=n.createRadialGradient(f,v,0,f,v,x),y=o()<.5;p.addColorStop(0,y?"rgba(40,40,40,0.55)":"rgba(150,150,150,0.5)"),p.addColorStop(1,"rgba(0,0,0,0)"),n.fillStyle=p,n.beginPath(),n.arc(f,v,x,0,Math.PI*2),n.fill()}n.globalAlpha=1;const i=$e(c,!1,s);return ue.set(l,i),i}function lt(t=512,s=3,l=1.6){const r=`norm-${t}-${s}-${l}`,c=ue.get(r);if(c)return c;const o=Oe(t).getContext("2d"),i=Ne(7761);o.fillStyle="#808080",o.fillRect(0,0,t,t),o.globalAlpha=.09;for(let h=0;h<t*3;h++){const u=i()*t,g=i()*t,w=t*(.1+i()*.5),S=i()<.5?40:210;o.strokeStyle=`rgb(${S},${S},${S})`,o.lineWidth=1,o.beginPath(),o.moveTo(g,u),o.lineTo(g+w,u+(i()-.5)*2),o.stroke()}o.globalAlpha=.35;for(let h=0;h<18;h++){const u=i()*t,g=i()*t,w=t*(.08+i()*.3),S=(i()-.5)*.6;o.strokeStyle=i()<.5?"#2a2a2a":"#d8d8d8",o.lineWidth=i()<.7?1:2,o.beginPath(),o.moveTo(u,g),o.lineTo(u+Math.cos(S)*w,g+Math.sin(S)*w),o.stroke()}o.globalAlpha=1;const d=o.getImageData(0,0,t,t).data,f=Oe(t),v=f.getContext("2d"),x=v.createImageData(t,t),p=(h,u)=>{const g=(h+t)%t,w=(u+t)%t;return d[(w*t+g)*4]/255};for(let h=0;h<t;h++)for(let u=0;u<t;u++){const g=p(u-1,h-1)+2*p(u-1,h)+p(u-1,h+1)-(p(u+1,h-1)+2*p(u+1,h)+p(u+1,h+1)),w=p(u-1,h-1)+2*p(u,h-1)+p(u+1,h-1)-(p(u-1,h+1)+2*p(u,h+1)+p(u+1,h+1)),S=g*l,A=w*l,z=1,_=Math.hypot(S,A,z),G=(h*t+u)*4;x.data[G]=(S/_*.5+.5)*255,x.data[G+1]=(A/_*.5+.5)*255,x.data[G+2]=(z/_*.5+.5)*255,x.data[G+3]=255}v.putImageData(x,0,0);const y=$e(f,!1,s);return ue.set(r,y),y}function ut(t=256,s=2){const l=`grime-${t}-${s}`,r=ue.get(l);if(r)return r;const c=Oe(t),n=c.getContext("2d"),o=Ne(31337);n.fillStyle="#8e8e8e",n.fillRect(0,0,t,t);for(let d=0;d<60;d++){const f=o()*t,v=o()*t,x=t*(.05+o()*.22),p=n.createRadialGradient(f,v,0,f,v,x);p.addColorStop(0,`rgba(${o()<.6?60:190},${o()<.6?60:190},70,0.35)`),p.addColorStop(1,"rgba(0,0,0,0)"),n.fillStyle=p,n.beginPath(),n.arc(f,v,x,0,Math.PI*2),n.fill()}const i=$e(c,!1,s);return ue.set(l,i),i}const ce=.25,te=ce+.03,Q=new C(-1.15,te,0),Kt=1.15,Ie=.3,L=9,$=[[-.18,0,-.15],[.11,.012,.16],[.02,.024,-.03],[-.08,.036,.11],[.19,0,-.08],[-.21,.012,.06],[.06,.048,.05],[-.02,.06,-.13],[.14,.024,.1]],ht=[.6,-.9,.25,-.4,1.2,-.15,.8,-.65,.35];function Le(t){const s=t%3,l=Math.floor(t/3);return new C(Kt-Ie+s*Ie,te,-Ie+l*Ie)}const Ae=ce+.46,Z=.85,Y=.85;function Jt(t,s){const l=t*t+s*s,r=Math.min(Math.sqrt(l),Z+Y-.01),c=Math.max(-1,Math.min(1,(r*r-Z*Z-Y*Y)/(2*Z*Y))),n=Math.acos(c);return[Math.atan2(s,Math.max(t,.001))+Math.atan2(Y*Math.sin(n),Z+Y*Math.cos(n)),-n]}const ee=4,Ue=2.6,Qt=L*ee+Ue,ve=[0,.13,.2,.3,.56,.68,.74,.84,1],ft=.2,dt=.74;function eo(t){return t*t*(3-2*t)}function to({tier:t}){const s=t==="low",l=t==="medium",r=a.useRef(null),c=a.useRef(null),n=a.useRef(null),o=a.useRef(null),i=a.useRef(null),d=a.useRef(null),f=a.useRef(null),v=a.useRef(null),x=a.useRef([]),p=a.useRef([]),y=a.useRef(0),h=a.useRef(new Array(L).fill("pile")),u=a.useRef(new Array(L).fill(0)),g=a.useRef(null),w=a.useRef(null),[S,A]=a.useState(!1),z=a.useRef(new C),{raycaster:_,pointer:G,camera:V}=He(),K=a.useMemo(()=>new Vt(2.9,2),[]),he=a.useMemo(()=>new Bt(2.2,1),[]),se=a.useRef(null),fe=a.useRef(null);a.useEffect(()=>{se.current=new Float32Array(K.attributes.position.array),fe.current=new Float32Array(he.attributes.position.array)},[K,he]);const ae=a.useMemo(()=>new Nt(new C(0,0,1),0),[]),de=a.useMemo(()=>new C,[]),we=a.useCallback(()=>{_.setFromCamera(G,V),_.ray.intersectPlane(ae,de),z.current.copy(de)},[_,G,V,ae,de]),O=a.useMemo(()=>new C,[]),k=a.useMemo(()=>new C,[]),be=a.useMemo(()=>new C,[]),qe=a.useMemo(()=>new C,[]),Xe=a.useMemo(()=>new C,[]),je=a.useMemo(()=>new C,[]),Fe=a.useRef(null),ze=a.useRef(null),Ze=(I,j,P)=>{const T=be.set(Q.x+$[P][0],te+$[P][1],Q.z+$[P][2]),F=Le(P);switch(j){case 0:return I.set(0,Ae+.55,.4);case 1:return I.set(T.x,T.y+.42,T.z);case 2:return I.set(T.x,T.y+.13,T.z);case 3:return I.set(T.x,T.y+.6,T.z);case 4:return I.set((T.x+F.x)/2,te+.95,(T.z+F.z)/2);case 5:return I.set(F.x,F.y+.45,F.z);case 6:return I.set(F.x,F.y+.14,F.z);case 7:return I.set(F.x,F.y+.5,F.z);default:return I.set(0,Ae+.55,.4)}};U((I,j)=>{const P=I.clock.elapsedTime;S&&we();const F=1+Math.min(Math.abs(window.__kr8tiv_scrollVel??0),1200)/1200*.9;y.current=(y.current+Math.min(j,.05)*F)%Qt;const pe=y.current,J=pe>=L*ee,q=Math.min(Math.floor(pe/ee),L-1),W=J?1:(pe-q*ee)/ee;if(J){const m=(pe-L*ee)/Ue;for(let M=0;M<L;M++){const R=Math.sin(m*Math.PI*3+M*.3)*.5+.5;u.current[M]=Math.max(0,(1-m)*(.55+R*.45));const N=x.current[M];if(N&&h.current[M]==="placed"){const ne=N.material;ne.opacity=Math.max(0,1-m*1.6),m>.85&&(h.current[M]="pile")}}}else W>=ft&&h.current[q]==="pile"&&(h.current[q]="carried"),W>=dt&&h.current[q]==="carried"&&(h.current[q]="placed",u.current[q]=1.4);let X=0;for(;X<ve.length-2&&W>ve[X+1];)X++;const Pt=eo(Math.max(0,Math.min(1,(W-ve[X])/(ve[X+1]-ve[X]))));Ze(be,X,q);const Tt=O.copy(be);if(Ze(qe,X+1,q),Tt.lerp(qe,Pt),J){const m=(pe-L*ee)/Ue;O.set(Math.sin(m*Math.PI*2)*.8,Ae+.5,.5)}const Rt=Math.atan2(O.z,O.x),It=Math.max(.15,Math.sqrt(O.x*O.x+O.z*O.z)),[At,Ct]=Jt(It,O.y-Ae);if(r.current){let m=Rt-r.current.rotation.y;for(;m>Math.PI;)m-=Math.PI*2;for(;m<-Math.PI;)m+=Math.PI*2;r.current.rotation.y+=m*Math.min(1,j*7)}c.current&&(c.current.rotation.z+=(At-c.current.rotation.z)*Math.min(1,j*9)),n.current&&(n.current.rotation.z+=(Ct-n.current.rotation.z)*Math.min(1,j*9)),o.current&&c.current&&n.current&&(o.current.rotation.z=-Math.PI/2-(c.current.rotation.z+n.current.rotation.z));const Ke=!J&&W>=ft&&W<dt?.035:.075;d.current&&(d.current.position.x+=(Ke-d.current.position.x)*.25),f.current&&(f.current.position.x+=(-Ke-f.current.position.x)*.25),i.current&&i.current.getWorldPosition(k);for(let m=0;m<L;m++){const M=x.current[m];if(!M)continue;const R=M.material,N=h.current[m];if(N==="pile")M.position.set(Q.x+$[m][0],te+$[m][1],Q.z+$[m][2]),M.rotation.set(0,ht[m],0),R.opacity=Math.min(1,R.opacity+j*1.5),R.emissive.setHex(16777215),R.emissiveIntensity=.32+Math.sin(P*1.4+m)*.06;else if(N==="carried")M.position.lerp(be.set(k.x,k.y-.09,k.z),Math.min(1,j*18)),M.rotation.y+=(0-M.rotation.y)*.1,R.opacity=1,R.emissiveIntensity=.55;else{const ne=Le(m);M.position.lerp(ne,Math.min(1,j*10)),M.rotation.y+=(0-M.rotation.y)*.2,J||(R.opacity=1),R.emissive.setHex(13936723),R.emissiveIntensity=.5+Math.sin(P*2+m)*.08}}for(let m=0;m<L;m++){const M=p.current[m];if(!M)continue;if(!J){const N=h.current[m]==="placed"?.55:.05;u.current[m]+=(N-u.current[m])*Math.min(1,j*3)}const R=M.material;R.emissiveIntensity=u.current[m]}if(v.current){const m=!J&&(W>.13&&W<.28||W>.62&&W<.8),M=v.current.material;if(M.opacity+=((m?.22:0)-M.opacity)*.2,M.opacity>.01){const R=Math.max(.05,k.y-te);v.current.position.set(k.x,k.y-R/2,k.z),v.current.scale.set(1,R,1)}}if(Fe.current){const m=Fe.current.material,M=s?.46:l?.5:.54;m.emissiveIntensity=M+Math.sin(P*.6)*.05}if(ze.current&&(ze.current.intensity=.1+Math.sin(P*.6)*.02),g.current&&se.current){g.current.rotation.y=P*.015,g.current.rotation.x=Math.sin(P*.12)*.02;const m=g.current.material;if(m.opacity=S?.16:.06,m.emissiveIntensity=S?.2:.07,!s){const M=g.current.geometry.attributes.position,R=se.current,N=z.current,ne=S?.35:0;for(let H=0;H<M.count;H++){const Pe=R[H*3],Te=R[H*3+1],Re=R[H*3+2];Xe.set(Pe,Te+.3,Re);const Je=Xe.distanceTo(N);if(Je<2.2&&ne>0){const me=1-Je/2.2,ie=me*me*ne;je.set(Pe,Te,Re).normalize(),M.setXYZ(H,Pe+je.x*ie,Te+je.y*ie,Re+je.z*ie)}else{const me=M.getX(H),ie=M.getY(H),Qe=M.getZ(H);M.setXYZ(H,me+(Pe-me)*.08,ie+(Te-ie)*.08,Qe+(Re-Qe)*.08)}}M.needsUpdate=!0}}if(w.current){w.current.rotation.y=-P*.02,w.current.rotation.z=Math.sin(P*.1)*.015;const m=w.current.material;m.opacity=S?.1:.035,m.emissiveIntensity=S?.14:.05}});const E=a.useMemo(()=>s?{roughnessMap:ct(256,3),normalMap:lt(256,3,1.2),grime:ut(128,2),normalScale:new ye(.35,.35)}:{roughnessMap:ct(512,3),normalMap:lt(512,3,1.6),grime:ut(256,2),normalScale:new ye(.55,.55)},[s]),B=a.useMemo(()=>new at({color:"#0c0d13",metalness:.94,roughness:.32,roughnessMap:E.roughnessMap,normalMap:E.normalMap,normalScale:E.normalScale,envMapIntensity:2.1,clearcoat:.55,clearcoatRoughness:.22}),[E]),re=a.useMemo(()=>new at({color:"#1a1d26",metalness:1,roughness:.19,roughnessMap:E.roughnessMap,normalMap:E.normalMap,normalScale:E.normalScale,envMapIntensity:2.6,clearcoat:.7,clearcoatRoughness:.14}),[E]),Se=a.useMemo(()=>new $t({color:"#d4a853",emissive:"#d4a853",emissiveIntensity:.5,toneMapped:!1}),[]);return e.jsxs("group",{position:[0,0,0],children:[e.jsx(_t,{args:[4.2,.5,2.2],radius:.035,smoothness:3,castShadow:!0,receiveShadow:!0,children:e.jsx("meshPhysicalMaterial",{color:"#050508",metalness:.96,roughness:.24,roughnessMap:E.roughnessMap,normalMap:E.normalMap,normalScale:E.normalScale,envMapIntensity:2.4,clearcoat:.6,clearcoatRoughness:.14})}),e.jsxs("mesh",{position:[0,.251,0],rotation:[-Math.PI/2,0,0],children:[e.jsx("planeGeometry",{args:[4.14,2.14]}),e.jsx("meshPhysicalMaterial",{color:"#07080e",metalness:.92,roughness:.16,roughnessMap:E.roughnessMap,normalMap:E.normalMap,normalScale:new ye(.25,.25),clearcoat:1,clearcoatRoughness:.06,envMapIntensity:1.9})]}),[-1.62,-.55,.55,1.62].map(I=>e.jsxs("mesh",{position:[I,.2525,0],rotation:[-Math.PI/2,0,0],children:[e.jsx("planeGeometry",{args:[.012,2.06]}),e.jsx("meshStandardMaterial",{color:"#000004",metalness:.6,roughness:.85})]},`seam-${I}`)),!s&&Array.from({length:14},(I,j)=>{const P=-1.95+j*.3;return[.92,-.92].map(T=>e.jsx("mesh",{position:[P,.2535,T],material:re,children:e.jsx("cylinderGeometry",{args:[.016,.016,.008,8]})},`bolt-${j}-${T}`))}),Array.from({length:9},(I,j)=>{const P=-1.1+j*.275;return[1.101,-1.101].map(T=>e.jsx("mesh",{position:[P,-.06,T],material:re,children:e.jsx("boxGeometry",{args:[.16,.16,.012]})},`vent-${j}-${T}`))}),e.jsxs("mesh",{ref:Fe,position:[0,0,1.112],children:[e.jsx("boxGeometry",{args:[4,.06,.02]}),e.jsx("meshStandardMaterial",{color:"#d4a853",emissive:"#d4a853",emissiveIntensity:.3,toneMapped:!1})]}),e.jsxs("mesh",{position:[0,0,-1.112],children:[e.jsx("boxGeometry",{args:[4,.06,.02]}),e.jsx("meshStandardMaterial",{color:"#d4a853",emissive:"#d4a853",emissiveIntensity:.24,toneMapped:!1})]}),e.jsxs("mesh",{position:[2.112,0,0],children:[e.jsx("boxGeometry",{args:[.02,.04,2]}),e.jsx("meshStandardMaterial",{color:"#ffffff",emissive:"#ffffff",emissiveIntensity:.11,toneMapped:!1})]}),e.jsxs("mesh",{position:[-2.112,0,0],children:[e.jsx("boxGeometry",{args:[.02,.04,2]}),e.jsx("meshStandardMaterial",{color:"#ffffff",emissive:"#ffffff",emissiveIntensity:.11,toneMapped:!1})]}),e.jsxs("mesh",{position:[Q.x,ce+.005,0],rotation:[-Math.PI/2,0,0],children:[e.jsx("ringGeometry",{args:[.52,.55,40]}),e.jsx("meshStandardMaterial",{color:"#d4a853",emissive:"#d4a853",emissiveIntensity:.18,transparent:!0,opacity:.55,toneMapped:!1})]}),Array.from({length:L},(I,j)=>{const P=Le(j);return e.jsxs("group",{children:[e.jsxs("mesh",{position:[P.x,ce+.004,P.z],rotation:[-Math.PI/2,0,0],children:[e.jsx("planeGeometry",{args:[.28,.22]}),e.jsx("meshStandardMaterial",{color:"#03030a",metalness:.8,roughness:.3})]}),e.jsxs("mesh",{ref:T=>{p.current[j]=T},position:[P.x,ce+.006,P.z],rotation:[-Math.PI/2,0,0],children:[e.jsx("ringGeometry",{args:[.13,.15,4,1,Math.PI/4]}),e.jsx("meshStandardMaterial",{color:"#d4a853",emissive:"#d4a853",emissiveIntensity:.05,transparent:!0,opacity:.9,toneMapped:!1})]})]},`cell-${j}`)}),Array.from({length:L},(I,j)=>e.jsxs("mesh",{ref:P=>{x.current[j]=P},position:[Q.x+$[j][0],te+$[j][1],Q.z+$[j][2]],rotation:[0,ht[j],0],children:[e.jsx("boxGeometry",{args:[.18,.012,.13]}),e.jsx("meshStandardMaterial",{color:"#e9e6dd",emissive:"#ffffff",emissiveIntensity:.32,transparent:!0,opacity:1,toneMapped:!1})]},`chit-${j}`)),e.jsxs("group",{ref:r,position:[0,ce,0],children:[e.jsx("mesh",{position:[0,.07,0],material:B,children:e.jsx("cylinderGeometry",{args:[.3,.34,.14,32]})}),!s&&e.jsxs(e.Fragment,{children:[e.jsx("mesh",{position:[0,.142,0],material:re,children:e.jsx("cylinderGeometry",{args:[.285,.285,.014,32]})}),Array.from({length:10},(I,j)=>{const P=j/10*Math.PI*2;return e.jsx("mesh",{position:[Math.cos(P)*.255,.152,Math.sin(P)*.255],material:re,children:e.jsx("cylinderGeometry",{args:[.012,.012,.008,6]})},`tbolt-${j}`)})]}),e.jsx("mesh",{position:[0,.145,0],material:Se,children:e.jsx("torusGeometry",{args:[.24,.012,10,40]})}),e.jsx("mesh",{position:[0,.28,0],material:B,children:e.jsx("cylinderGeometry",{args:[.11,.14,.3,24]})}),!s&&e.jsx("mesh",{position:[.13,.28,0],rotation:[0,0,.06],material:re,children:e.jsx("cylinderGeometry",{args:[.018,.018,.3,8]})}),e.jsxs("group",{ref:c,position:[0,.46,0],children:[e.jsx("mesh",{rotation:[Math.PI/2,0,0],material:B,children:e.jsx("cylinderGeometry",{args:[.11,.11,.22,24]})}),!s&&e.jsx("mesh",{rotation:[Math.PI/2,0,0],position:[0,0,-.112],material:re,children:e.jsx("cylinderGeometry",{args:[.095,.095,.016,20]})}),e.jsx("mesh",{rotation:[Math.PI/2,0,0],position:[0,0,.115],material:Se,children:e.jsx("torusGeometry",{args:[.08,.01,8,32]})}),e.jsx("mesh",{position:[Z/2,0,0],rotation:[0,0,Math.PI/2],material:B,children:e.jsx("capsuleGeometry",{args:[.065,Z-.12,6,16]})}),e.jsxs("group",{ref:n,position:[Z,0,0],children:[e.jsx("mesh",{rotation:[Math.PI/2,0,0],material:B,children:e.jsx("cylinderGeometry",{args:[.08,.08,.18,20]})}),e.jsx("mesh",{rotation:[Math.PI/2,0,0],position:[0,0,.095],material:Se,children:e.jsx("torusGeometry",{args:[.06,.008,8,28]})}),e.jsx("mesh",{position:[(Y-.14)/2,0,0],rotation:[0,0,Math.PI/2],material:B,children:e.jsx("capsuleGeometry",{args:[.05,Y-.26,6,14]})}),e.jsxs("group",{ref:o,position:[Y-.14,0,0],children:[e.jsx("mesh",{material:B,children:e.jsx("cylinderGeometry",{args:[.05,.06,.1,16]})}),e.jsx("mesh",{position:[0,-.04,0],material:Se,children:e.jsx("torusGeometry",{args:[.045,.007,8,24]})}),e.jsx("mesh",{ref:d,position:[.075,-.1,0],material:B,children:e.jsx("boxGeometry",{args:[.018,.1,.05]})}),e.jsx("mesh",{ref:f,position:[-.075,-.1,0],material:B,children:e.jsx("boxGeometry",{args:[.018,.1,.05]})}),e.jsx("object3D",{ref:i,position:[0,-.14,0]})]})]})]})]}),e.jsxs("mesh",{ref:v,children:[e.jsx("cylinderGeometry",{args:[.035,.06,1,12,1,!0]}),e.jsx("meshBasicMaterial",{color:"#d4a853",transparent:!0,opacity:0,blending:D,depthWrite:!1,side:le})]}),e.jsx("mesh",{ref:g,geometry:K,position:[0,.3,0],onPointerEnter:()=>A(!0),onPointerLeave:()=>A(!1),children:e.jsx("meshStandardMaterial",{color:"#b0b0b0",emissive:"#ffffff",emissiveIntensity:.12,wireframe:!0,transparent:!0,opacity:.06,toneMapped:!1})}),e.jsx("mesh",{ref:w,geometry:he,position:[0,.3,0],children:e.jsx("meshStandardMaterial",{color:"#909090",emissive:"#cccccc",emissiveIntensity:.08,wireframe:!0,transparent:!0,opacity:.035,toneMapped:!1})}),e.jsx("pointLight",{ref:ze,position:[0,.6,0],color:"#d4a853",intensity:.1,distance:4.5,decay:2})]})}const oo=`
varying vec2 vUv;
varying vec3 vWorldPos;

void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,so=`
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
uniform float uFarFade;   // distance at which the sheet dissolves again
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

  // Fade as the camera pushes through a sheet…
  float camDist = distance(vWorldPos, uCamPos);
  shape *= smoothstep(0.6, uNearFade, camDist);

  // …and again as it pulls far back. Billboards stop overlapping at distance
  // and start reading as separate blobs instead of one body of air.
  shape *= 1.0 - smoothstep(uFarFade, uFarFade + 9.0, camDist);

  if (shape * uOpacity < 0.004) discard;

  float t = uTime * uSpeed;
  float n = fbm(vec3(vUv * uScale, uSeed) + vec3(t * 0.55, -t * 0.32, t * 0.11));

  float density = smoothstep(0.16, 0.92, n * shape);
  float alpha = density * uOpacity;
  if (alpha < 0.003) discard;

  gl_FragColor = vec4(uColor * (1.0 + n * uCore), alpha);
}
`;function pt({position:t,size:s,seed:l,opacity:r,scale:c,speed:n,color:o,billboard:i=!1,flat:d=!1,additive:f=!0,edge:v=.25,core:x=.6,nearFade:p=4.5,farFade:y=17,holeRadius:h=2.4,spin:u=0}){const g=a.useRef(null),w=a.useRef(null),S=a.useMemo(()=>({uTime:{value:l*12},uOpacity:{value:r},uScale:{value:c},uSpeed:{value:n},uSeed:{value:l},uEdge:{value:v},uCore:{value:x},uColor:{value:o},uCamPos:{value:new C},uNearFade:{value:p},uFarFade:{value:y},uHoleRadius:{value:h}}),[l,r,c,n,o,v,x,p,y,h]);return U((A,z)=>{if(w.current&&(w.current.uniforms.uTime.value+=z,w.current.uniforms.uCamPos.value.copy(A.camera.position)),!!g.current)if(i){const _=A.camera.position;g.current.rotation.y=Math.atan2(_.x-t[0],_.z-t[2])}else d&&u&&(g.current.rotation.z+=z*u)}),e.jsxs("mesh",{ref:g,position:t,rotation:d?[-Math.PI/2,0,l*2]:[0,0,0],renderOrder:d?1:3,frustumCulled:!1,children:[e.jsx("planeGeometry",{args:[s[0],s[1],1,1]}),e.jsx("shaderMaterial",{ref:w,uniforms:S,vertexShader:oo,fragmentShader:so,transparent:!0,depthWrite:!1,side:le,blending:f?D:Yt,toneMapped:!1})]})}function ao({tier:t}){const s=t==="high"?{banks:7,ground:3,opacity:2.3,hole:3,groundHole:1.4}:t==="medium"?{banks:6,ground:2,opacity:2.35,hole:2.9,groundHole:1.4}:{banks:5,ground:2,opacity:2.4,hole:1.8,groundHole:1},l=a.useMemo(()=>new Me("#aab6d8"),[]),r=a.useMemo(()=>new Me("#6f79ab"),[]),c=a.useMemo(()=>Array.from({length:s.banks},(o,i)=>{const d=i/s.banks*Math.PI*2+.4,f=6.2+i%3*1.6;return{key:`b${i}`,position:[Math.sin(d)*f,1.15+i%4*.5,Math.cos(d)*f],size:[11+i%3*3,6+i%2*2],seed:i*1.37+.5,opacity:(.165-i%3*.03)*s.opacity,scale:1.5+i%3*.6,speed:.05+i%4*.014}}),[s.banks,s.opacity]),n=a.useMemo(()=>Array.from({length:s.ground},(o,i)=>({key:`g${i}`,position:[0,.08+i*.42,0],size:[24+i*5,24+i*5],seed:7.3+i*2.1,opacity:(.24-i*.045)*s.opacity,scale:2.2+i*.7,speed:.035+i*.012,spin:(i%2===0?1:-1)*.012})),[s.ground,s.opacity]);return e.jsxs("group",{children:[c.map(o=>e.jsx(pt,{position:o.position,size:o.size,seed:o.seed,opacity:o.opacity,scale:o.scale,speed:o.speed,color:l,billboard:!0,additive:!0,edge:.18,core:.5,nearFade:5.5,holeRadius:s.hole},o.key)),n.map(o=>e.jsx(pt,{position:o.position,size:o.size,seed:o.seed,opacity:o.opacity,scale:o.scale,speed:o.speed,color:r,flat:!0,additive:!1,edge:.05,core:.35,nearFade:3.2,holeRadius:s.groundHole,spin:o.spin},o.key))]})}const ro=`
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
`,no=`
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
`,io=Ve({uTime:0,uSpeed:.3,uAmplitude:.8,uPhase:0,uLayerOffset:0,uOpacity:.04,uCenterFloor:.1},ro,no);wt({StreamLayerMaterial:io});const co=18,lo=3,uo=28,ho=5,fo=.8,po=80;function mo({index:t,total:s,opacityMultiplier:l,centerFloor:r}){const c=a.useRef(null),n=t/Math.max(s-1,1)*2-1,o=n*lo,d=.018*(1-Math.abs(n)*.4)*l,f=a.useMemo(()=>new qt(uo,ho,po,1),[]);return U(v=>{c.current&&(c.current.uTime=v.clock.elapsedTime)}),e.jsx("mesh",{geometry:f,renderOrder:2,children:e.jsx("streamLayerMaterial",{ref:c,uSpeed:.25,uAmplitude:.9,uPhase:0,uLayerOffset:o,uOpacity:d,uCenterFloor:r,transparent:!0,depthWrite:!1,side:le,blending:D,toneMapped:!1})})}function go({layerCount:t=co,opacityMultiplier:s=1,centerFloor:l=.1}){const r=a.useMemo(()=>Array.from({length:t},(c,n)=>n),[t]);return e.jsx("group",{position:[0,fo,0],children:r.map(c=>e.jsx(mo,{index:c,total:t,opacityMultiplier:s,centerFloor:l},c))})}function vo({tier:t}){const s=t==="low",l=t==="medium";return e.jsxs("mesh",{rotation:[-Math.PI/2,0,0],position:[0,-.6,0],children:[e.jsx("planeGeometry",{args:[80,80]}),e.jsx("meshStandardMaterial",{color:"#010104",metalness:s?.4:l?.65:.9,roughness:s?.82:l?.45:.15,envMapIntensity:s?.015:l?.03:.05})]})}const mt=new ye(15e-5,15e-5),gt=new ye(15e-5,15e-5);function xo({tier:t}){const s=t==="high",l=t==="low",r=He(n=>n.gl),c=l&&r.capabilities.isWebGL2;return U(()=>{const o=Math.min(Math.abs(window.__kr8tiv_scrollVel??0),1500)/1500,i=s?4e-4:25e-5,d=s?2e-4:12e-5;gt.set(i+o*d,i+o*d),mt.lerp(gt,.12)}),l?c?e.jsxs(et,{multisampling:0,children:[e.jsx(tt,{luminanceThreshold:.68,luminanceSmoothing:.8,intensity:.42,mipmapBlur:!0,levels:3}),e.jsx(ot,{mode:st.ACES_FILMIC})]}):null:e.jsxs(et,{multisampling:0,children:[e.jsx(tt,{luminanceThreshold:s?.74:.8,luminanceSmoothing:s?.72:.8,intensity:s?.42:.28,mipmapBlur:!0,levels:s?5:4}),e.jsx(Ot,{blendFunction:Et.NORMAL,offset:mt,radialModulation:s,modulationOffset:s?.5:.2}),e.jsx(ot,{mode:st.ACES_FILMIC}),e.jsx(Ft,{darkness:s?.7:.55,offset:s?.2:.24})]})}const yo=`
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
`,Mo=`
precision highp float;
uniform vec3 uColor;
uniform float uOpacity;
uniform sampler2D uTexture;
varying float vAlpha;

void main() {
  vec4 tex = texture2D(uTexture, gl_PointCoord);
  gl_FragColor = vec4(uColor, tex.a * uOpacity * vAlpha);
}
`,wo=`
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
`,bo=`
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
`,jo=Ve({uTime:0,uBaseSize:.4,uColor:new Me("#667799"),uOpacity:.035,uTexture:null},yo,Mo),So=Ve({uTime:0,uBaseSize:.2,uColor:new Me("#d4a853"),uOpacity:.06,uTexture:null},wo,bo);wt({FogParticleMaterial:jo,GoldParticleMaterial:So});function Ye(t,s,l=2){const r=document.createElement("canvas");r.width=t,r.height=t;const c=r.getContext("2d"),n=t/2,o=c.createRadialGradient(n,n,0,n,n,n);o.addColorStop(0,s),o.addColorStop(.3/l,s),o.addColorStop(.6,"rgba(0,0,0,0.02)"),o.addColorStop(1,"rgba(0,0,0,0)"),c.fillStyle=o,c.fillRect(0,0,t,t);const i=new Be(r);return i.needsUpdate=!0,i}const Ge=400;function Po(){const t=a.useRef(null),s=a.useMemo(()=>Ye(128,"rgba(100,120,160,0.15)",1.5),[]),l=a.useMemo(()=>{const r=new Float32Array(Ge*3),c=new Float32Array(Ge*3);for(let o=0;o<Ge;o++){const i=Math.random()*Math.PI*2,d=.8+Math.random()*6;r[o*3]=Math.cos(i)*d,r[o*3+1]=(Math.random()-.5)*5,r[o*3+2]=Math.sin(i)*d,c[o*3]=Math.random()*100,c[o*3+1]=.3+Math.random()*.7,c[o*3+2]=Math.random()*Math.PI*2}const n=new Ee;return n.setAttribute("position",new oe(r,3)),n.setAttribute("aSeed",new oe(c,3)),n},[]);return U(r=>{t.current&&(t.current.uTime=r.clock.elapsedTime)}),e.jsx("points",{geometry:l,children:e.jsx("fogParticleMaterial",{ref:t,uTexture:s,transparent:!0,blending:D,depthWrite:!1})})}const ke=80;function To(){const t=a.useRef(null),s=a.useMemo(()=>Ye(64,"rgba(255,255,255,0.15)",2),[]),l=a.useMemo(()=>{const r=new Float32Array(ke*3),c=new Float32Array(ke*3);for(let o=0;o<ke;o++){const i=Math.random()*Math.PI*2,d=.5+Math.random()*2.5;r[o*3]=Math.cos(i)*d,r[o*3+1]=(Math.random()-.5)*2,r[o*3+2]=Math.sin(i)*d,c[o*3]=Math.random()*100,c[o*3+1]=.5+Math.random()*1,c[o*3+2]=Math.random()*Math.PI*2}const n=new Ee;return n.setAttribute("position",new oe(r,3)),n.setAttribute("aSeed",new oe(c,3)),n},[]);return U(r=>{t.current&&(t.current.uTime=r.clock.elapsedTime)}),e.jsx("points",{geometry:l,children:e.jsx("fogParticleMaterial",{ref:t,uTexture:s,uColor:new Me("#ffffff"),uBaseSize:.15,uOpacity:.03,transparent:!0,blending:D,depthWrite:!1})})}const Ce=200;function Ro(){const t=a.useRef(null),s=a.useMemo(()=>Ye(64,"rgba(212,168,83,0.25)",2),[]),l=a.useMemo(()=>{const r=new Float32Array(Ce*3),c=new Float32Array(Ce*3);for(let o=0;o<Ce;o++){const i=o/Ce*Math.PI*2;r[o*3]=Math.cos(i)*2,r[o*3+1]=.3,r[o*3+2]=Math.sin(i)*2,c[o*3]=Math.random()*100,c[o*3+1]=.3+Math.random()*.7,c[o*3+2]=i}const n=new Ee;return n.setAttribute("position",new oe(r,3)),n.setAttribute("aSeed",new oe(c,3)),n},[]);return U(r=>{t.current&&(t.current.uTime=r.clock.elapsedTime)}),e.jsx("points",{geometry:l,children:e.jsx("goldParticleMaterial",{ref:t,uTexture:s,transparent:!0,blending:D,depthWrite:!1})})}function Io(){return e.jsxs("group",{children:[e.jsx(Po,{}),e.jsx(To,{}),e.jsx(Ro,{})]})}const vt=`
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,xt=`
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
`,yt=2.05,Ao=.05,Co=.4,We=3.3,Mt=We/2.67,_e=.2555,St=1.55,_o=St/2.67,Oo=.78;function Eo({compact:t=!1}){const s=a.useRef(null),l=a.useRef(null),r=a.useRef(0),c=zt(jt("/images/kr8tiv-logo.png"));a.useMemo(()=>{c.minFilter=rt,c.magFilter=rt,c.generateMipmaps=!1},[c]);const n=a.useMemo(()=>({uniforms:{uTime:{value:0},uLogoTexture:{value:c},uIntensity:{value:t?.95:1.35}},vertexShader:vt,fragmentShader:xt,transparent:!0,depthWrite:!1,side:le,blending:D,toneMapped:!1}),[c,t]),o=a.useMemo(()=>({uniforms:{uTime:{value:0},uLogoTexture:{value:c},uIntensity:{value:.85}},vertexShader:vt,fragmentShader:xt,transparent:!0,depthWrite:!1,side:le,blending:D,toneMapped:!1}),[c]),i=a.useRef(null);U(x=>{const p=x.clock.elapsedTime;if(s.current){s.current.position.y=(t?1:yt)+Math.sin(p*Co)*Ao;const y=x.camera.position;let u=Math.atan2(y.x,y.z)-r.current;for(;u>Math.PI;)u-=Math.PI*2;for(;u<-Math.PI;)u+=Math.PI*2;r.current+=u*.06,s.current.rotation.y=r.current+Math.sin(p*.15)*.015}l.current&&(l.current.uniforms.uTime.value=p),i.current&&(i.current.uniforms.uTime.value=p)});const d=t?We*.62:We,f=t?Mt*.62:Mt,v=t?1:yt;return e.jsxs(e.Fragment,{children:[e.jsxs("group",{ref:s,position:[0,v,0],children:[e.jsxs("mesh",{children:[e.jsx("planeGeometry",{args:[d,f]}),e.jsx("shaderMaterial",{ref:l,args:[n]})]}),e.jsx("pointLight",{position:[0,-.5,.2],color:"#ffffff",intensity:.22,distance:3.4,decay:2})]}),e.jsxs("mesh",{position:[0,(v+_e)/2,0],renderOrder:2,children:[e.jsx("cylinderGeometry",{args:[d*.13,.075,v-_e,20,1,!0]}),e.jsx("meshBasicMaterial",{color:"#cfd8ff",transparent:!0,opacity:.018,depthWrite:!1,side:le,blending:D,toneMapped:!1})]}),e.jsxs("mesh",{position:[0,_e+.002,0],rotation:[-Math.PI/2,0,0],renderOrder:2,children:[e.jsx("circleGeometry",{args:[d*.2,24]}),e.jsx("meshBasicMaterial",{color:"#dfe6ff",transparent:!0,opacity:.05,depthWrite:!1,blending:D,toneMapped:!1})]}),e.jsxs("mesh",{position:[0,_e,Oo],rotation:[-Math.PI/2,0,Math.PI],renderOrder:2,children:[e.jsx("planeGeometry",{args:[St,_o]}),e.jsx("shaderMaterial",{ref:i,args:[o]})]})]})}function Fo(){const t=a.useRef(null),s=a.useRef(new C(0,2,5));return U(l=>{const{pointer:r,viewport:c}=l;s.current.set(r.x*c.width/2,r.y*c.height/2+1,4),t.current&&t.current.position.lerp(s.current,.06)}),e.jsx("pointLight",{ref:t,intensity:.08,color:"#ffffff",distance:6,decay:2})}const xe=12;function zo(){const t=document.createElement("canvas");t.width=64,t.height=64;const s=t.getContext("2d"),l=32,r=s.createRadialGradient(l,l,0,l,l,l);r.addColorStop(0,"rgba(255,255,255,0.5)"),r.addColorStop(.2,"rgba(255,255,255,0.2)"),r.addColorStop(.5,"rgba(212,168,83,0.06)"),r.addColorStop(1,"rgba(0,0,0,0)"),s.fillStyle=r,s.fillRect(0,0,64,64);const c=new Be(t);return c.needsUpdate=!0,c}function Lo(){const t=a.useRef(null),s=a.useRef(new C(0,1,4)),l=a.useRef(new C),r=a.useMemo(()=>zo(),[]),{geometry:c,seeds:n}=a.useMemo(()=>{const o=new Float32Array(xe*3),i=new Float32Array(xe*4);for(let f=0;f<xe;f++){const v=f/xe*Math.PI*2,x=.5+Math.random()*.8;o[f*3]=Math.cos(v)*x,o[f*3+1]=.3+Math.random()*.4,o[f*3+2]=Math.sin(v)*x,i[f*4]=Math.random()*Math.PI*2,i[f*4+1]=.15+Math.random()*.25,i[f*4+2]=v,i[f*4+3]=Math.random()}const d=new Ee;return d.setAttribute("position",new oe(o,3)),{geometry:d,seeds:i}},[]);return U(o=>{if(!t.current)return;const{pointer:i,viewport:d}=o,f=o.clock.elapsedTime;l.current.set(i.x*d.width/2,i.y*d.height/2+1,3.5),s.current.lerp(l.current,.04);const v=t.current.geometry.attributes.position;for(let x=0;x<xe;x++){const p=n[x*4],y=n[x*4+1],h=n[x*4+2],u=(Math.sin(f*y+p)+1)/2,g=.6+Math.sin(f*.3+p)*.2,w=Math.cos(h+f*.05)*g,S=.3+Math.sin(f*.4+p)*.15,A=Math.sin(h+f*.05)*g,z=s.current.x*.3,_=s.current.y*.3,G=s.current.z*.2,V=u*u*(3-2*u),K=Math.sin(V*Math.PI)*.2;v.setXYZ(x,w+(z-w)*V,S+(_-S)*V+K,A+(G-A)*V)}v.needsUpdate=!0}),e.jsx("points",{ref:t,geometry:c,children:e.jsx("pointsMaterial",{map:r,color:"#ffffff",size:.18,transparent:!0,opacity:.1,blending:D,depthWrite:!1,sizeAttenuation:!0})})}function Ho({tier:t}){const s=t==="high"?{stream:{layerCount:10,opacityMultiplier:1.5,centerFloor:.3}}:t==="medium"?{stream:{layerCount:8,opacityMultiplier:1.5,centerFloor:.28}}:{stream:{layerCount:6,opacityMultiplier:1.8,centerFloor:.3}};return e.jsxs(e.Fragment,{children:[e.jsx(Lt,{files:jt("/hdr/studio_small_03_1k.hdr"),environmentIntensity:t==="high"?.5:t==="medium"?.45:.62}),e.jsx("fog",{attach:"fog",args:["#070a16",6,30]}),e.jsx("ambientLight",{intensity:.06}),e.jsx("spotLight",{position:[4.5,7.5,4],angle:.78,penumbra:1,intensity:t==="low"?38:32,distance:26,decay:2,color:"#ffe2bd",castShadow:t==="high","shadow-mapSize":[1024,1024],"shadow-bias":-6e-4}),e.jsx("spotLight",{position:[-5,2.6,-6],angle:1.05,penumbra:1,intensity:t==="low"?28:26,distance:24,decay:2,color:"#9db8ff"}),e.jsx("pointLight",{position:[1.4,1.1,1.9],intensity:2.6,color:"#d4a853",distance:7,decay:2}),e.jsx("pointLight",{position:[-4,1.4,3],intensity:1.1,color:"#7f8cc0",distance:13,decay:2}),e.jsx(Zt,{}),e.jsx(to,{tier:t}),e.jsx(Eo,{compact:t==="low"}),e.jsx(ao,{tier:t}),e.jsx(go,{...s.stream}),e.jsx(Io,{}),e.jsx(Gt,{count:60,speed:.2,opacity:.15,color:"#d4a853",size:.6,scale:[3.5,1.5,3.5],position:[0,.5,0],noise:[.5,.3,.5]}),t!=="low"&&e.jsx(kt,{position:[0,-.255,0],scale:12,resolution:t==="high"?512:256,blur:2.6,opacity:.55,far:4,frames:t==="high"?1/0:1,color:"#000008"}),e.jsx(Fo,{}),e.jsx(Lo,{}),e.jsx(vo,{tier:t}),e.jsx(xo,{tier:t})]})}export{Ho as default};
