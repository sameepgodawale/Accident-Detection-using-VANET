// server_postgres.js - Minimal VANET CMS backend with Postgres, JWT, users, incidents, CORS, WebSocket
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path:'/ws' });

const DATA_FILE = path.join(__dirname, 'data','db.json');
const SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const pool = new Pool({
  host: process.env.PGHOST || 'postgres',
  user: process.env.PGUSER || 'vanet',
  password: process.env.PGPASSWORD || 'vanetpass',
  database: process.env.PGDATABASE || 'vanetdb',
  port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432
});

if(!fs.existsSync(path.join(__dirname,'data'))) fs.mkdirSync(path.join(__dirname,'data'));
if(!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify({devices:[],incidents:[]},null,2));

app.use(bodyParser.json());
app.use(cors());
app.use('/', express.static(path.join(__dirname, 'public')));

function readDB(){ return JSON.parse(fs.readFileSync(DATA_FILE)); }
function writeDB(d){ fs.writeFileSync(DATA_FILE, JSON.stringify(d,null,2)); }

function authRequired(req, res, next){
  const h = req.headers.authorization || (req.query && req.query.token ? 'Bearer '+req.query.token : null);
  if(!h) return res.status(401).json({error:'missing token'});
  const parts = h.split(' ');
  if(parts.length!==2) return res.status(401).json({error:'bad auth header'});
  const token = parts[1];
  try{
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    next();
  }catch(e){ return res.status(401).json({error:'invalid token'}); }
}

function adminRequired(req,res,next){
  if(!req.user) return res.status(401).json({error:'not authenticated'});
  if(req.user.role !== 'admin') return res.status(403).json({error:'admin required'});
  next();
}

// Auth
app.post('/api/auth/register', async (req,res)=>{
  const {username,password,role='operator'} = req.body;
  if(!username || !password) return res.status(400).json({error:'username/password required'});
  const hashed = await bcrypt.hash(password,10);
  try{
    const r = await pool.query('INSERT INTO users(username,password_hash,role) VALUES($1,$2,$3) RETURNING id,username,role',[username,hashed,role]);
    res.json({user: r.rows[0]});
  }catch(e){ console.error(e); res.status(500).json({error:'db error'}); }
});

app.post('/api/auth/login', async (req,res)=>{
  const {username,password} = req.body;
  if(!username || !password) return res.status(400).json({error:'username/password required'});
  try{
    const r = await pool.query('SELECT id,username,password_hash,role FROM users WHERE username=$1',[username]);
    if(r.rowCount===0) return res.status(401).json({error:'invalid'});
    const user = r.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if(!ok) return res.status(401).json({error:'invalid'});
    const token = jwt.sign({id:user.id,username:user.username,role:user.role}, SECRET, {expiresIn:'8h'});
    res.json({token, user:{id:user.id,username:user.username,role:user.role}});
  }catch(e){ console.error(e); res.status(500).json({error:'db error'}); }
});

// user management
app.get('/api/users', authRequired, adminRequired, async (req,res)=>{
  try{ const r = await pool.query('SELECT id,username,role FROM users ORDER BY id'); res.json(r.rows);}catch(e){console.error(e);res.status(500).json({error:'db error'});}
});
app.post('/api/users', authRequired, adminRequired, async (req,res)=>{
  const {username,password,role='operator'} = req.body; if(!username||!password) return res.status(400).json({error:'username/password required'});
  const hashed = await bcrypt.hash(password,10);
  try{ const r = await pool.query('INSERT INTO users(username,password_hash,role) VALUES($1,$2,$3) RETURNING id,username,role',[username,hashed,role]); res.json({user:r.rows[0]}); }catch(e){console.error(e);res.status(500).json({error:'db error'});}
});
app.delete('/api/users/:id', authRequired, adminRequired, async (req,res)=>{ const id = parseInt(req.params.id); try{ await pool.query('DELETE FROM users WHERE id=$1',[id]); res.json({ok:true}); }catch(e){console.error(e);res.status(500).json({error:'db error'});} });

// incidents & devices
app.get('/api/incidents', authRequired, async (req,res)=>{
  try{ const r = await pool.query('SELECT incident_id AS id, lat, lng, severity, confidence, vehicle, rsu, ts, summary, status FROM incidents ORDER BY ts DESC LIMIT 500'); res.json(r.rows);}catch(e){ console.error(e); const db = readDB(); res.json(db.incidents); }
});
app.post('/api/incidents', authRequired, async (req,res)=>{
  const inc = req.body; inc.ts = inc.ts || Date.now();
  try{ await pool.query('INSERT INTO incidents(incident_id,lat,lng,severity,confidence,vehicle,rsu,ts,summary,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)', [inc.id||inc.incident_id, inc.lat, inc.lng, inc.severity, inc.confidence, inc.vehicle, inc.rsu, inc.ts, inc.summary, inc.status||'new']); const db = readDB(); db.incidents.push(inc); writeDB(db); broadcast({type:'incident', data:inc}); res.status(201).json({ok:true}); }catch(e){ console.error(e); const db = readDB(); db.incidents.push(inc); writeDB(db); broadcast({type:'incident', data:inc}); res.status(201).json({ok:true,fallback:true}); }
});

function broadcast(msg){ const s = JSON.stringify(msg); wss.clients.forEach(c=>{ if(c.readyState===WebSocket.OPEN) c.send(s); }); }

wss.on('connection',(ws, req)=>{ console.log('WS client connected'); ws.on('message',(m)=>{ try{ const msg = JSON.parse(m); if(msg.type==='ping') ws.send(JSON.stringify({type:'pong'})); }catch(e){} }); ws.on('close',()=>console.log('WS closed')); });

const PORT = process.env.PORT || 3000;
server.listen(PORT, ()=>console.log(`Server running on http://localhost:${PORT}`));
