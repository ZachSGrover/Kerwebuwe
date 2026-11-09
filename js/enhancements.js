(function(){
  /* Hier eine Video-URL (mp4/webm) eintragen -> laeuft automatisch als Hintergrund im Hero. Leer = aktuelles Hero-Bild. */
  window.KERWE_HERO_VIDEO = window.KERWE_HERO_VIDEO || "";
  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded',fn); }
  var PDFW=false;
  async function renderPDF(url, box){
    if(!window.pdfjsLib) return false;
    if(!PDFW){ try{ pdfjsLib.GlobalWorkerOptions.workerSrc='vendor/pdfjs/pdf.worker.min.js'; }catch(e){} PDFW=true; }
    box.innerHTML='<div class="pdf-load">Original wird geladen …</div>';
    try{
      var pdf=await pdfjsLib.getDocument({url:url}).promise;
      box.innerHTML='';
      var w=box.clientWidth||540;
      for(var n=1;n<=pdf.numPages;n++){
        var page=await pdf.getPage(n);
        var base=page.getViewport({scale:1});
        var vp=page.getViewport({scale:(w/base.width)*2});
        var c=document.createElement('canvas'); c.width=vp.width; c.height=vp.height; c.className='pdf-page';
        await page.render({canvasContext:c.getContext('2d'),viewport:vp}).promise;
        box.appendChild(c);
      }
      return true;
    }catch(e){ return false; }
  }
  ready(function(){
    /* 1) Instagram-Icon in die Navi */
    try{
      var nav=document.querySelector('header .nav')||document.querySelector('header');
      if(nav && !nav.querySelector('.ig-nav')){
        var a=document.createElement('a');
        a.className='ig-nav'; a.href='https://instagram.com/deidesheimer_kerwebuwe';
        a.target='_blank'; a.rel='noopener'; a.title='@deidesheimer_kerwebuwe'; a.setAttribute('aria-label','Instagram');
        a.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5.2"/><circle cx="12" cy="12" r="4"/><circle cx="17.6" cy="6.4" r="1.3" fill="currentColor" stroke="none"/></svg>';
        var menu=nav.querySelector('.menu'); var burger=nav.querySelector('.burger');
        if(burger) nav.insertBefore(a,burger); else if(menu&&menu.parentNode) menu.parentNode.insertBefore(a,menu.nextSibling); else nav.appendChild(a);
      }
    }catch(e){}

    /* 2) Kerwereden: scrollbare Original-PDF-Vorschau + Download */
    try{
      var mbox=document.querySelector('.mbox');
      var rb=document.getElementById('rb');
      var view=document.getElementById('rpdfview');
      if(mbox && !view){ view=document.createElement('div'); view.id='rpdfview'; if(rb&&rb.parentNode){ rb.parentNode.insertBefore(view, rb);} else { mbox.appendChild(view);} }
      var _orig=window.rede;
      if(typeof _orig==='function'){
        window.rede=function(y){
          window.__cy=y; _orig.apply(this,arguments);
          var url=(typeof RPDF!=='undefined')?RPDF[String(y)]:null;
          if(url && view){
            if(rb) rb.style.display='none';
            view.style.display='block';
            renderPDF(url, view).then(function(ok){ if(!ok){ view.style.display='none'; if(rb) rb.style.display=''; } });
          } else {
            if(view){ view.style.display='none'; view.innerHTML=''; }
            if(rb) rb.style.display='';
          }
          var mb=document.querySelector('.mbox'); if(mb) mb.scrollTop=0;
        };
      }
    }catch(e){}

    /* 3) Chronik: Filter + Sortierung */
    try{
      var chron=document.querySelector('.chron');
      if(chron){
        var rows=[].slice.call(chron.querySelectorAll('.brow'));
        rows.forEach(function(r){ var m=(r.querySelector('.bnr')||{}).textContent||'0'; r.__nr=parseInt(m,10)||0; r.__akt=r.classList.contains('ba'); });
        var ctl=document.createElement('div'); ctl.className='chron-ctl';
        var nAkt=rows.filter(function(r){return r.__akt;}).length;
        ctl.innerHTML='<div class="cc-seg" role="group" aria-label="Buwe filtern">'
          +'<button data-f="all" class="on" aria-pressed="true">Alle <span class="cc-n">'+rows.length+'</span></button>'
          +'<button data-f="akt" aria-pressed="false"><i class="cc-dot akt"></i>Aktive <span class="cc-n">'+nAkt+'</span></button>'
          +'<button data-f="ehe" aria-pressed="false"><i class="cc-dot"></i>Ehemalige <span class="cc-n">'+(rows.length-nAkt)+'</span></button>'
          +'</div><button class="cc-sort" data-s="asc" aria-label="Sortierung umkehren">Älteste zuerst <span class="cc-arr">↑</span></button>';
        chron.parentNode.insertBefore(ctl, chron);
        var filt='all', sort='asc';
        function apply(){
          rows.forEach(function(r){ var show = filt==='all' || (filt==='akt'&&r.__akt) || (filt==='ehe'&&!r.__akt); r.classList.toggle('hide', !show); });
          var vis=rows.slice().filter(function(r){return !r.classList.contains('hide');});
          vis.sort(function(a,b){ return sort==='asc'? a.__nr-b.__nr : b.__nr-a.__nr; });
          vis.forEach(function(r){ chron.appendChild(r); });
        }
        ctl.addEventListener('click', function(e){
          var b=e.target.closest('button'); if(!b) return;
          if(b.dataset.f){ filt=b.dataset.f; ctl.querySelectorAll('.cc-seg button').forEach(function(x){x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b);}); }
          if(b.dataset.s){ sort = sort==='asc'?'desc':'asc'; b.innerHTML = sort==='asc'?'Älteste zuerst <span class="cc-arr">↑</span>':'Neueste zuerst <span class="cc-arr">↓</span>'; b.dataset.s=sort; }
          apply();
        });
      }
    }catch(e){}

    /* 4) Scroll-Reveal */
    try{
      var sel='.stitle,.slead,.hi,.ji,.gc,.kbox,.aimg,.acc,.chron-ctl,.ry';
      var els=[].slice.call(document.querySelectorAll(sel));
      els.forEach(function(el){ el.classList.add('reveal'); });
      if('IntersectionObserver' in window){
        var io=new IntersectionObserver(function(ents){ ents.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target);} }); },{threshold:.12, rootMargin:'0px 0px -8% 0px'});
        els.forEach(function(el){ io.observe(el); });
      } else { els.forEach(function(el){ el.classList.add('in'); }); }
    }catch(e){}

    /* 5) Instagram-Icon vor dem Kontakt-Handle (@deidesheimer_kerwebuwe) */
    try{
      var IGSVG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:1.05em;height:1.05em;flex:0 0 auto"><rect x="3" y="3" width="18" height="18" rx="5.2"/><circle cx="12" cy="12" r="4"/><circle cx="17.6" cy="6.4" r="1.3" fill="currentColor" stroke="none"/></svg>';
      [].slice.call(document.querySelectorAll('.iglink')).forEach(function(el){
        if(!el.querySelector('svg')){ el.insertAdjacentHTML('afterbegin', IGSVG); }
      });
    }catch(e){}

    /* 6) Aktive Buwe: Kerwe-Anzahl automatisch pro Jahr hochzaehlen
          (eine Kerwe mehr, sobald die Weinkerwe nach dem 3. August-Wochenende vorbei ist) */
    try{
      function nthSundayAug(y,n){
        var d=new Date(y,7,1), day=d.getDay();      // 0=So
        var first=1+((7-day)%7);                      // Datum des 1. Sonntags im August
        return new Date(y,7, first+(n-1)*7, 23,59,59);
      }
      var now=new Date(), Y=now.getFullYear();
      var passed = now > nthSundayAug(Y,3);           // Weinkerwe endet nach dem 3. August-Wochenende
      [].slice.call(document.querySelectorAll('.brow.ba')).forEach(function(row){
        var yrEl=row.querySelector('.byear'), bd=row.querySelector('.bbadge');
        if(!yrEl||!bd) return;
        var m=(yrEl.textContent||'').match(/(\d{4})/);
        if(!m) return;
        var start=parseInt(m[1],10);
        var n=(Y-start)+(passed?1:0);
        if(n<1) n=1;
        bd.textContent=n+' Kerwe';
        bd.title='aktiv seit '+start;
      });
    }catch(e){}

    /* 7) Optionales Hintergrund-Video im Hero (direkt im Hintergrund, kein Fenster) */
    try{
      var VID=window.KERWE_HERO_VIDEO||'';
      var hero=document.querySelector('.hero');
      if(VID && hero && !hero.querySelector('.hero-video')){
        var v=document.createElement('video');
        v.className='hero-video';
        v.autoplay=true; v.loop=true; v.muted=true; v.defaultMuted=true; v.preload='auto';
        v.setAttribute('muted',''); v.setAttribute('playsinline',''); v.setAttribute('autoplay',''); v.setAttribute('loop','');
        v.src=VID;
        hero.insertBefore(v, hero.firstChild);
        hero.classList.add('has-video');
        var pp=v.play&&v.play(); if(pp&&pp.catch) pp.catch(function(){});
      }
    }catch(e){}

    /* 8) Kerwerede als Apple-Sheet: Spring-Open (Materialize) + Swipe/Drag-to-close */
    try{
      var modal=document.getElementById('rmodal');
      var box=modal&&modal.querySelector('.mbox');
      if(modal&&box){
        var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
        var grip=document.createElement('span'); grip.className='sheet-grip';
        box.insertBefore(grip, box.firstChild);
        var raf=null, y=0;
        function setY(v){ y=v; box.style.transform = v ? ('translateY('+v.toFixed(1)+'px)') : 'translateY(0)'; }
        function springTo(target, resp, damp, v0, done){
          if(raf) cancelAnimationFrame(raf);
          if(reduce){ setY(target); if(done)done(); return; }
          var k=Math.pow(2*Math.PI/resp,2), c=2*damp*(2*Math.PI/resp), vel=v0||0, last=performance.now();
          function step(t){
            var dt=Math.min(0.032,(t-last)/1000); last=t;
            vel += (-k*(y-target) - c*vel)*dt; setY(y+vel*dt);
            if(Math.abs(y-target)<0.5 && Math.abs(vel)<8){ setY(target); if(done)done(); return; }
            raf=requestAnimationFrame(step);
          }
          raf=requestAnimationFrame(step);
        }
        function boxH(){ return box.getBoundingClientRect().height || 480; }
        function animateOpen(){
          if(reduce){ setY(0); return; }
          box.style.transition='none';
          setY(Math.min(window.innerHeight, boxH()+120));
          requestAnimationFrame(function(){ springTo(0, 0.36, 0.82, 0); });
        }
        var mo=new MutationObserver(function(){ if(modal.classList.contains('show')) animateOpen(); });
        mo.observe(modal,{attributes:true,attributeFilter:['class']});
        var _cls = window.cls;
        var vy=0;
        function finishClose(){ if(typeof _cls==='function') _cls(); box.style.transform='translateY(0)'; y=0; }
        function closeSheet(){
          if(raf) cancelAnimationFrame(raf);
          if(reduce){ finishClose(); return; }
          var vel=(vy>0?vy:0); if(vel<420) vel=420;   /* nach unten werfen */
          var last=performance.now(), limit=boxH()+40;
          function step(t){
            var dt=Math.min(0.032,(t-last)/1000); last=t;
            vel += 2800*dt;                           /* Beschleunigung -> faellt natuerlich raus */
            setY(y+vel*dt);
            if(y>=limit){ finishClose(); return; }
            raf=requestAnimationFrame(step);
          }
          raf=requestAnimationFrame(step);
        }
        if(typeof _cls==='function'){ window.cls=function(){ closeSheet(); }; }
        /* Drag-to-dismiss */
        var drag=false, startY=0, baseY=0, samples=[];
        function canStart(e){
          var t=e.target;
          if(grip.contains(t)) return true;
          if(t.classList&&(t.classList.contains('my')||t.classList.contains('mc'))) return true;
          if(t.tagName==='H3') return true;
          return box.scrollTop<=0;
        }
        box.addEventListener('pointerdown', function(e){
          if(e.button) return; if(!canStart(e)) return;
          drag=true; startY=e.clientY; baseY=y; samples=[{t:performance.now(),y:e.clientY}];
          if(raf) cancelAnimationFrame(raf);
        });
        box.addEventListener('pointermove', function(e){
          if(!drag) return;
          var dy=e.clientY-startY, ny=baseY+dy;
          if(ny<0) ny = ny*0.3;                 /* Rubberband nach oben */
          if(dy>4){ try{ box.setPointerCapture(e.pointerId); }catch(_){} e.preventDefault(); }
          setY(ny);
          samples.push({t:performance.now(),y:e.clientY}); if(samples.length>6) samples.shift();
        }, {passive:false});
        function endDrag(){
          if(!drag) return; drag=false;
          var s0=samples[0], s1=samples[samples.length-1], dt=(s1.t-s0.t)||16;
          vy=(s1.y-s0.y)/dt*1000;
          var proj = y + (vy/1000)*0.998/(1-0.998);   /* Momentum-Projektion */
          if(proj > boxH()*0.32 || vy > 650){ closeSheet(); }
          else { springTo(0, 0.34, 0.85, vy); }
        }
        box.addEventListener('pointerup', endDrag);
        box.addEventListener('pointercancel', endDrag);
      }
    }catch(e){}
  });
})();
