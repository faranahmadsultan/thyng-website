// THYNG - shared logic: products, cart (localStorage), header, helpers
const IC={menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>',bag:'<path d="M5 8h14l1 13H4L5 8z"/><path d="M9 8a3 3 0 016 0"/>'};
const svg=p=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">${p}</svg>`;
// Products are read from data/products.txt (one per line, fields split by |)
window.PRODUCTS_READY=fetch('data/products.txt?'+Date.now()).then(r=>{if(!r.ok)throw 0;return r.text()}).then(t=>{
 const all=t.split(/\r?\n/).map(l=>l.trim()).filter(l=>l&&!l.startsWith('#')).map(l=>{const f=l.split('|').map(x=>x.trim());
  return{id:f[0],name:f[1],type:f[2],price:+f[3],compare:f[4]?+f[4]:0,soldOut:/sold/i.test(f[5]||''),img:(f[6]||f[0]+'.jpg').replace(/\.\w+$/,''),collections:(f[7]||'').split(',').map(x=>x.trim()).filter(Boolean),images:(f[8]||'').split(',').map(x=>x.trim()).filter(Boolean).map(n=>'assets/products/'+n)}});
 window.PRODUCTS=all.filter(p=>p.type!=='bundle');window.BUNDLES=all.filter(p=>p.type==='bundle');
}).catch(()=>{document.body.insertAdjacentHTML('afterbegin','<p style="background:#fee;padding:12px;text-align:center">Could not load data/products.txt - open the site through a web server (or GitHub Pages), not by double-clicking the file.</p>');window.PRODUCTS=[];window.BUNDLES=[]});
const fmt=n=>'PKR '+n.toLocaleString('en-US')+'.00';
const img=p=>`assets/products/${p.img}.jpg`;
const Cart={get(){try{return JSON.parse(localStorage.getItem('thyng_cart'))||[]}catch(e){return[]}},
 save(c){localStorage.setItem('thyng_cart',JSON.stringify(c));Cart.badge()},
 add(id,q=1){const c=Cart.get(),i=c.find(x=>x.id===id);i?i.q+=q:c.push({id,q});Cart.save(c)},
 remove(id){Cart.save(Cart.get().filter(x=>x.id!==id))},
 badge(){const n=Cart.get().reduce((s,x)=>s+x.q,0),b=document.querySelector('.cart-count');if(b){b.textContent=n;b.style.display=n?'block':'none'}}};
function priceHTML(p){return p.compare?`<s>${fmt(p.compare)}</s>${fmt(p.price)}`:fmt(p.price)}
function cardHTML(p){const t=p.soldOut?'Sold out':p.compare?'Sale':'';
 return `<a class="card" href="product.html?id=${p.id}"><div class="m"><img src="${img(p)}" alt="${p.name}" loading="lazy">${t?`<span class="tag">${t}</span>`:''}</div><h3>${p.name}</h3><div class="price">${p.compare?`<s>${fmt(p.compare)}</s>`:""}<b>${fmt(p.price)}</b></div></a>`}
function buildHeader(){
 document.body.insertAdjacentHTML('afterbegin',`<div class="announce"><a href="https://wa.me/923324915444">For customization contact via Text ! →</a></div>
<header class="site-header"><div class="hl"><button class="menu-btn" aria-label="Menu">${svg(IC.menu)}</button><button class="sBtn dsearch" aria-label="Search">${svg(IC.search)}</button></div>
<a class="logo" href="index.html"><img src="assets/logo.png" alt="THYNG"></a>
<div class="icons"><button class="sBtn msearch" aria-label="Search">${svg(IC.search)}</button><a href="cart.html" aria-label="Cart">${svg(IC.bag)}<span class="cart-count"></span></a></div>
<nav class="dnav"><a href="shop.html">Shop</a><a href="collections.html">The Collections</a><a href="inside.html">Inside</a><a href="customized.html">Customized</a><a href="policy.html?p=shipping">The Tea</a><a href="contact.html">Connect</a><a href="shop.html?c=sale">Sale</a></nav></header>
<div class="scrim"></div><nav class="drawer"><button class="menu-btn" aria-label="Close" style="margin-bottom:30px">${svg('<path d="M5 5l14 14M19 5L5 19"/>')}</button>
<a href="shop.html">Shop</a><a href="collections.html">The Collections</a><a href="inside.html">Inside</a><a href="customized.html">Customized</a><a href="policy.html?p=shipping">The Tea</a><a href="contact.html">Connect</a><a href="shop.html?c=sale">Sale</a></nav>
<div class="search-panel"><form action="search.html"><input name="q" placeholder="Search" autocomplete="off"><button type="button" id="sClose">✕</button><div class="pdbox" hidden></div></form></div>`);
 const d=document.querySelector('.drawer'),s=document.querySelector('.scrim'),sp=document.querySelector('.search-panel');attachPredictive(sp.querySelector('input'),sp.querySelector('.pdbox'));
 const tog=()=>{d.classList.toggle('open');s.classList.toggle('open')};
 document.querySelectorAll('.menu-btn').forEach(b=>b.onclick=tog);s.onclick=tog;
 document.querySelectorAll('.sBtn').forEach(b=>b.onclick=()=>{sp.classList.add('open');sp.querySelector('input').focus()});
 document.querySelectorAll('.dnav a').forEach(a=>{const u=new URL(a.href),here=location.pathname.split('/').pop()||'index.html';if(u.pathname.split('/').pop()===here&&(u.search===''?!location.search:(u.search===location.search||here==='policy.html')))a.classList.add('on')});
 document.getElementById('sClose').onclick=()=>sp.classList.remove('open');Cart.badge();}

// ---- Search (shared by header pop-up and search.html) ----
const SYN={shades:['glasses','glass','sunglasses','sunglass','eyewear','specs','shades','shade'],cap:['cap','caps','hat','hats'],tee:['tee','tees','shirt','shirts','tshirt','tshirts']};
const SPAGES=[{t:'Custom Hand Embroidered Caps',u:'customized.html'},{t:'Spotted in THYNG',u:'inside.html'},{t:'Linkup',u:'contact.html'},{t:'Shipping policy',u:'policy.html?p=shipping'},{t:'Privacy policy',u:'policy.html?p=privacy'},{t:'Customization policy',u:'policy.html?p=customization'}];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function searchProducts(q){const toks=q.toLowerCase().split(/\s+/).filter(Boolean);if(!toks.length)return[];
 return (window.PRODUCTS||[]).concat(window.BUNDLES||[]).filter(p=>{const n=p.name.toLowerCase();
  return toks.every(t=>n.includes(t)||Object.keys(SYN).some(k=>SYN[k].includes(t)&&p.type===k))});}
function predictiveHTML(q){const items=searchProducts(q),toks=q.toLowerCase().split(/\s+/).filter(Boolean);
 const nameHit=items.some(p=>toks.every(t=>p.name.toLowerCase().includes(t)));const sug=[];
 if(nameHit){sug.push(q.toLowerCase());items.forEach(p=>{const w=p.name.toLowerCase().replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(Boolean);
  toks.forEach(t=>{const i=w.findIndex(x=>x.includes(t));if(i>0){const s=w.slice(Math.max(0,i-2),i+1).join(' ');if(!sug.includes(s)&&sug.length<5)sug.push(s)}})})}
 const pages=SPAGES.filter(g=>toks.every(t=>g.t.toLowerCase().includes(t)));
 const left=(sug.length?'<h4>Suggestions</h4>'+sug.map(s=>`<a href="search.html?q=${encodeURIComponent(s)}">${esc(s)}</a>`).join(''):'')+(pages.length?'<h4>Pages</h4>'+pages.map(g=>`<a href="${g.u}">${esc(g.t)}</a>`).join(''):'');
 const row=p=>`<a class="pdi" href="product.html?id=${p.id}"><img src="${img(p)}" alt=""><span><b>${esc(p.name)}</b><small>${p.compare?`<s>${fmt(p.compare)}</s>`:''}${fmt(p.price)}</small></span></a>`;
 const right='<h4>Products</h4>'+(items.length?items.slice(0,10).map(row).join(''):`<p class="pdn">No results found for “${esc(q)}”.</p>`);
 return `<div class="pd${left?' two':''}">${left?`<div class="pdl">${left}</div>`:''}<div class="pdr">${right}</div></div><a class="pdf" href="search.html?q=${encodeURIComponent(q)}"><span>Search for “${esc(q)}”</span><span>→</span></a>`;}
function attachPredictive(input,box){
 const upd=()=>{const q=input.value.trim();if(!q){box.hidden=true;box.innerHTML='';return}PRODUCTS_READY.then(()=>{box.innerHTML=predictiveHTML(q);box.hidden=false})};
 input.addEventListener('input',upd);input.addEventListener('focus',()=>{if(input.value.trim())upd()});
 document.addEventListener('click',e=>{if(e.target!==input&&!box.contains(e.target))box.hidden=true});
 input.addEventListener('keydown',e=>{if(e.key==='Escape')box.hidden=true});}
buildHeader();

// ---- Full-screen image viewer (lightbox) ----
function openLightbox(list,start){
 let i=start||0;const n=list.length,lb=document.createElement('div');lb.className='lb';
 lb.innerHTML='<button class="lb-back" aria-label="Back">← Back</button>'+(n>1?'<span class="lb-count"></span><button class="lb-nav prev" aria-label="Previous image">‹</button><button class="lb-nav next" aria-label="Next image">›</button>':'')+'<img class="lb-img" alt="">';
 document.body.appendChild(lb);document.body.style.overflow='hidden';
 const im=lb.querySelector('.lb-img'),cnt=lb.querySelector('.lb-count');let closed=false;
 const show=k=>{i=(k+n)%n;im.src=list[i];if(cnt)cnt.textContent=(i+1)+' / '+n};
 const hide=()=>{if(closed)return;closed=true;lb.remove();document.body.style.overflow='';document.removeEventListener('keydown',key);removeEventListener('popstate',hide)};
 const close=()=>{if(history.state&&history.state.lb)history.back();else hide()};
 function key(e){if(e.key==='Escape')close();if(n>1&&e.key==='ArrowLeft')show(i-1);if(n>1&&e.key==='ArrowRight')show(i+1)}
 history.pushState({lb:1},'');addEventListener('popstate',hide);document.addEventListener('keydown',key);
 lb.querySelector('.lb-back').onclick=close;lb.addEventListener('click',e=>{if(e.target===lb)close()});
 if(n>1){lb.querySelector('.prev').onclick=()=>show(i-1);lb.querySelector('.next').onclick=()=>show(i+1);
  let x0=null;lb.addEventListener('touchstart',e=>{x0=e.touches[0].clientX},{passive:true});
  lb.addEventListener('touchend',e=>{if(x0===null)return;const d=e.changedTouches[0].clientX-x0;if(Math.abs(d)>50)show(i+(d<0?1:-1));x0=null})}
 show(i);}
// ---- Share a product ----
const SHARE_SVG='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 15V3M7 8l5-5 5 5M5 13v7h14v-7"/></svg>';
const WA_ICON='<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 00-8.600 15.100L2 22l5-1.300A10 10 0 1012 2zm5.200 14c-.2.600-1.300 1.200-1.800 1.200-.5.100-1 .2-3.300-.7-2.800-1.200-4.600-4-4.700-4.200-.1-.2-1.100-1.500-1.100-2.800s.7-2 1-2.300c.2-.3.500-.3.700-.3h.5c.2 0 .4 0 .6.500l.9 2.100c.1.200.1.400 0 .5l-.3.500-.4.400c-.1.200-.3.300-.1.600.2.300.8 1.300 1.700 2.100 1.200 1 2.100 1.300 2.400 1.500.3.100.4.100.6-.1l.8-1c.2-.3.400-.2.600-.1l2 1c.3.100.5.200.5.300.1.200.1.800-.1 1.400z"/></svg>';
function shareProduct(p,btn){
 const url=new URL('product.html?id='+p.id,location.href).href,title=p.name+' - THYNG',text='Check out '+p.name+' on THYNG';
 if(navigator.share){navigator.share({title,text,url}).catch(()=>{});return}
 const old=document.querySelector('.shmenu');if(old){old.remove();return}
 const e=encodeURIComponent,menu=document.createElement('div');menu.className='shmenu';
 menu.innerHTML=`<a target="_blank" rel="noopener" href="https://wa.me/?text=${e(text+' '+url)}">WhatsApp</a><a target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${e(url)}">Facebook</a><a target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?text=${e(text)}&url=${e(url)}">X (Twitter)</a><a href="mailto:?subject=${e(title)}&body=${e(text+'\n'+url)}">Email</a><button type="button">Copy link</button>`;
 btn.parentElement.style.position='relative';btn.parentElement.appendChild(menu);
 menu.querySelector('button').onclick=function(){const b=this,done=()=>{b.textContent='Link copied ✓'};
  if(navigator.clipboard)navigator.clipboard.writeText(url).then(done,done);else{const t=document.createElement('textarea');t.value=url;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();done()}};
 setTimeout(()=>document.addEventListener('click',function h(ev){if(!menu.contains(ev.target)&&ev.target!==btn){menu.remove();document.removeEventListener('click',h)}}),0);}

// ---- Slideshows: any <div class="ss" data-ss="none|dots|bar"> with .ss-track > .ss-slide children ----
const SLIDE_MS=4000; // change this number to speed up / slow down every slideshow (milliseconds)
function initSlideshows(){document.querySelectorAll('[data-ss]').forEach(el=>{
 const track=el.querySelector('.ss-track'),n=track.children.length;if(n<2)return;
 const mode=el.dataset.ss,ms=+el.dataset.ms||SLIDE_MS;let i=0,t,play=!matchMedia('(prefers-reduced-motion:reduce)').matches,bar=null;
 if(mode!=='none'){bar=document.createElement('div');bar.className='slidebar';
  bar.innerHTML='<button class="sb prev" aria-label="Previous slide">‹</button>'+(mode==='dots'?Array.from({length:n},()=>'<i class="dot"></i>').join(''):'<span class="cnt"></span>')+'<button class="sb next" aria-label="Next slide">›</button>'+(mode==='bar'?'<button class="sb pause" aria-label="Pause slideshow">❚❚</button>':'');
  el.after(bar);}
 const go=k=>{i=(k+n)%n;track.style.transform='translateX(-'+i*100+'%)';
  if(bar){bar.querySelectorAll('.dot').forEach((d,j)=>d.classList.toggle('on',j===i));const c=bar.querySelector('.cnt');if(c)c.textContent=(i+1)+' / '+n}};
 const stop=()=>clearInterval(t),start=()=>{stop();if(play)t=setInterval(()=>go(i+1),ms)};
 if(bar){bar.querySelector('.prev').onclick=()=>{go(i-1);start()};bar.querySelector('.next').onclick=()=>{go(i+1);start()};
  const pb=bar.querySelector('.pause');if(pb){pb.onclick=()=>{play=!play;pb.textContent=play?'❚❚':'▶';start()}}}
 go(0);start();});}
initSlideshows();
