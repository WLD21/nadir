import { copy } from './translations.js';
import './booking.js';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const $ = s => document.querySelector(s);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const assembly = $('#expertise');
const stageKeys = ['masonry', 'plumbing', 'electrical', 'insulation', 'tiles', 'finishing'];
const stageAt = [0.03, .21, .36, .51, .67, .88];
let language = 'fr', activeStage = 'masonry', inspection = false;
let assemblyView, heroView, scrollProgress = 0;
let manualProgress = null;
window.NTBooking.init($('#booking-widget'));

const compactTitles = {
  fr: {heroTitle:'L’intérieur.\nRéinventé.', heroLabel:'Rénovation intérieure', heroBody:'Tout ce qui fait un bel intérieur. Même ce qui ne se voit pas.',assemblyTitle:'Chaque métier.\nUne même vision.',assemblyBody:'Votre intérieur, de l’essentiel au visible.'},
  nl: {heroTitle:'Uw interieur.\nVernieuwd.',heroLabel:'Interieurrenovatie',heroBody:'Alles wat een interieur bijzonder maakt. Ook wat u niet ziet.',assemblyTitle:'Elk vak.\nEén geheel.',assemblyBody:'Uw interieur, van de basis tot de afwerking.'},
  en: {heroTitle:'Your interior.\nReimagined.',heroLabel:'Interior renovation',heroBody:'Everything that makes a beautiful interior. Even the things you never see.',assemblyTitle:'Every trade.\nOne vision.',assemblyBody:'Your interior, from the essentials to the finish.'}
};
function updateStageCopy() {
  const c = copy[language], s = c.services[activeStage];
  $('#stage-title').textContent = s.title;
  $('#stage-description').textContent = s.description;
  const chosen = window.NTBooking.getSelected().includes(activeStage);
  $('#stage-add').setAttribute('aria-pressed', String(chosen));
  $('#stage-add').firstElementChild.textContent = chosen ? '✓' : '＋';
  $('#stage-add').lastElementChild.textContent = chosen ? c.selectedService : c.selectService;
  document.querySelectorAll('[data-stage]').forEach(b => {
    b.textContent = c.services[b.dataset.stage].name;
    b.classList.toggle('active', b.dataset.stage === activeStage);
    b.setAttribute('aria-pressed', String(b.dataset.stage === activeStage));
  });
  $('#inspect-toggle span').textContent = inspection ? c.inspectOff : c.inspectOn;
}
function setLanguage(lang) {
  if (!copy[lang]) return;
  language = lang;
  document.documentElement.lang = lang;
  const values = {...copy[lang], ...compactTitles[lang]};
  document.querySelectorAll('[data-i18n]').forEach(el => { if (values[el.dataset.i18n]) el.textContent = values[el.dataset.i18n]; });
  document.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  window.NTBooking.setLanguage(lang);
  window.NTIntro?.setLanguage(lang);
  updateStageCopy();
  document.title = lang === 'fr' ? 'Nouveaux Toits · L’intérieur réinventé' : lang === 'nl' ? 'Nouveaux Toits · Uw interieur, opnieuw ontdekt' : 'Nouveaux Toits · Your interior, reimagined';
  const labels={fr:['Aller au contenu','Navigation principale','Maquette architecturale d’un intérieur rénové','Assemblage de l’intérieur','Échantillons de carrelage','Échantillons de matériaux','Robinet et raccords'],nl:['Ga naar de inhoud','Hoofdnavigatie','Architectuurmodel van een gerenoveerd interieur','Opbouw van het interieur','Tegelstalen','Materiaalstalen','Kraan en aansluitingen'],en:['Skip to content','Main navigation','Architectural model of a renovated interior','Interior assembly','Porcelain tile samples','Material samples','Tap and fittings']}[lang];
  $('.skip-link').textContent=labels[0]; $('.site-header nav').setAttribute('aria-label',labels[1]);
  $('#hero-scene').setAttribute('aria-label',labels[2]);$('#assembly-scene').setAttribute('aria-label',labels[3]);
  document.querySelectorAll('.material-image img').forEach((im,i)=>im.alt=labels[4+i]);
  $('.trade-nav').setAttribute('aria-label',copy[lang].stepLabel);
  try {localStorage.setItem('nt-language', lang);} catch {}
  window.ScrollTrigger?.refresh();
}
document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => setLanguage(b.dataset.lang)));
document.addEventListener('nt:services', updateStageCopy);
$('#stage-add').addEventListener('click', () => window.NTBooking.toggleService(activeStage));
$('#inspect-toggle').addEventListener('click', () => {
  inspection = !inspection;
  $('#inspect-toggle').setAttribute('aria-pressed', String(inspection));
  updateStageCopy();
  if (assemblyView) {
    gsap.to(assemblyView.state,{inspect:inspection?1:0,duration:reduced?0:.75,ease:'power2.inOut',onUpdate:()=>assemblyView.paint()});
  }
});
document.querySelectorAll('[data-stage]').forEach(b => b.addEventListener('click', () => {
  const index=stageKeys.indexOf(b.dataset.stage),p=stageAt[index];
  if (reduced) {manualProgress=p; applyProgress(p);} else {
    const top=assembly.getBoundingClientRect().top+window.scrollY;
    window.scrollTo({top:top+p*(assembly.offsetHeight-innerHeight),behavior:'smooth'});
  }
}));
try {setLanguage(localStorage.getItem('nt-language')||'fr');} catch {setLanguage('fr');}

