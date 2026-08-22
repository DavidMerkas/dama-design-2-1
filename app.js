
const hdr=document.getElementById('hdr'),util=document.getElementById('util');
addEventListener('scroll',()=>{
  const s=scrollY>60;
  hdr.classList.toggle('fixed',s);
  util.style.display=s?'none':'flex';
},{passive:true});

const mmenu=document.getElementById('mmenu');
document.getElementById('burger').onclick=()=>mmenu.classList.add('open');
document.getElementById('mclose').onclick=()=>mmenu.classList.remove('open');
mmenu.querySelectorAll('a').forEach(a=>a.onclick=()=>mmenu.classList.remove('open'));

const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
document.querySelectorAll('.rev').forEach(el=>io.observe(el));

/* ============ HERO SLIDER ============ */
(function(){
  const slides=[...document.querySelectorAll('.hero-slider .hero-img')];
  if(slides.length<2)return;
  let i=slides.findIndex(s=>s.classList.contains('active'));
  if(i<0)i=0;
  setInterval(()=>{
    slides[i].classList.remove('active');
    i=(i+1)%slides.length;
    slides[i].classList.add('active');
  },6000);
})();

/* ============ STAT COUNTERS ============ */
(function(){
  const nums=[...document.querySelectorAll('.stat .n[data-count]')];
  if(!nums.length)return;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const DUR=1400;
  const easeOutExpo=t=>t>=1?1:1-Math.pow(2,-10*t);
  const run=el=>{
    const to=Number(el.dataset.count),suf=el.dataset.suffix||'';
    if(reduce.matches){el.textContent=to+suf;return}
    const t0=performance.now();
    const step=now=>{
      const p=Math.min((now-t0)/DUR,1);
      el.textContent=Math.round(to*easeOutExpo(p))+suf;
      if(p<1)requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const cio=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){run(e.target);cio.unobserve(e.target)}})},{threshold:.4});
  nums.forEach(el=>cio.observe(el));
})();

const fbar=document.querySelector('.filters');
const fgrid=document.querySelector('.grid3, .pgrid');
if(fbar&&fgrid){
  const items=[...document.querySelectorAll('.proj-item')];
  fbar.querySelectorAll('button').forEach(b=>b.onclick=()=>{
    if(b.classList.contains('on'))return;
    fbar.querySelectorAll('button').forEach(x=>x.classList.remove('on'));
    b.classList.add('on');
    const f=b.dataset.f;
    fgrid.classList.add('fading');
    setTimeout(()=>{
      items.forEach(it=>{it.style.display=(f==='all'||it.dataset.cat===f)?'':'none'});
      fgrid.classList.remove('fading');
    }, 260);
  });
}

const gEls=[...document.querySelectorAll('.gallery .g img')];
if(gEls.length){
  const lb=document.createElement('div');lb.className='lb';
  lb.innerHTML='<span class="x">&times;</span><span class="nav prev">&#8249;</span><img alt=""><span class="nav next">&#8250;</span><span class="count"></span>';
  document.body.appendChild(lb);
  const lbImg=lb.querySelector('img'),cnt=lb.querySelector('.count');let idx=0;
  const show=i=>{idx=(i+gEls.length)%gEls.length;lbImg.src=gEls[idx].src;cnt.textContent=(idx+1)+' / '+gEls.length};
  gEls.forEach((im,i)=>im.parentElement.addEventListener('click',()=>{show(i);lb.classList.add('open')}));
  lb.querySelector('.x').onclick=()=>lb.classList.remove('open');
  lb.querySelector('.prev').onclick=e=>{e.stopPropagation();show(idx-1)};
  lb.querySelector('.next').onclick=e=>{e.stopPropagation();show(idx+1)};
  lb.onclick=e=>{if(e.target===lb)lb.classList.remove('open')};
  addEventListener('keydown',e=>{if(!lb.classList.contains('open'))return;if(e.key==='Escape')lb.classList.remove('open');if(e.key==='ArrowLeft')show(idx-1);if(e.key==='ArrowRight')show(idx+1)});
}

