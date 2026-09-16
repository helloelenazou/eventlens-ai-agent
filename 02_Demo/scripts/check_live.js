const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');

function loadEnv(file=path.join(root,'.env')){
  if(!fs.existsSync(file)) return false;
  const text=fs.readFileSync(file,'utf8');
  for(const raw of text.split(/\r?\n/)){
    const line=raw.trim(); if(!line||line.startsWith('#')) continue;
    const i=line.indexOf('='); if(i<1) continue;
    const k=line.slice(0,i).trim(); let v=line.slice(i+1).trim();
    if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'")))v=v.slice(1,-1);
    if(!(k in process.env)) process.env[k]=v;
  }
  return true;
}
function bool(v,def=true){if(v==null||v==='')return def;return !/^(0|false|no)$/i.test(String(v));}
function hasRealKey(k){return !!k&&!/replace_with|your[_ -]?key|placeholder|example/i.test(k);}
function extract(data){
  let text=''; const citations=[];
  for(const item of (data.output||[])) if(item.type==='message') for(const part of (item.content||[])) if(part.type==='output_text'){
    text+=(text?'\n':'')+(part.text||'');
    for(const a of (part.annotations||[])) if(a.type==='url_citation'&&a.url) citations.push({url:a.url,title:a.title||a.url});
  }
  return {text,citations};
}
async function post(base,key,payload){
  const r=await fetch(base+'/responses',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(payload)});
  const raw=await r.text(); let data={}; try{data=JSON.parse(raw)}catch{}
  if(!r.ok) throw new Error(data?.error?.message||`HTTP ${r.status}`);
  return data;
}
(async()=>{
  try{
    const major=Number(process.versions.node.split('.')[0]);
    if(!Number.isFinite(major)||major<18) throw new Error(`Node.js 18+ required; current=${process.versions.node}`);
    const envExists=loadEnv();
    if(!envExists && !process.env.OPENAI_API_KEY) throw new Error('02_Demo/.env is missing. Copy .env.example to .env and add your own API key.');
    const key=process.env.OPENAI_API_KEY||'';
    const model=process.env.OPENAI_MODEL||'';
    const fast=process.env.OPENAI_FAST_MODEL||model;
    const base=(process.env.OPENAI_API_BASE||'https://api.openai.com/v1').replace(/\/$/,'');
    const mock=/^(1|true|yes)$/i.test(process.env.MOCK_MODE||'false');
    const web=bool(process.env.ENABLE_WEB_SEARCH,true);
    if(mock) throw new Error('MOCK_MODE=true. Set it to false before a live LLM demo.');
    if(!hasRealKey(key)) throw new Error('OPENAI_API_KEY is empty or still a placeholder.');
    if(!model) throw new Error('OPENAI_MODEL is missing.');
    if(!fast) throw new Error('OPENAI_FAST_MODEL is missing.');
    if(!web) throw new Error('ENABLE_WEB_SEARCH=false. The current reviewer path expects Web Search to be enabled.');

    console.log(`CHECK 1/4 Node ${process.versions.node} + environment: PASS`);
    console.log(`CHECK 2/4 Main model access: ${model}`);
    const main=await post(base,key,{model,input:'Reply exactly: EVENTLENS_PREFLIGHT_OK',max_output_tokens:64,store:false});
    const mainOut=extract(main); if(!mainOut.text) throw new Error('Main model returned empty output.');
    console.log('  PASS');

    console.log(`CHECK 3/4 Fast model + Web Search access: ${fast}`);
    const webResp=await post(base,key,{model:fast,input:'Search the web for the official OpenAI homepage. Answer in one short sentence and cite the source.',tools:[{type:'web_search',search_context_size:'low'}],tool_choice:'required',max_output_tokens:256,store:false});
    const webOut=extract(webResp); if(!webOut.text) throw new Error('Web Search returned empty text.');
    if(!webOut.citations.length) throw new Error('No url_citation could be parsed. Check model/tool permissions or the API response format.');
    console.log(`  PASS · url_citation=${webOut.citations.length}`);
    console.log('CHECK 4/4 Secret-output protection: PASS (this script never prints the API key)');
    console.log('PASS: live preflight ready. EventLens can now be started in real LLM mode.');
    console.log('Note: live preflight may consume a small amount of API/Web Search usage.');
  }catch(e){
    console.error('FAIL: live preflight:',e.message||e);
    process.exitCode=1;
  }
})();