// Settle a new document's fragment before WebGL setup refreshes ScrollTrigger.
// Otherwise that refresh can interrupt the browser's initial smooth anchor scroll.
// Do this before asynchronous model loading; subsequent user input and history win.
if(location.hash&&performance.getEntriesByType('navigation')[0]?.type==='navigate'){
  try{
    const hash=location.hash,target=document.getElementById(decodeURIComponent(hash.slice(1)));
    if(target){
      const pending=new AbortController(),cancel=()=>pending.abort();
      ['pointerdown','wheel','touchstart','keydown','click','hashchange','popstate','pagehide'].forEach(type=>
        window.addEventListener(type,cancel,{capture:true,passive:true,signal:pending.signal}));
      target.scrollIntoView({behavior:'instant',block:'start'});
      // Font metrics can move the target. Correct only while the visitor has not interacted.
      document.fonts.ready.then(()=>{
        if(!pending.signal.aborted&&location.hash===hash)target.scrollIntoView({behavior:'instant',block:'start'});
        pending.abort();
      });
    }
  }catch{}
}

const windows = {
  structure: [-.1,0], masonry:[0,.19],plumbing:[.15,.33],electrical:[.29,.47],
  insulation:[.44,.61],tiles:[.57,.77],finish:[.74,.89],furnishings:[.83,.97]
};
function stageFor(object) {
  let p=object;
  while(p){if(windows[p.userData?.stage])return p.userData.stage;if(windows[p.name])return p.name;p=p.parent;}
  return 'structure';
}
const clamp=THREE.MathUtils.clamp;
function ease(t){return 1-Math.pow(1-t,3);}

