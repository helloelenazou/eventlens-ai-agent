from pathlib import Path
import hashlib, re, sys
root=Path(__file__).resolve().parents[1]
required=[
 'README.md','01_Design_Docs/README.md',
 '01_Design_Docs/ZH/01_EventLens_产品设计文档.md','01_Design_Docs/ZH/02_生产化架构与验收边界.md','01_Design_Docs/ZH/03_上生产环境_AI_Agent实践关键问题.md',
 '01_Design_Docs/EN/01_EventLens_Product_Design.md','01_Design_Docs/EN/02_Production_Architecture_and_Acceptance_Boundaries.md','01_Design_Docs/EN/03_AI_Agent_Production_Readiness_Key_Issues.md',
 '02_Demo/打开Demo.html','02_Demo/Open_Demo.html','02_Demo/Open_Demo_EN.html','02_Demo/public/index.html','02_Demo/public/index-en.html',
 '02_Demo/server.js','02_Demo/package.json','02_Demo/.env.example','02_Demo/start-windows.bat','02_Demo/start-mac.command',
 '02_Demo/data/demo_scenario.zh.json','02_Demo/data/demo_scenario.en.json','02_Demo/data/portfolio_sample.zh.json','02_Demo/data/portfolio_sample.en.json','02_Demo/data/mock_stage_outputs.zh.json','02_Demo/data/mock_stage_outputs.en.json',
 '02_Demo/scripts/check_live.js','02_Demo/tests/package_check.js','02_Demo/tests/smoke.js','02_Demo/tests/api_contract.js','02_Demo/tests/live_preflight_stub.js','02_Demo/tests/ui_test.py',
 '03_README/README_启动说明_ZH.md','03_README/README_Launch_Instructions_EN.md','04_QA/Review_and_Revision_Log_v3.0_Bilingual.md','04_QA/TEST_REPORT.md','04_QA/MANIFEST.txt'
]
missing=[x for x in required if not (root/x).exists()]
if missing:
    print('FAIL missing:',missing);sys.exit(1)

banned_names={'.env','.env.local','.env.production','.env.development'}
bundled=[str(p.relative_to(root)) for p in root.rglob('*') if p.is_file() and p.name in banned_names]
if bundled:
    print('FAIL bundled environment file:',bundled);sys.exit(1)
patterns=[
    re.compile(r'sk-[A-Za-z0-9_-]{20,}'),
    re.compile(r'sk-ant-[A-Za-z0-9_-]{20,}'),
    re.compile(r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----'),
    re.compile(r'OPENAI_API_KEY\s*=\s*(?!replace_with|your_|placeholder|$)[^\s#]{20,}',re.I),
]
for p in root.rglob('*'):
    if not p.is_file() or p.suffix.lower() in {'.png','.jpg','.jpeg','.webp','.zip','.pyc'}: continue
    try:text=p.read_text(encoding='utf-8')
    except Exception:continue
    for pat in patterns:
        if pat.search(text):
            print('FAIL possible secret:',p.relative_to(root),'pattern=',pat.pattern);sys.exit(1)

# Bilingual contract checks.
zh=(root/'02_Demo/public/index.html').read_text(encoding='utf-8')
en=(root/'02_Demo/public/index-en.html').read_text(encoding='utf-8')
server=(root/'02_Demo/server.js').read_text(encoding='utf-8')
for token in ['id="langZh"','id="langEn"',"const UI_LANG='zh'",'language:UI_LANG']:
    if token not in zh: print('FAIL Chinese UI contract:',token);sys.exit(1)
for token in ['id="langZh"','id="langEn"',"const UI_LANG='en'",'language:UI_LANG']:
    if token not in en: print('FAIL English UI contract:',token);sys.exit(1)
for token in ['stagePromptZh','stagePromptEn','SYSTEMS',"languages:['zh','en']","type:'web_search'"]:
    if token not in server: print('FAIL backend bilingual contract:',token);sys.exit(1)
if 'web_search_preview' in server:
    print('FAIL legacy web_search_preview present');sys.exit(1)

sha_file=root/'04_QA/SHA256SUMS.txt'
if sha_file.exists():
    for line in sha_file.read_text(encoding='utf-8').splitlines():
        if not line.strip():continue
        digest,rel=line.split('  ',1);fp=root/rel
        if not fp.exists():print('FAIL checksum target missing:',rel);sys.exit(1)
        got=hashlib.sha256(fp.read_bytes()).hexdigest()
        if got!=digest:print('FAIL checksum mismatch:',rel);sys.exit(1)
print('PASS: complete bilingual delivery; generic secret scan clean; no bundled .env; bilingual UI/Agent contract valid; checksums valid')
