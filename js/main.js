function rede(y){document.getElementById('rt').textContent='Kerweredd '+y;
 const rb=document.getElementById('rb');const t=REDEN[String(y)];
 if(t){rb.classList.remove('ph');rb.textContent=t;}
 else{rb.classList.add('ph');rb.textContent='Für '+y+' liegt noch keine Rede vor. Schickt sie mir – dann steht sie hier, Strophe für Strophe.';}
 const rp=document.getElementById('rpdf');const pd=RPDF[String(y)];
 if(pd){rp.style.display='inline-flex';rp.href=pd;rp.setAttribute('download','Kerwerede_'+y+'.pdf');}else{rp.style.display='none';}
 document.getElementById('rmodal').classList.add('show');document.querySelector('.mbox').scrollTop=0}
function cls(){document.getElementById('rmodal').classList.remove('show')}
document.addEventListener('keydown',e=>{if(e.key==='Escape')cls()});
document.querySelectorAll('.menu a').forEach(a=>a.addEventListener('click',()=>document.getElementById('menu').classList.remove('show')));
const secs=[...document.querySelectorAll('section[id]')];const links=[...document.querySelectorAll('.menu a')];
window.addEventListener('scroll',()=>{let c='';const y=scrollY+90;secs.forEach(s=>{if(s.offsetTop<=y)c=s.id});
 links.forEach(l=>l.classList.toggle('active',l.getAttribute('href')==='#'+c))});