/* ============ SIGNATURE SHOWCASE (kinetic filmstrip) ============ */
(function(){
  const track=document.querySelector('.show-track');
  if(!track)return;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let hover=false,offscreen=true;
  const sync=()=>{track.style.animationPlayState=(hover||offscreen||reduce.matches)?'paused':'running'};
  track.addEventListener('mouseenter',()=>{hover=true;sync()});
  track.addEventListener('mouseleave',()=>{hover=false;sync()});
  if('IntersectionObserver' in window){
    new IntersectionObserver(([e])=>{offscreen=!e.isIntersecting;sync()},{threshold:.1}).observe(track);
  }else{
    offscreen=false;
  }
  sync();
})();

/* ============ PARALLAX (filmstrip + projektne naslovne slike, 3D dojam pri scrollu) ============ */
(function(){
  const cards=[...document.querySelectorAll('.show-card, .tile .ph')];
  if(!cards.length)return;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  if(reduce.matches)return;
  /* omotaj svaku sliku u .ph-in koji je viši od okvira, tako da translateY otkriva rezervu bez praznine */
  const phs=cards.map(card=>{
    const img=card.querySelector('img');
    const ph=document.createElement('span');
    ph.className='ph-in';
    img.parentNode.insertBefore(ph,img);
    ph.appendChild(img);
    return ph;
  });
  const RANGE=46; /* px maksimalnog pomaka gore/dolje */
  function update(){
    const h=innerHeight;
    cards.forEach((card,i)=>{
      const r=card.getBoundingClientRect();
      if(r.bottom<0||r.top>h)return;
      const p=(r.top+r.height/2-h/2)/h; /* ~ -0.5..0.5 dok kartica prolazi kroz viewport */
      phs[i].style.transform=`translateY(${(-p*RANGE*2).toFixed(1)}px)`;
    });
  }
  /* izravan poziv na scroll (bez rAF-gatinga) - par getBoundingClientRect poziva na 8 kartica je zanemarivo, a ne ovisi o tome je li rAF throttlean u pozadinskom tabu */
  addEventListener('scroll',update,{passive:true});
  addEventListener('resize',update);
  update();
})();

/* ============ FLOATING BADGE DETAIL (tap-to-toggle na touch uređajima, hover/focus rade preko CSS-a) ============ */
(function(){
  const badges=[...document.querySelectorAll('.fbadge[data-detail]')];
  if(!badges.length)return;
  badges.forEach(b=>{
    b.setAttribute('tabindex','0');
    b.addEventListener('click',()=>{
      if(matchMedia('(hover: hover)').matches)return;
      const wasOpen=b.classList.contains('show-detail');
      badges.forEach(o=>o.classList.remove('show-detail'));
      if(!wasOpen)b.classList.add('show-detail');
    });
  });
  document.addEventListener('click',e=>{
    if(!e.target.closest('.fbadge'))badges.forEach(b=>b.classList.remove('show-detail'));
  });
})();

/* ============ CTA BACKGROUND ROTATOR (Osmislimo vaš prostor - crossfade kroz nekoliko enterijera) ============ */
(function(){
  const pool=[
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?auto=format&fit=crop&w=1920&q=80'
  ];
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  document.querySelectorAll('section.cta').forEach(sec=>{
    const base=sec.querySelector('img');
    if(!base)return;
    const alt=base.cloneNode();
    alt.removeAttribute('alt');
    alt.style.opacity='0';
    alt.style.transition='opacity 1.8s ease';
    base.style.transition='opacity 1.8s ease';
    sec.insertBefore(alt,base.nextSibling);
    let i=Math.max(0,pool.indexOf(base.getAttribute('src')));
    let front=base,back=alt;
    setInterval(()=>{
      i=(i+1)%pool.length;
      back.src=pool[i];
      back.style.opacity='1';
      front.style.opacity='0';
      [front,back]=[back,front];
    },6000);
  });
})();

/* ============ GRID SPOTLIGHT HOVER (grid3/grid2 dim-ostalih efekt, JS umjesto CSS :hover da gapovi između kartica ne okidaju dim na sve) ============ */
(function(){
  document.querySelectorAll('.grid3, .grid2').forEach(grid=>{
    grid.querySelectorAll(':scope > .tile').forEach(tile=>{
      tile.addEventListener('mouseenter',()=>{grid.classList.add('hovering');tile.classList.add('hovered')});
      tile.addEventListener('mouseleave',()=>{grid.classList.remove('hovering');tile.classList.remove('hovered')});
    });
  });
})();
