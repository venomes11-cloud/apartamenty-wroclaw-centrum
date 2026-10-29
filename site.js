/* In The Sky · animacje wejścia sekcji i wyśrodkowanie sliderów (25.09.2026). */
(function(){
  function fit(){document.querySelectorAll('.atuty-slider,.aps-slider').forEach(function(s){s.classList.toggle('fits',s.scrollWidth<=s.clientWidth+2);});}
  fit();window.addEventListener('resize',fit);window.addEventListener('load',fit);
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
  var sel='.sec .head,.sec .eyebrow,.atut,.ap,.plan,.bpost,.faq-t .row,.gal a,.vcross h2,.vcross p,.vcross .btn,.guest-rating,.scores,.tower .panel';
  var els=[].slice.call(document.querySelectorAll(sel)).filter(function(e){return !e.closest('.hero')&&!e.classList.contains('reveal')&&!e.closest('.reveal')&&e.getBoundingClientRect().top>innerHeight*.9;});
  var cnt=new WeakMap();
  els.forEach(function(e){var p=e.parentNode,c=cnt.get(p)||0;cnt.set(p,c+1);e.classList.add('fx');if(c%4)e.classList.add('d'+(c%4));});
  var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}});},{rootMargin:'0px 0px -6% 0px',threshold:.08});
  els.forEach(function(e){io.observe(e);});
})();