function createView(container, source, isHero=false) {
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
  renderer.setClearColor(0x000000,0);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=isHero?1.1:1.05;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden','true');
  const scene=new THREE.Scene();
  const pmrem=new THREE.PMREMGenerator(renderer);
  const room=new RoomEnvironment();
  scene.environment=pmrem.fromScene(room,.05).texture;
  scene.environmentIntensity=.5;
  room.dispose();pmrem.dispose();
  const camera=new THREE.PerspectiveCamera(34,1,.1,100);
  const target=new THREE.Vector3(0,1.45,0);
  camera.position.set(10.8,9.8,12.4);camera.lookAt(target);
  const hemi=new THREE.HemisphereLight(0xf9faf4,isHero?0xb8c1ad:0x7f959d,1.5);scene.add(hemi);
  const key=new THREE.DirectionalLight(0xffedda,2.6);key.position.set(-3,12,7);key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:.1,far:35});key.shadow.normalBias=.025;key.shadow.bias=-.0002;key.shadow.radius=5;scene.add(key);
  const fill=new THREE.DirectionalLight(0xd3f0fc,1.1);fill.position.set(6,7,-4);scene.add(fill);
  const model=source.clone(true);scene.add(model);
  const meshes=[];
  model.traverse(o=>{
    if(!o.isMesh)return;
    o.castShadow=true;o.receiveShadow=true;
    const mats=Array.isArray(o.material)?o.material.map(m=>m.clone()):[o.material.clone()];
    mats.forEach(m=>{m.envMapIntensity=.5;if(m.metalness>.6)m.metalness=.45;});
    o.material=Array.isArray(o.material)?mats:mats[0];
    meshes.push({object:o,stage:stageFor(o),base:o.position.clone(),rotation:o.rotation.clone(),scale:o.scale.clone(),seq:Number(o.userData.sequence)||0,mats,opacity:mats.map(m=>m.opacity)});
  });
  const maxSeq={};meshes.forEach(m=>maxSeq[m.stage]=Math.max(maxSeq[m.stage]||1,m.seq));
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.ShadowMaterial({color:0x17282a,opacity:isHero?.065:.12}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-.2;shadow.receiveShadow=true;scene.add(shadow);
  const introStarting=isHero&&window.NTIntro?.active&&!reduced;
  const state={progress:isHero?1:0,inspect:0,pointerX:0,pointerY:0,heroScroll:0,intro:introStarting?1:0,introExplode:introStarting?1:0,introYaw:introStarting?-1:0,introZoom:introStarting?1:0};
  let inView=true;
  function paint(force=false){
    if(!inView&&!force)return;
    const p=state.progress;
    meshes.forEach(m=>{
      const o=m.object,[start,end]=windows[m.stage];
      const delay=m.seq/(maxSeq[m.stage]||1)*.07;
      let u=isHero?1:clamp((p-start-delay)/Math.max(.04,end-start-.07),0,1);
      if(m.stage==='structure')u=1;
      const k=ease(u),hidden=['finish','furnishings','insulation'].includes(m.stage)?state.inspect:0;
      o.visible=u>.002 && hidden<.985;
      o.position.copy(m.base);o.rotation.copy(m.rotation);o.scale.copy(m.scale);
      if(!isHero){
        if(m.stage==='masonry')o.position.y+=(1-k)*(1.25+(m.seq%5)*.13);
        if(m.stage==='plumbing'){o.position.x+=(1-k)*1.25;o.position.y+=(1-k)*.25;}
        if(m.stage==='electrical'){o.position.z+=(1-k)*1.1;o.position.y+=(1-k)*.45;}
        if(m.stage==='insulation')o.position.x-=(1-k)*2.0+hidden*1.2;
        if(m.stage==='tiles'){o.position.y+=(1-k)*(1.5+(m.seq%4)*.15);o.rotation.z+=(1-k)*.18;}
        if(m.stage==='finish'){o.position.y+=(1-k)*1.4+hidden*1.6;}
        if(m.stage==='furnishings'){o.position.y+=(1-k)*1.7+hidden*1.6;}
      }
      if(isHero&&state.intro){
        const offsets={structure:[0,0,0,0],masonry:[-.65,1.1,-.3,1],plumbing:[.4,1.8,.7,2],electrical:[-.4,2.1,-.5,3],insulation:[-.9,2.6,-.1,4],tiles:[0,.9,0,5],finish:[.6,3.4,0,6],furnishings:[.15,4.1,0,7]};
        const [x,y,z,order]=offsets[m.stage];
        const lift=clamp(state.introExplode*1.45-(1-order/7)*.45,0,1);
        o.position.x+=x*lift;o.position.y+=y*lift;o.position.z+=z*lift;
      }
      m.mats.forEach((mat,i)=>{const opacity=m.opacity[i]*clamp(u*4,0,1)*(1-hidden);mat.transparent=opacity<.99;mat.opacity=opacity;mat.depthWrite=opacity>.5;});
    });
    const mobile=container.clientWidth<650;
    const angle=(isHero?state.heroScroll*.055+state.introYaw*.45:(p-.5)*.12)+state.pointerX*.035;
    model.rotation.y=angle;
    const introFit=isHero&&state.intro?Math.max(1,1.05/(container.clientWidth/container.clientHeight)):1;
    const distance=((isHero?(mobile?1.06:1.01):(mobile?1.26:1.02))+(isHero?state.introZoom*.5:0))*introFit;
    target.y=1.45+(isHero?state.introExplode*.95:0);
    camera.position.set((10.8+state.pointerX*.6)*distance,(9.8+state.pointerY*.3)*distance,12.4*distance);camera.lookAt(target);
    renderer.render(scene,camera);
    container.classList.add('ready');
    if(isHero&&state.intro)container.dataset.introFrame=JSON.stringify({rotation:Math.round(model.rotation.y*100),height:Math.round(target.y*100),meshes:meshes.filter((_,i)=>i%25===0).map(m=>Math.round(m.object.position.y*100))});
    if(!isHero){
      const sample=meshes.filter(m=>m.object.visible);
      container.dataset.scVerifyState=JSON.stringify({visible:sample.length,positions:sample.filter((_,i)=>i%11===0).map(m=>[Math.round(m.object.position.x*50),Math.round(m.object.position.y*50),Math.round(m.object.position.z*50)]),rotation:Math.round(model.rotation.y*1000),inspect:Math.round(state.inspect*100)});
      container.dataset.scVerifyHold=String(p>=.98);
    }
  }
  function resize(){const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();paint(true);}
  const observer=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(inView)paint(true);},{rootMargin:'150px'});observer.observe(container);
  new ResizeObserver(resize).observe(container);resize();
  if(finePointer&&!reduced){container.addEventListener('pointermove',e=>{if(window.NTIntro?.active)return;const r=container.getBoundingClientRect();gsap.to(state,{pointerX:(e.clientX-r.left)/r.width-.5,pointerY:(e.clientY-r.top)/r.height-.5,duration:.65,overwrite:'auto',onUpdate:paint});});container.addEventListener('pointerleave',()=>{if(!window.NTIntro?.active)gsap.to(state,{pointerX:0,pointerY:0,duration:.8,overwrite:'auto',onUpdate:paint});});}
  renderer.domElement.addEventListener('webglcontextlost',()=>{container.classList.remove('ready');if(isHero)window.NTIntro?.abort();});
  return {state,paint,resize,renderer,scene,camera,model};
}

