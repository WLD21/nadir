/* Independent, fail-open lifecycle. The homepage remains usable if WebGL fails. */
(() => {
  const dialog=document.querySelector('#site-intro');
  const visual=document.querySelector('#intro-visual');
  const hero=document.querySelector('#hero-scene');
  const skip=document.querySelector('#intro-skip');
  const replay=document.querySelector('#intro-replay');
  const wordmark=document.querySelector('#intro-wordmark');
  const tagline=document.querySelector('#intro-tagline');
  const status=document.querySelector('#intro-status');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const sessionKey='nt-intro-v1';
  const anchor=document.createComment('Hero canvas home position');
  hero.before(anchor);
  const words={
    fr:{category:'Rénovation intérieure',skip:'Passer l’introduction',replay:'Revoir l’introduction',line:'Tout commence à l’intérieur.',loading:'Votre intérieur prend forme.'},
    nl:{category:'Interieurrenovatie',skip:'Intro overslaan',replay:'Intro opnieuw bekijken',line:'Het begint vanbinnen.',loading:'Uw interieur krijgt vorm.'},
    en:{category:'Interior renovation',skip:'Skip introduction',replay:'Replay introduction',line:'It starts from within.',loading:'Your interior takes shape.'}
  };
  let view=null,active=false,closing=false,timeline=null,exitTimeline=null,deadline=null,language='fr';
  const chrome=()=>[...dialog.querySelectorAll('.intro-topline,.intro-signature,#intro-status,.intro-blueprint')];
  function markSeen(){try{sessionStorage.setItem(sessionKey,'seen');}catch{}}
  function setLanguage(lang){
    if(!words[lang])return;
    language=lang;const w=words[lang];dialog.lang=lang;
    dialog.querySelector('.intro-category').textContent=w.category;
    skip.firstChild.textContent=w.skip+' ';replay.textContent=w.replay+' ↺';
    tagline.textContent=w.line;status.textContent=w.loading;
  }
  function resetScene(){
    if(!view)return;
    gsap.killTweensOf(view.state);
    Object.assign(view.state,{intro:0,introExplode:0,introYaw:0,introZoom:0,pointerX:0,pointerY:0,heroScroll:0,progress:1});
  }
  function cleanup(){
    clearTimeout(deadline);deadline=null;
    resetScene();anchor.after(hero);hero.classList.remove('intro-hero-scene');hero.style.removeProperty('visibility');
    dialog.querySelector('.intro-bridge')?.remove();
    if(dialog.open)dialog.close();
    document.documentElement.classList.remove('intro-active');
    active=false;closing=false;dialog.dataset.state='closed';
    view?.resize();window.ScrollTrigger?.refresh();
    if(window.scrollY<100){const title=document.querySelector('.hero h1');title.setAttribute('tabindex','-1');title.focus({preventScroll:true});}
  }
  function finish({instant=false}={}){
    if(!active)return;
    if(closing){if(instant){exitTimeline?.kill();cleanup();}return;}
    closing=true;clearTimeout(deadline);timeline?.kill();markSeen();dialog.dataset.state='leaving';
    if(instant||reduced.matches||!view||!window.gsap){cleanup();return;}
    let bridge;
    try{
      view.paint(true);
      bridge=new Image();bridge.src=view.renderer.domElement.toDataURL('image/png');
      bridge.className='intro-bridge';bridge.alt='';
      const from=hero.getBoundingClientRect();
      Object.assign(bridge.style,{left:from.left+'px',top:from.top+'px',width:from.width+'px',height:from.height+'px'});
      dialog.append(bridge);
      resetScene();anchor.after(hero);hero.classList.remove('intro-hero-scene');view.resize();
      const to=hero.getBoundingClientRect();hero.style.visibility='hidden';
      exitTimeline=gsap.timeline({onComplete:cleanup});
      exitTimeline.to(chrome(),{opacity:0,duration:.25},0)
        .to('.intro-backdrop',{opacity:0,duration:.65,ease:'power2.inOut'},0)
        .to(bridge,{x:to.left-from.left,y:to.top-from.top,scaleX:to.width/from.width,scaleY:to.height/from.height,duration:.8,ease:'power3.inOut'},0)
        .to(bridge,{opacity:0,duration:.18},.63)
        .call(()=>{hero.style.removeProperty('visibility');view.paint(true);},null,.63);
    }catch{bridge?.remove();cleanup();}
  }
  function play(){
    if(!active||closing||!view)return;
    clearTimeout(deadline);dialog.dataset.state='playing';status.textContent='';
    if(reduced.matches){resetScene();view.resize();deadline=setTimeout(()=>finish({instant:true}),1100);return;}
    Object.assign(view.state,{intro:1,introExplode:1,introYaw:-1,introZoom:1,pointerX:0,pointerY:0});view.resize();
    gsap.set(wordmark,{opacity:0,y:26,rotationX:-22});gsap.set(tagline,{opacity:0,y:9});
    timeline=gsap.timeline({onComplete:()=>finish()});
    timeline.to(view.state,{introExplode:0,introYaw:0,introZoom:0,duration:2.65,ease:'power2.inOut',onUpdate:()=>view.paint(true)},.1)
      .to(wordmark,{opacity:1,y:0,rotationX:0,duration:.8,ease:'power3.out'},1.4)
      .to(tagline,{opacity:1,y:0,duration:.6,ease:'power2.out'},1.85)
      .to({}, {duration:.45});
  }
  function show(){
    if(active||!dialog.showModal||!window.gsap)return;
    active=true;closing=false;dialog.dataset.state='loading';
    window.scrollTo({top:0,behavior:'instant'});
    gsap.set([...chrome(),dialog.querySelector('.intro-backdrop')],{clearProps:'opacity,transform'});
    gsap.set([wordmark,tagline],{clearProps:'opacity,transform'});
    status.textContent=words[language].loading;
    hero.classList.add('intro-hero-scene');visual.append(hero);
    document.documentElement.classList.add('intro-active');
    try{dialog.showModal();}catch{cleanup();return;}
    skip.focus({preventScroll:true});
    deadline=setTimeout(()=>finish({instant:true}),4500);
    if(view)play();
  }
  skip.addEventListener('click',()=>finish({instant:true}));
  replay.addEventListener('click',show);
  dialog.addEventListener('cancel',e=>{e.preventDefault();finish({instant:true});});
  dialog.addEventListener('wheel',()=>finish({instant:true}),{passive:true});
  dialog.addEventListener('touchmove',()=>finish({instant:true}),{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)finish({instant:true});});
  window.addEventListener('pagehide',()=>finish({instant:true}));
  reduced.addEventListener('change',()=>{if(reduced.matches)finish({instant:true});});
  window.NTIntro={
    get active(){return active;},get timeline(){return timeline;},
    attach(scene){view=scene;replay.hidden=false;if(active)play();},
    abort(){replay.hidden=true;finish({instant:true});},
    finish,setLanguage,replay:show
  };
  try{setLanguage(localStorage.getItem('nt-language')||'fr');}catch{}
  let seen=false;try{seen=sessionStorage.getItem(sessionKey)==='seen';}catch{}
  const returnVisit=performance.getEntriesByType('navigation')[0]?.type==='back_forward';
  if(!seen&&!reduced.matches&&!location.hash&&!returnVisit&&scrollY<50)show();
})();
