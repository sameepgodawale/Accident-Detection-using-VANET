// app.js - frontend logic: map, markers, reverse geocode, theme, WS
const state = { incidents: [], devices: [] };
function apiFetch(path, opts){ opts = opts || {}; opts.headers = opts.headers || {}; const t = localStorage.getItem('vanet_token'); if(t) opts.headers['Authorization'] = 'Bearer '+t; if(opts.body && typeof opts.body !== 'string') opts.body = JSON.stringify(opts.body); if(opts.body) opts.headers['Content-Type']='application/json'; return fetch(path, opts); }

// Theme
function applyTheme(t){ document.documentElement.setAttribute('data-theme', t); localStorage.setItem('vanet_theme', t); }
function toggleTheme(){ const cur = localStorage.getItem('vanet_theme') || 'light'; applyTheme(cur==='light'?'dark':'light'); }
(function(){ applyTheme(localStorage.getItem('vanet_theme') || 'light'); })();

// Map init
const map = L.map('map').setView([19.0760,72.8777], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map);
let markers = {};

async function reverseGeocode(lat,lng){
  try{
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
    const r = await fetch(url, {headers:{'User-Agent':'Vanet-CMS-Demo/1.0'}});
    if(!r.ok) return null;
    const j = await r.json();
    return j.display_name || null;
  }catch(e){ return null; }
}

async function addIncidentMarker(inc){
  const key = inc.id || inc.incident_id || (inc.ts+Math.random());
  const color = inc.severity==='high'? '#d9534f': inc.severity==='medium'? '#f0ad4e':'#5cb85c';
  const marker = L.circleMarker([inc.lat, inc.lng], {radius:8, color}).addTo(map);
  const addr = await reverseGeocode(inc.lat, inc.lng);
  const popup = `<b>Incident ${inc.id || inc.incident_id}</b><br>Vehicle: ${inc.vehicle || ''}<br>Time: ${new Date(inc.ts).toLocaleString()}<br>Confidence: ${inc.confidence||''}%<br>Location: ${addr ? addr : (inc.lat+','+inc.lng)}`;
  marker.bindPopup(popup);
  markers[key]=marker;
}

function renderLive(){
  const feed = document.getElementById('liveFeed');
  if(!feed) return;
  feed.innerHTML = '';
  state.incidents.slice().reverse().slice(0,10).forEach(i=>{
    const d = document.createElement('div'); d.className='mb-2'; d.innerHTML = `<strong>Incident ${i.id||i.incident_id}</strong> — ${i.summary||''} <div class='text-muted small'>${new Date(i.ts).toLocaleString()}</div>`; feed.appendChild(d);
  });
}

async function fetchIncidents(){
  try{
    const r = await apiFetch('/api/incidents', {method:'GET'});
    if(r.ok){ const j = await r.json(); state.incidents = j; for(const inc of j){ addIncidentMarker(inc); } renderLive(); }
    else if(r.status===401){ window.location='/login.html'; }
  }catch(e){ console.error(e); }
}
fetchIncidents();

// WebSocket for live updates
let ws;
(function initWS(){
  try{
    const token = localStorage.getItem('vanet_token');
    const proto = (location.protocol==='https:') ? 'wss' : 'ws';
    const host = location.host;
    const wsUrl = `${proto}://${host}/ws${token?('?token='+encodeURIComponent(token)):''}`;
    ws = new WebSocket(wsUrl);
    ws.onmessage = (ev)=>{ try{ const msg = JSON.parse(ev.data); if(msg.type==='incident'){ state.incidents.push(msg.data); addIncidentMarker(msg.data); renderLive(); } }catch(e){console.error(e);} };
    ws.onclose = ()=>setTimeout(initWS,3000);
  }catch(e){ console.warn('ws failed',e); }
})();