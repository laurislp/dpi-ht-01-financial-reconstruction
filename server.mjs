import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildSubmission,validateState} from './model.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const port=Number(process.env.PORT||4188);
const statePath=path.join(root,'data','state.json');
const readState=()=>JSON.parse(fs.readFileSync(statePath,'utf8'));
const syncSnapshot=state=>{const target=path.join(root,'submission.json');fs.writeFileSync(target+'.tmp',JSON.stringify(buildSubmission(state),null,2));fs.renameSync(target+'.tmp',target);};
syncSnapshot(readState());
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.pdf':'application/pdf','.csv':'text/csv; charset=utf-8','.xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','.png':'image/png','.md':'text/plain; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
 try {
  const url=new URL(req.url,`http://127.0.0.1:${port}`);
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(!['127.0.0.1','localhost','[::1]'].includes(url.hostname)){res.writeHead(403);return res.end('Local access only');}
  const json=(value,status=200)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(value,null,2));};
  if(req.method==='GET'&&url.pathname==='/api/state')return json(readState());
  if(req.method==='GET'&&url.pathname==='/submission.json')return json(buildSubmission(readState()));
  if(req.method==='POST'&&url.pathname==='/api/state'){
   const origin=req.headers.origin;
   if(origin&&!['http://127.0.0.1:'+port,'http://localhost:'+port].includes(origin))return json({error:'Only local changes are accepted'},403);
   let body='';for await(const chunk of req){body+=chunk;if(body.length>3_000_000)return json({error:'File is too large'},413);}
   const state=JSON.parse(body);validateState(state);
   const current=readState();
   if(state.revision!==current.revision)return json({error:'Another tab saved newer edits. Reload before saving.'},409);
   state.revision++;state.updatedAt=new Date().toISOString();
   const backup=path.join(root,'data','backups');fs.mkdirSync(backup,{recursive:true});
   fs.copyFileSync(statePath,path.join(backup,`${Date.now()}-r${current.revision}.json`));
   fs.writeFileSync(statePath+'.tmp',JSON.stringify(state,null,2));fs.renameSync(statePath+'.tmp',statePath);
   syncSnapshot(state);
   return json(state);
  }
  if(req.method!=='GET')return json({error:'Method not allowed'},405);
  let route=decodeURIComponent(url.pathname);
  if(['/', '/review','/statements','/schedules','/decisions','/evidence','/board','/assumptions'].includes(route))route='/index.html';
  const allowed=route.startsWith('/sources/')||['/index.html','/app.js','/style.css','/model.mjs','/data/evidence.json','/data/analysis-a.json','/data/analysis-b.json','/data/submission-schema.json'].includes(route);
  if(!allowed)return json({error:'Not found'},404);
  const target=path.resolve(root,'.'+route);
  if(!target.startsWith(root+path.sep)||!fs.existsSync(target))return json({error:'Not found'},404);
  res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream'});fs.createReadStream(target).pipe(res);
 }catch(error){res.writeHead(400,{'Content-Type':'application/json'});res.end(JSON.stringify({error:error.message}));}
});
server.listen(port,'127.0.0.1',()=>console.log(`DPI financial review running locally: http://127.0.0.1:${port}`));