function applyProgress(p){
  scrollProgress=p;
  let index=0;for(let i=0;i<stageAt.length;i++)if(p>=stageAt[i]-.025)index=i;
  const next=stageKeys[index];if(next!==activeStage){activeStage=next;updateStageCopy();}
  $('.assembly-meter span').style.transform=`scaleX(${p})`;
  if(assemblyView){assemblyView.state.progress=p;assemblyView.paint();}
}

try {
  const gltf=await new GLTFLoader().loadAsync('assets/renovation-house.glb');
  heroView=createView($('#hero-scene'),gltf.scene,true);
  assemblyView=createView($('#assembly-scene'),gltf.scene,false);
  window.NT_SCENE={hero:heroView,assembly:assemblyView};
  window.NTIntro?.attach(heroView);
  if(reduced){applyProgress(1);}else{
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.create({trigger:assembly,start:'top top',end:'bottom bottom',onUpdate:self=>applyProgress(self.progress),invalidateOnRefresh:true});
    ScrollTrigger.create({trigger:$('#home'),start:'top top',end:'bottom top',onUpdate:self=>{if(window.NTIntro?.active)return;heroView.state.heroScroll=self.progress;heroView.paint();}});
    ScrollTrigger.refresh();
    applyProgress(clamp(-assembly.getBoundingClientRect().top/(assembly.offsetHeight-innerHeight),0,1));
  }
  document.documentElement.dataset.modelReady='true';
} catch(error) {
  window.NTIntro?.abort();
  document.documentElement.dataset.modelReady='fallback';
  console.info('Architectural poster fallback active:',error.message);
  if(!reduced){gsap.registerPlugin(ScrollTrigger);ScrollTrigger.create({trigger:assembly,start:'top top',end:'bottom bottom',onUpdate:self=>applyProgress(self.progress)});}
  document.querySelectorAll('.scene-container canvas').forEach(c=>c.remove());
  document.querySelectorAll('.scene-container').forEach(c=>c.classList.remove('ready'));
  $('#inspect-toggle').hidden=true;
}