/* Kalendarz zakresu dat w hero: jeden kalendarz, klik przyjazd → klik wyjazd, zaznaczony zakres (28.09.2026). */
(function(){
  var form=document.getElementById('datebar');if(!form)return;
  var inA=document.getElementById('dbFrom'),inB=document.getElementById('dbTo');if(!inA||!inB)return;
  var lang=(document.documentElement.lang||'pl').slice(0,2);
  var T={pl:['Wybierz datę wyjazdu','Wybierz datę przyjazdu','nocy','noc','noce','Gotowe','Poprzedni miesiąc','Następny miesiąc'],en:['Select check-out','Select check-in','nights','night','nights','Done','Previous month','Next month'],de:['Abreise wählen','Anreise wählen','Nächte','Nacht','Nächte','Fertig','Vorheriger Monat','Nächster Monat'],cs:['Vyberte odjezd','Vyberte příjezd','nocí','noc','noci','Hotovo','Předchozí měsíc','Další měsíc']}[lang]||null;
  if(!T)T=['Wybierz datę wyjazdu','Wybierz datę przyjazdu','nocy','noc','noce','Gotowe','Poprzedni miesiąc','Następny miesiąc'];
  var loc={pl:'pl-PL',en:'en-GB',de:'de-DE',cs:'cs-CZ'}[lang]||'pl-PL';
  function iso(d){return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
  function parse(s){var p=(s||'').split('-');return p.length===3?new Date(+p[0],+p[1]-1,+p[2]):null}
  function fmt(d){return d?d.toLocaleDateString(loc,{day:'numeric',month:'short',year:'numeric'}).replace('.',''):'—'}
  var today=new Date();today.setHours(0,0,0,0);
  var a=parse(inA.value)||new Date(today.getTime()+864e5),b=parse(inB.value)||new Date(a.getTime()+864e5),pick=0,hover=null;
  form.classList.add('dp-on');
  /* 21.10.2026 (Piotr): pod każdym dniem najniższa cena za noc najtańszego wolnego apartamentu.
     Ceny z /oferta/ceny-dni.php (cache serwera z silnika Previo), pobierane w tle zaraz po wejściu na stronę. */
  var CENY={},cur={pl:'zł',en:'PLN',de:'PLN',cs:'PLN'}[lang]||'zł';
  
  function ceny(){fetch('/oferta/ceny-dni.php',{credentials:'omit'}).then(function(r){return r.json()}).then(function(j){if(j&&j.ok){CENY=j.dni;try{sessionStorage.setItem('its-ceny-dni',JSON.stringify({t:Date.now(),d:CENY}))}catch(e){}if(!pop.hidden)render()}}).catch(function(){})}
  
  (function(){var st=document.createElement('style');st.textContent='.dp-day{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;line-height:1.05;aspect-ratio:auto!important;min-height:52px}.dp-day .dp-c{font-size:10.5px;font-weight:500;color:#8a7650;letter-spacing:-.01em;white-space:nowrap}.dp-day .dp-c.dp-min{color:#101931;background:#e6d3a8;border-radius:5px;padding:0 4px;font-weight:600}.dp-day.dp-start .dp-c,.dp-day.dp-end .dp-c{color:#e6d3a8;background:none}.dp-day.dp-full .dp-c{text-decoration:line-through;color:#b9b4aa}.dp-day .dp-sk{display:block;width:30px;height:7px;border-radius:4px;background:linear-gradient(90deg,#eee7da,#f8f3ea,#eee7da);background-size:200% 100%;animation:dpsk 1.2s infinite}@keyframes dpsk{0%{background-position:200% 0}100%{background-position:-200% 0}}@media (max-width:759px){.dp-day{min-height:46px}.dp-day .dp-c{font-size:9.5px}.dp-day .dp-c .dp-zl{display:none}}';document.head.appendChild(st)})();
  function cenaDnia(dt,mn){if(dt<today)return '';if(!CENY)return '<span class="dp-sk"></span>';var e=CENY[iso(dt)];if(!e)return '';if(!e.c)return '<span class="dp-c">—</span>';
    return '<span class="dp-c'+(mn&&e.c===mn?' dp-min':'')+'">'+e.c.toLocaleString(loc)+'<span class="dp-zl"> '+cur+'</span></span>'}
  function minMies(m,n){if(!CENY)return null;var mn=null;for(var k=0;k<n;k++){var mm=new Date(m.getFullYear(),m.getMonth()+k,1),pre=iso(mm).slice(0,7);for(var key in CENY)if(key.slice(0,7)===pre&&CENY[key].c&&(mn===null||CENY[key].c<mn))mn=CENY[key].c}return mn}
  function field(inp,cls){var btn=document.createElement('button');btn.type='button';btn.className='dp-field '+cls;inp.parentNode.appendChild(btn);return btn}
  var fA=field(inA,'dp-a'),fB=field(inB,'dp-b');
  var pop=document.createElement('div');pop.className='dp-pop';pop.setAttribute('role','dialog');pop.hidden=true;form.appendChild(pop);
  var view=new Date(a.getFullYear(),a.getMonth(),1);
  function sync(){fA.textContent=fmt(a);fB.textContent=fmt(b);inA.value=a?iso(a):'';inB.value=b?iso(b):'';
    [inA,inB].forEach(function(i){i.dispatchEvent(new Event('change',{bubbles:true}))});
    inA.value=a?iso(a):'';inB.value=b?iso(b):'';}
  function months(){return window.matchMedia('(min-width:760px)').matches?2:1}
  function render(){
    var n=months(),MN=minMies(view,n),h='<div class="dp-head"><button type="button" class="dp-nav" data-d="-1" aria-label="'+T[6]+'">‹</button><span class="dp-hint">'+(pick?T[0]:T[1])+'</span><button type="button" class="dp-nav" data-d="1" aria-label="'+T[7]+'">›</button></div><div class="dp-months">';
    for(var k=0;k<n;k++){
      var m=new Date(view.getFullYear(),view.getMonth()+k,1);
      h+='<div class="dp-month"><div class="dp-title">'+m.toLocaleDateString(loc,{month:'long',year:'numeric'})+'</div><div class="dp-grid">';
      var wd=new Date(2024,0,1);for(var w=0;w<7;w++){h+='<span class="dp-wd">'+new Date(2024,0,1+w).toLocaleDateString(loc,{weekday:'short'}).slice(0,2)+'</span>'}
      var off=(m.getDay()+6)%7;for(var e=0;e<off;e++)h+='<span></span>';
      var days=new Date(m.getFullYear(),m.getMonth()+1,0).getDate();
      for(var d=1;d<=days;d++){
        var dt=new Date(m.getFullYear(),m.getMonth(),d),t=dt.getTime(),c='dp-day';
        var end=pick&&hover?hover:b;
        if(t<today.getTime())c+=' dp-past';
        if(a&&t===a.getTime())c+=' dp-start';
        if(end&&t===end.getTime()&&(!pick||hover))c+=' dp-end';
        if(a&&end&&t>a.getTime()&&t<end.getTime())c+=' dp-in';
        if(t===today.getTime())c+=' dp-today';
        var ec=CENY&&CENY[iso(dt)];if(ec&&ec.w===0&&t>=today.getTime())c+=' dp-full';
        h+='<button type="button" class="'+c+'" data-t="'+t+'"'+(t<today.getTime()?' disabled':'')+'><span class="dp-n">'+d+'</span>'+cenaDnia(dt,MN)+'</button>';
      }
      h+='</div></div>';
    }
    var nights=a&&b&&!pick?Math.round((b-a)/864e5):0;
    h+='</div><div class="dp-foot"><span>'+(nights?fmt(a)+' → '+fmt(b)+' · '+nights+' '+(nights===1?T[3]:(nights<5&&lang!=='en'?T[4]:T[2])):'')+'</span><button type="button" class="dp-done">'+T[5]+'</button></div>';
    pop.innerHTML=h;
  }
  function open(which){pick=which;if(which===0){hover=null}view=new Date((which&&a?a:(a||today)).getFullYear(),(which&&a?a:(a||today)).getMonth(),1);render();pop.hidden=false;form.classList.add('dp-open')}
  function close(){pop.hidden=true;pick=0;hover=null;form.classList.remove('dp-open')}
  fA.addEventListener('click',function(e){e.stopPropagation();open(0)});
  fB.addEventListener('click',function(e){e.stopPropagation();open(1)});
  pop.addEventListener('click',function(e){e.stopPropagation();var t=e.target.closest('button');if(!t)return;
    if(t.classList.contains('dp-nav')){view=new Date(view.getFullYear(),view.getMonth()+(+t.dataset.d),1);render();return}
    if(t.classList.contains('dp-done')){close();return}
    if(!t.dataset.t||t.disabled)return;
    var d=new Date(+t.dataset.t);
    if(!pick||(a&&d<=a)){a=d;b=null;pick=1;hover=null;sync();render();return}
    b=d;pick=0;hover=null;sync();render();setTimeout(close,350);
  });
  function paint(){var end=pick&&hover?hover:b;pop.querySelectorAll('.dp-day').forEach(function(x){var t=+x.dataset.t;
    x.classList.toggle('dp-start',!!a&&t===a.getTime());x.classList.toggle('dp-end',!!end&&t===end.getTime()&&(!pick||!!hover));
    x.classList.toggle('dp-in',!!a&&!!end&&t>a.getTime()&&t<end.getTime());});}
  pop.addEventListener('mouseover',function(e){if(!pick)return;var t=e.target.closest('.dp-day');if(!t||t.disabled)return;var d=new Date(+t.dataset.t);if(a&&d>a&&(!hover||hover.getTime()!==d.getTime())){hover=d;paint()}});
  document.addEventListener('click',function(e){if(!pop.hidden&&!form.contains(e.target)){if(!b&&a){b=new Date(a.getTime()+864e5);sync()}close()}});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!pop.hidden)close()});
  form.addEventListener('submit',function(e){if(!b&&a){b=new Date(a.getTime()+864e5);sync()}},true);
  window.addEventListener('resize',function(){if(!pop.hidden)render()});
  sync();
})();

