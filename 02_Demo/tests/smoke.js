const {spawn}=require('child_process');
const path=require('path');
const root=path.resolve(__dirname,'..');
const p=spawn(process.execPath,['server.js'],{cwd:root,env:{...process.env,PORT:'8791',MOCK_MODE:'true',OPENAI_API_KEY:''},stdio:['ignore','pipe','pipe']});
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
async function analyze(language,event,portfolio){
  const r=await fetch('http://localhost:8791/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event,portfolio,language})});
  const text=await r.text(); const lines=text.trim().split(/\n+/).map(x=>JSON.parse(x));
  const starts=lines.filter(x=>x.type==='stage_start'), dones=lines.filter(x=>x.type==='stage_done'), report=lines.find(x=>x.type==='report');
  if(starts.length!==9||dones.length!==9||!report||!report.report?.executive_judgement)throw new Error(`bad ${language} stream ${starts.length}/${dones.length}`);
  if(report.language!==language)throw new Error('report language mismatch '+language);
  return {report,starts};
}
(async()=>{try{
  await sleep(500);
  const h=await fetch('http://localhost:8791/api/health').then(r=>r.json());
  if(!h.ok||!h.configured||!h.mock||!Array.isArray(h.languages)||h.languages.join(',')!=='zh,en')throw new Error('health failed');
  const zhHome=await fetch('http://localhost:8791/').then(r=>r.text());
  const enHome=await fetch('http://localhost:8791/index-en.html').then(r=>r.text());
  if(!zhHome.includes('开始研判')||!zhHome.includes('English'))throw new Error('Chinese frontend failed');
  if(!enHome.includes('Start Analysis')||!enHome.includes('中文'))throw new Error('English frontend failed');
  const zh=await analyze('zh','宁德时代2025H1营收同比下降12%，海外收入占比从18%提升至32%。','宁德时代 3.2%');
  if(!/确认事件与主体/.test(zh.starts[0].title))throw new Error('Chinese stage title failed');
  const en=await analyze('en','CATL 2025H1 revenue fell 12% YoY while overseas revenue share rose from 18% to 32%.','CATL 3.2%');
  if(!/Confirm event and entity/.test(en.starts[0].title))throw new Error('English stage title failed');
  for(const [language,base,question] of [['zh',zh,'为什么海外占比提升不能直接视为盈利改善？'],['en',en,'Why can higher overseas share not be treated as automatic earnings improvement?']]){
    const f=await fetch('http://localhost:8791/api/followup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event:'CATL 2025H1',portfolio:'CATL 3.2%',report:base.report.report,question,mode:'deep',history:[],language})});
    const j=await f.json(); if(!f.ok||!j.answer||j.language!==language)throw new Error('followup '+language+' failed');
  }
  console.log('PASS: Chinese + English 9-stage analysis and follow-up through one bilingual backend');
}catch(e){console.error('FAIL:',e);process.exitCode=1}finally{p.kill('SIGTERM')}})();
