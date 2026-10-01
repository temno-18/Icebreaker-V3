/* Icebreaker global realtime troll/announcement layer. */
(function(){
  const cfg=window.SUPABASE_CONFIG;
  if(!cfg?.url||!cfg?.anonKey||!window.supabase) return;
  const db=window.supabase.createClient(cfg.url,cfg.anonKey);
  const scriptEl=[...document.scripts].find(s=>/js\/global-events\.js(?:[?#]|$)/.test(s.src));
  const siteBase=scriptEl ? new URL('./', new URL(scriptEl.src, document.baseURI)).href.replace(/js\/$/,'') : new URL('./', document.baseURI).href;
  const root=document.createElement('div');
  root.id='icebreaker-live-layer';
  root.innerHTML=`<style>
#icebreaker-live-layer{position:fixed;inset:0;z-index:2147483647;pointer-events:none;font-family:Arial,sans-serif}
.ib-toast{position:fixed;top:22px;left:50%;transform:translateX(-50%) translateY(-20px);opacity:0;transition:.25s;min-width:280px;max-width:min(90vw,720px);padding:18px 24px;border:1px solid rgba(255,255,255,.18);border-radius:16px;background:rgba(10,10,12,.94);box-shadow:0 18px 60px rgba(0,0,0,.45);color:white;text-align:center}
.ib-toast.show{transform:translateX(-50%) translateY(0);opacity:1}.ib-toast strong{display:block;font-size:12px;letter-spacing:.18em;opacity:.65;margin-bottom:7px}.ib-toast .msg{font-size:22px;font-weight:800;white-space:pre-wrap}.ib-full{position:fixed;inset:0;background:rgba(0,0,0,.93);display:flex;align-items:center;justify-content:center;pointer-events:none;opacity:0;transition:.15s}.ib-full.show{opacity:1}.ib-full .inner{max-width:90vw;text-align:center;color:white}.ib-full .tag{font-size:13px;letter-spacing:.25em;opacity:.55}.ib-full .msg{font-size:clamp(34px,8vw,100px);font-weight:900;margin:20px 0;white-space:pre-wrap}.ib-shake{animation:ibshake .45s linear}@keyframes ibshake{0%,100%{transform:translate(0)}20%{transform:translate(-10px,5px)}40%{transform:translate(9px,-6px)}60%{transform:translate(-7px,-4px)}80%{transform:translate(8px,6px)}}
#ib-enable{position:fixed;bottom:18px;right:18px;pointer-events:auto;border:1px solid rgba(255,255,255,.18);background:rgba(10,10,12,.9);color:#fff;border-radius:999px;padding:9px 13px;font-size:12px;cursor:pointer;display:none}
</style><div id="ib-toast" class="ib-toast"><strong>ICEBREAKER ADMIN</strong><div class="msg"></div></div><div id="ib-full" class="ib-full"><div class="inner"><div class="tag">ICEBREAKER ADMIN</div><div class="msg"></div></div></div><button id="ib-enable">🔊 Enable sounds</button>`;
document.documentElement.appendChild(root);
  const toast=root.querySelector('#ib-toast'), full=root.querySelector('#ib-full'), enable=root.querySelector('#ib-enable');
  let audioEnabled=false;
  function unlock(){audioEnabled=true; enable.style.display='none'; try{const a=new Audio();a.src='data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YQAAAAAA'; a.volume=0; a.play().catch(()=>{});}catch(e){}}
  ['pointerdown','keydown','touchstart'].forEach(e=>document.addEventListener(e,unlock,{once:true,capture:true}));
  function showAnnouncement(p){
    const mode=p.mode||'banner', msg=String(p.message||''); const ms=Math.max(1000,Math.min(Number(p.duration_ms)||5000,30000));
    if(mode==='fullscreen'){
      full.querySelector('.msg').textContent=msg; full.classList.add('show'); setTimeout(()=>full.classList.remove('show'),ms);
    }else{
      toast.querySelector('.msg').textContent=msg; toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'),ms);
    }
    if(p.shake){document.body.classList.add('ib-shake');setTimeout(()=>document.body.classList.remove('ib-shake'),600);}
  }
  function playSound(p){
    if(!audioEnabled){enable.style.display='block';return;}
    const src=new URL((p.sound_url||'').replace(/^\//,''),siteBase).href;
    const a=new Audio(src); a.volume=Math.max(0,Math.min(1,Number(p.volume)||1)); a.play().catch(()=>{enable.style.display='block';});
  }
  db.channel('icebreaker-live')
    .on('postgres_changes',{event:'INSERT',schema:'public',table:'icebreaker_announcements'},payload=>showAnnouncement(payload.new))
    .on('postgres_changes',{event:'INSERT',schema:'public',table:'icebreaker_sound_events'},payload=>playSound(payload.new))
    .subscribe();
})();