/* Menu, slajdy hero, pasek mobilny, galeria, formularz: rezerwacja online albo zapytanie e-mail. */
(function(){
  var m=document.getElementById('menu');
  document.querySelectorAll('[data-menu-open]').forEach(function(b){b.addEventListener('click',function(){m.classList.add('open');});});
  document.querySelectorAll('[data-menu-close], #menu a').forEach(function(b){b.addEventListener('click',function(){m.classList.remove('open');});});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')m.classList.remove('open');});
  var still=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var imgs=[].slice.call(document.querySelectorAll('.slides img')),dots=document.querySelector('.hero .dots'),i=0;
  if(dots&&imgs.length>1){imgs.forEach(function(_,k){var s=document.createElement('span');if(!k)s.className='on';dots.appendChild(s);});}
  function show(n){i=n;imgs.forEach(function(x,k){x.classList.toggle('on',k===i);if(k===i)x.loading='eager';});if(dots)[].forEach.call(dots.children,function(d,k){d.classList.toggle('on',k===i);});}
  if(imgs.length>1&&!still)setInterval(function(){show((i+1)%imgs.length);},6000);
  var bar=document.querySelector('.stickybar'),hero=document.querySelector('.hero');
  if(bar&&hero){new IntersectionObserver(function(es){bar.classList.toggle('is-visible',!es[0].isIntersecting);}).observe(hero);}
  var tw=document.querySelector('.tower-bg');
  if(tw&&!still){var busy=false;addEventListener('scroll',function(){if(busy)return;busy=true;requestAnimationFrame(function(){busy=false;var r=tw.parentNode.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;tw.style.transform='translate3d(0,'+(-(r.top/innerHeight)*8-10).toFixed(2)+'%,0)';});},{passive:true});}
  function pl(s){var p=(s||'').split('-');return p.length===3?p[2]+'.'+p[1]+'.'+p[0]:s;}
  var f=document.getElementById('datebar');
  if(f)f.addEventListener('submit',function(e){e.preventDefault();var a=document.getElementById('dbFrom').value;
    if(f.dataset.rez){var b=document.getElementById('dbTo').value;location.href='/rezerwacja/?arrival='+encodeURIComponent(a)+'&departure='+encodeURIComponent(b);return;}
    var n=document.getElementById('dbN'),os=n?n.value:'';
    var body='Dzień dobry,\n\n'+f.dataset.tresc+'\nTermin: '+pl(a)+'\nLiczba osób: '+os+'\nTelefon: \n\nPozdrawiam';
    location.href='mailto:'+f.dataset.mail+'?subject='+encodeURIComponent(f.dataset.temat+' '+pl(a))+'&body='+encodeURIComponent(body);});
  function go(id){var t=document.getElementById(id);if(!t)return false;var y=t.getBoundingClientRect().top+scrollY-70;window.scrollTo({top:y,behavior:still?'auto':'smooth'});return true;}
  var home=location.pathname==='/'||location.pathname==='/index.html';
  document.querySelectorAll('a[data-to]').forEach(function(l){l.addEventListener('click',function(e){
    if(home){e.preventDefault();m.classList.remove('open');go(l.dataset.to);}else{try{sessionStorage.setItem('sc-to',l.dataset.to);}catch(x){}}});});
  if(home){var want=null;try{want=sessionStorage.getItem('sc-to');sessionStorage.removeItem('sc-to');}catch(x){}
    if(location.hash){want=location.hash.slice(1);history.replaceState(null,'',location.pathname+location.search);}
    if(want)setTimeout(function(){go(want);},150);}
  var lb=document.getElementById('lb');
  if(lb){var li=lb.querySelector('img'),items=[].slice.call(document.querySelectorAll('.g-item')),cur=0;
    function op(k){cur=(k+items.length)%items.length;li.src=items[cur].getAttribute('href');li.alt=items[cur].dataset.alt;lb.querySelector('.lb-cap').textContent=items[cur].dataset.alt;if(!lb.open)lb.showModal();}
    items.forEach(function(a,k){a.addEventListener('click',function(e){e.preventDefault();op(k);});});
    lb.querySelector('.lb-x').addEventListener('click',function(){lb.close();});
    lb.querySelector('.lb-p').addEventListener('click',function(){op(cur-1);});
    lb.querySelector('.lb-n').addEventListener('click',function(){op(cur+1);});
    lb.addEventListener('click',function(e){if(e.target===lb)lb.close();});
    lb.addEventListener('keydown',function(e){if(e.key==='ArrowLeft')op(cur-1);if(e.key==='ArrowRight')op(cur+1);});}
})();
