const http=require('http');
const {spawn}=require('child_process');
const path=require('path');
const root=path.resolve(__dirname,'..');
const stubPort=8793,eventPort=8794; const requests=[];
function responseText(prompt){
  if(prompt.includes('Synthesize all stages')) return JSON.stringify({title:'Stub Research Report',executive_judgement:'Contract test passed.',materiality:'P1',confidence:'test',sections:[{title:'Test',content:'ok',bullets:[]}],portfolio_action_conditions:[],follow_up:[],evidence_gaps:[],sources_used:[]});
  if(prompt.includes('综合全部阶段')) return JSON.stringify({title:'Stub 研判报告',executive_judgement:'契约测试通过。',materiality:'P1',confidence:'test',sections:[{title:'测试',content:'ok',bullets:[]}],portfolio_action_conditions:[],follow_up:[],evidence_gaps:[],sources_used:[]});
  if(prompt.includes('Perform materiality triage')||prompt.includes('做重大性分诊')) return JSON.stringify({materiality:'P1',why:['test'],analysis_scope:[],hard_risks:[]});
  if(prompt.includes('Extract only facts explicitly written')||prompt.includes('只抽取用户明确写出的事实')) return JSON.stringify({issuer:'Test Company',ticker:'000001.SZ',market:'A-share',event_type:'interim_report',period:'2025H1',facts:['test'],unknowns:[]});
  if(prompt.includes('Return strict JSON')||prompt.includes('严格输出JSON')) return JSON.stringify({ok:true});
  return 'stub response';
}
const stub=http.createServer((req,res)=>{let raw='';req.on('data',c=>raw+=c);req.on('end',()=>{let body={};try{body=JSON.parse(raw||'{}')}catch{}requests.push(body);const prompt=String(body.input||'');const usesWeb=Array.isArray(body.tools)&&body.tools.some(t=>t.type==='web_search');const annotations=usesWeb?[{type:'url_citation',start_index:0,end_index:4,url:'https://example.com/source',title:'Stub Source'}]:[];const out={id:'resp_stub_'+requests.length,output:[{type:'message',content:[{type:'output_text',text:responseText(prompt),annotations}]}],usage:{input_tokens:10,output_tokens:10,total_tokens:20}};res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify(out));});});
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
async function runLang(language,event){const r=await fetch(`http://127.0.0.1:${eventPort}/api/analyze`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event,portfolio:'Test Company 2%',language})});const lines=(await r.text()).trim().split(/\n+/).map(JSON.parse);if(lines.filter(x=>x.type==='stage_done').length!==9)throw new Error(language+' stage count != 9');const report=lines.find(x=>x.type==='report');if(!report?.report?.executive_judgement||report.language!==language)throw new Error(language+' report missing');return report;}
(async()=>{let p;try{
  await new Promise(r=>stub.listen(stubPort,'127.0.0.1',r));
  p=spawn(process.execPath,['server.js'],{cwd:root,env:{...process.env,PORT:String(eventPort),MOCK_MODE:'false',OPENAI_API_KEY:'test_key_not_secret',OPENAI_API_BASE:`http://127.0.0.1:${stubPort}/v1`,ENABLE_WEB_SEARCH:'true',OPENAI_MODEL:'gpt-5.6-sol',OPENAI_FAST_MODEL:'gpt-5.6-luna'},stdio:['ignore','pipe','pipe']});
  await sleep(450);
  const zh=await runLang('zh','测试公司2025H1营收下降12%');
  const en=await runLang('en','Test Company 2025H1 revenue fell 12%');
  const f=await fetch(`http://127.0.0.1:${eventPort}/api/followup`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event:'Test event',portfolio:'',report:en.report,question:'Search for counterevidence',mode:'search',history:[],language:'en'})});
  if(!f.ok) throw new Error('followup search failed');
  const webReqs=requests.filter(b=>Array.isArray(b.tools)&&b.tools.some(t=>t.type==='web_search'));
  if(webReqs.length<7) throw new Error('expected retrieval web_search calls across bilingual runs');
  if(webReqs.some(b=>b.tool_choice!=='required')) throw new Error('web_search is not forced on retrieval stages');
  const instructions=requests.map(x=>String(x.instructions||''));
  if(!instructions.some(x=>x.includes('输出中文'))||!instructions.some(x=>x.includes('professional English'))) throw new Error('both system languages were not used');
  console.log('PASS: bilingual real API code path + language-specific prompts + required web_search + citations');
}catch(e){console.error('FAIL:',e);process.exitCode=1}finally{if(p)p.kill('SIGTERM');stub.close();}})();
