const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const required=[
  '打开Demo.html','Open_Demo.html','Open_Demo_EN.html','public/index.html','public/index-en.html','server.js','package.json','.env.example',
  'start-windows.bat','start-mac.command','data/demo_scenario.zh.json','data/demo_scenario.en.json',
  'data/portfolio_sample.zh.json','data/portfolio_sample.en.json','data/mock_stage_outputs.zh.json','data/mock_stage_outputs.en.json',
  'scripts/check_live.js','tests/smoke.js','tests/api_contract.js','tests/live_preflight_stub.js','tests/ui_test.py'
];
for(const rel of required){if(!fs.existsSync(path.join(root,rel))) throw new Error('missing required file: '+rel);}
for(const banned of ['.env','.env.local','.env.production','.env.development']) if(fs.existsSync(path.join(root,banned))) throw new Error('share package must not contain '+banned);
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
if(!server.includes("type:'web_search'")) throw new Error('server is not using current web_search tool');
if(server.includes('web_search_preview')) throw new Error('legacy web_search_preview still present');
if(!server.includes("languages:['zh','en']")) throw new Error('bilingual health contract missing');
if(!server.includes('SYSTEMS')||!server.includes('stagePromptZh')||!server.includes('stagePromptEn')) throw new Error('bilingual Agent prompts missing');
for(const [file,lang] of [['public/index.html','zh'],['public/index-en.html','en'],['Open_Demo.html','zh'],['Open_Demo_EN.html','en']]){
  const html=fs.readFileSync(path.join(root,file),'utf8');
  for(const id of ['run','inputView','runView','reportView','researchLoop','followSend','newEvent','demoReplayNotice','langZh','langEn']) if(!html.includes(`id="${id}"`)) throw new Error('missing UI control '+id+' in '+file);
  if(!html.includes(`const UI_LANG='${lang}'`)) throw new Error('wrong UI language in '+file);
  if(!html.includes('language:UI_LANG')) throw new Error('language not sent to backend in '+file);
  if(!html.includes('switchLanguage')) throw new Error('language toggle logic missing in '+file);
}
const secretPatterns=[/sk-[A-Za-z0-9_-]{20,}/g,/sk-ant-[A-Za-z0-9_-]{20,}/g,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,/OPENAI_API_KEY\s*=\s*(?!replace_with|your_|placeholder|$)[^\s#]{20,}/gi];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory()){if(e.name==='node_modules')continue;walk(p);}else if(!/\.(png|jpg|jpeg|webp|zip)$/i.test(e.name)){let t;try{t=fs.readFileSync(p,'utf8')}catch{continue}for(const re of secretPatterns){re.lastIndex=0;if(re.test(t))throw new Error('possible secret in '+path.relative(root,p));}}}}
walk(root);
for(const lang of ['zh','en']){
  const scenario=JSON.parse(fs.readFileSync(path.join(root,`data/demo_scenario.${lang}.json`),'utf8'));
  if(scenario.data_status!=='synthetic_for_demo') throw new Error('demo data must be explicitly labeled synthetic: '+lang);
  const portfolio=JSON.parse(fs.readFileSync(path.join(root,`data/portfolio_sample.${lang}.json`),'utf8'));
  if(!Array.isArray(portfolio.positions)||portfolio.positions.length<1) throw new Error('portfolio sample invalid: '+lang);
  const mock=JSON.parse(fs.readFileSync(path.join(root,`data/mock_stage_outputs.${lang}.json`),'utf8'));
  for(const k of ['parse','triage','recall','completeness','fundamental','valuation','portfolio','challenge','report','followup_deep','followup_search']) if(!(k in mock)) throw new Error('mock output missing '+k+': '+lang);
}
console.log('PASS: bilingual package completeness + language toggle + Agent language contract + no bundled secrets');
