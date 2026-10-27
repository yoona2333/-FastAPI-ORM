import time
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, channel='msedge')
    page = browser.new_page()

    logs = []
    page.on('console', lambda m: logs.append(f"[console.{m.type}] {m.text}"))
    page.on('pageerror', lambda e: logs.append(f"[pageerror] {e}"))

    page.goto('http://localhost:5173/home')
    page.wait_for_load_state('networkidle')
    time.sleep(2)
    print("url:", page.url)
    print("body text head:", page.locator('body').inner_text()[:200])
    print("=== logs ===")
    for l in logs:
        print(l)
    page.screenshot(path='home_page.png', full_page=True)
    browser.close()
