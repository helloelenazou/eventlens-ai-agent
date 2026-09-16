const http=require('http');
const {spawn}=require('child_process');
const path=require('path');
const root=path.resolve(__dirname,'..');
const port=8796; const requests=[];
const stub=http.createServer((req,res)=>{let raw='';req.on('data',c=>raw+=c);req.on('end',()=>{let b={};try{b=JSON.parse(raw||'{}')}catch{};requests.push(b);const web=Array.isArray(b.tools)&&b.tools.some(t=>t.type==='web_search');const out={id:'resp_preflight',output:[{type:'message',content:[{type:'output_text',text:web?'OpenAI official homepage.':'EVENTLENS_PREFLIGHT_OK',annotations:web?[{type:'url_citation',url:'https://openai.com/',title:'OpenAI'}]:[]}]}]};res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify(out));});});
(async()=>{try{
  await new Promise(r=>stub.listen(port,'127.0.0.1',r));
  const env={...process.env,OPENAI_API_KEY:'test_key_not_secret',OPENAI_MODEL:'gpt-5.6-sol',OPENAI_FAST_MODEL:'gpt-5.6-luna',OPENAI_API_BASE:`http://127.0.0.1:${port}/v1`,ENABLE_WEB_SEARCH:'true',MOCK_MODE:'false'};
  const p=spawn(process.execPath,['scripts/check_live.js'],{cwd:root,env,stdio:['ignore','pipe','pipe']});let out='',err='';p.stdout.on('data',d=>out+=d);p.stderr.on('data',d=>err+=d);
  const code=await new Promise(r=>p.on('close',r));
  if(code!==0)throw new Error('preflight failed: '+err+out);
  if(requests.length!==2)throw new Error('expected 2 preflight requests');
  if(requests[0].model!=='gpt-5.6-sol')throw new Error('main model not checked');
  if(requests[1].model!=='gpt-5.6-luna')throw new Error('fast model not checked');
  if(!requests[1].tools?.some(t=>t.type==='web_search')||requests[1].tool_choice!=='required')throw new Error('web_search not required');
  if(/sk-[A-Za-z0-9_-]{20,}/.test(out+err))throw new Error('preflight printed secret-looking token');
  console.log('PASS: live preflight checks main model + fast model + required web_search + url_citation without printing key');
}catch(e){console.error('FAIL:',e.message);process.exitCode=1}finally{stub.close();}})();
