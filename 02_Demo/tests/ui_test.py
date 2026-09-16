from pathlib import Path
try:
    from playwright.sync_api import sync_playwright
except Exception:
    print('SKIP: playwright not installed; optional UI test skipped.')
    raise SystemExit(0)
root=Path(__file__).resolve().parents[1]
qa=root/'qa'/'runtime'; qa.mkdir(parents=True,exist_ok=True)
zh=(root/'public'/'index.html').read_text(encoding='utf-8')
en=(root/'public'/'index-en.html').read_text(encoding='utf-8')
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])

    # Chinese surface + clickable toggle.
    page=browser.new_page(viewport={'width':1440,'height':1000})
    zh_errors=[]; page.on('pageerror', lambda e: zh_errors.append(str(e)))
    page.set_content(zh,wait_until='load'); page.wait_for_timeout(450)
    assert '开始研判' in page.locator('#run').inner_text()
    assert page.locator('#langZh').get_attribute('aria-pressed')=='true'
    assert '宁德时代' in page.locator('#event').input_value()
    assert page.evaluate("languageTarget('en')").endswith('index-en.html')
    page.evaluate("window.__languageClick=''; window.switchLanguage=(t)=>{window.__languageClick=t;}")
    page.locator('#langEn').click(); assert page.evaluate('window.__languageClick')=='en'
    page.screenshot(path=str(qa/'01_zh_input.png'),full_page=True)
    assert not zh_errors, zh_errors
    page.close()

    # English surface + complete offline flow + follow-up.
    page=browser.new_page(viewport={'width':1440,'height':1000})
    en_errors=[]; page.on('pageerror', lambda e: en_errors.append(str(e)))
    page.set_content(en,wait_until='load'); page.wait_for_timeout(450)
    assert 'Start Analysis' in page.locator('#run').inner_text()
    assert page.locator('#langEn').get_attribute('aria-pressed')=='true'
    assert 'CATL' in page.locator('#event').input_value()
    assert page.evaluate("languageTarget('zh')").endswith('index.html')
    page.screenshot(path=str(qa/'02_en_input.png'),full_page=True)
    page.locator('#run').click(); page.wait_for_selector('#reportView:not(.hidden)',timeout=12000)
    assert page.locator('#count').inner_text()=='9/9'
    assert page.locator('#researchLoop').is_visible()
    page.screenshot(path=str(qa/'03_en_report.png'),full_page=True)
    page.locator('[data-q="Why can a higher overseas revenue share not be treated as automatic earnings improvement?"]').click(); page.wait_for_timeout(650)
    assert page.locator('#researchThread .research-item').count()>=2
    page.evaluate("window.__languageClick=''; window.switchLanguage=(t)=>{window.__languageClick=t;}")
    page.locator('#langZh').click(); assert page.evaluate('window.__languageClick')=='zh'
    assert not en_errors, en_errors
    print('PASS: Chinese + English surfaces, clickable language toggle, English complete scenario + follow-up; JS errors=0')
    browser.close()
