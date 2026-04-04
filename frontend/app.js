(function(){
'use strict';

/* ── API base URL ──────────────────────────────────────────────
   Auto-detects local vs production.
   After deploying to Railway, replace YOUR-RAILWAY-URL below
   with your actual Railway domain. Example:
   'https://vigil-backend-production.up.railway.app'
   ──────────────────────────────────────────────────────────── */
var API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5001'
  : 'https://YOUR-RAILWAY-URL.up.railway.app';

/* ── Navbar scroll ── */
var nav=document.getElementById('navbar'),tick=false;
window.addEventListener('scroll',function(){
  if(!tick){requestAnimationFrame(function(){nav.classList.toggle('scrolled',window.scrollY>60);tick=false});tick=true}
},{passive:true});

/* ── Scroll reveal ── */
var els=document.querySelectorAll('.reveal');
if('IntersectionObserver' in window){
  var obs=new IntersectionObserver(function(entries){
    entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target)}});
  },{threshold:0.12,rootMargin:'0px 0px -50px 0px'});
  els.forEach(function(el){obs.observe(el)});
}else{els.forEach(function(el){el.classList.add('visible')})}

/* ── Chip selection ── */
function initChips(id){
  var g=document.getElementById(id);if(!g)return;
  g.addEventListener('click',function(e){
    var c=e.target.closest('.chip');if(!c)return;
    g.querySelectorAll('.chip').forEach(function(x){x.classList.remove('on');x.setAttribute('aria-pressed','false')});
    c.classList.add('on');c.setAttribute('aria-pressed','true');
  });
}
initChips('h-chips');

/* ── Helpers ── */
function isEmail(v){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())}
function setErr(inp,err,on){inp.classList.toggle('err',on);err.classList.toggle('show',on)}
function getRole(gid){var s=document.querySelector('#'+gid+' .chip.on');return s?s.dataset.role:'not_specified'}

/* ── Real API call ── */
function apiPost(data, ok, fail){
  fetch(API_BASE + '/api/waitlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name:  data.name  || '',
      email: data.email || '',
      role:  data.role  || 'not_specified'
    })
  })
  .then(function(res){
    return res.json().then(function(body){
      return { status: res.status, body: body };
    });
  })
  .then(function(r){
    if(r.status === 201){ ok(r.body.spotNumber); return; }
    if(r.status === 409){ fail('dup'); return; }
    fail('error');
  })
  .catch(function(){
    fail('error');
  });
}

/* ── Fetch live count on load so spot numbers are accurate ── */
fetch(API_BASE + '/api/waitlist/count')
  .then(function(r){ return r.json(); })
  .then(function(d){ if(d.count !== undefined){ localStorage.setItem('v_spot', d.count); } })
  .catch(function(){});

/* ── Hero form ── */
(function(){
  var ni=document.getElementById('h-name'),
      ei=document.getElementById('h-email'),
      ne=document.getElementById('h-ne'),
      ee=document.getElementById('h-ee'),
      toast=document.getElementById('h-toast'),
      btn=document.getElementById('h-btn'),
      fb=document.getElementById('fb'),
      ok=document.getElementById('h-ok'),
      spot=document.getElementById('h-spot');

  function setLoad(on){
    btn.classList.toggle('loading',on);
    btn.disabled=on;
    btn.setAttribute('aria-busy',on?'true':'false');
    btn.querySelector('.bt').textContent=on?'Securing your spot...':'Reserve my spot';
  }
  function showToast(m){toast.textContent=m;toast.classList.add('show')}
  function hideToast(){toast.classList.remove('show')}

  btn.addEventListener('click',function(){
    var nv=ni.value.trim(),ev=ei.value.trim();
    var nok=nv.length>=2,eok=isEmail(ev);
    setErr(ni,ne,!nok);setErr(ei,ee,!eok);hideToast();
    if(!nok||!eok)return;
    setLoad(true);
    apiPost(
      { name: nv, email: ev, role: getRole('h-chips') },
      function(spotNumber){
        setLoad(false);
        fb.style.display='none';
        ok.classList.add('show');
        spot.textContent='Spot #' + spotNumber + ' secured. Check your inbox.';
      },
      function(t){
        setLoad(false);
        showToast(
          t==='dup'
            ? 'Looks like you are already on the list. We will be in touch soon.'
            : 'Something went wrong. Please try again.'
        );
      }
    );
  });

  ni.addEventListener('input',function(){setErr(ni,ne,false);hideToast()});
  ei.addEventListener('input',function(){setErr(ei,ee,false);hideToast()});
  [ni,ei].forEach(function(i){
    i.addEventListener('keydown',function(e){ if(e.key==='Enter') btn.click(); });
  });
})();

/* ── Bottom CTA form ── */
(function(){
  var ei=document.getElementById('btm-email'),
      btn=document.getElementById('btm-btn'),
      wrap=document.getElementById('btm-wrap'),
      ok=document.getElementById('btm-ok');

  btn.addEventListener('click',function(){
    if(!isEmail(ei.value.trim())){
      ei.style.borderColor='rgba(220,38,38,0.6)';
      ei.focus();
      return;
    }
    ei.style.borderColor='';
    btn.disabled=true;
    btn.textContent='Sending...';

    apiPost(
      { email: ei.value.trim(), name: '', role: 'not_specified' },
      function(){
        wrap.style.display='none';
        ok.classList.add('show');
      },
      function(){
        btn.disabled=false;
        btn.innerHTML='<svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round" aria-hidden="true"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg> Join the waitlist';
      }
    );
  });

  ei.addEventListener('keydown',function(e){ if(e.key==='Enter') btn.click(); });
})();

})();