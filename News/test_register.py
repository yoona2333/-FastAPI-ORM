import time
import json
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, channel='msedge')
    page = browser.new_page()

    logs = []
    def on_console(m):
        logs.append(f"[console.{m.type}] {m.text}")
    def on_pageerror(e):
        logs.append(f"[pageerror] {e}")
    def on_request(r):
        if '8000' in r.url:
            logs.append(f"[request] {r.method} {r.url}")
    def on_response(r):
        if '8000' in r.url:
            logs.append(f"[response] {r.status} {r.url}")
    def on_nav(frame):
        logs.append(f"[navigated] {frame.url}")
    page.on('console', on_console)
    page.on('pageerror', on_pageerror)
    page.on('request', on_request)
    page.on('response', on_response)
    page.on('framenavigated', on_nav)

    page.goto('http://localhost:5173/register')
    page.wait_for_load_state('networkidle')

    page.locator('input[placeholder="请输入用户名"]').fill('browsertest_user4')
    page.locator('input[placeholder="请输入密码"]').fill('pass123456')
    page.locator('input[placeholder="请再次输入密码"]').fill('pass123456')

    logs.clear()
    page.locator('button:has-text("注册")').click()

    for i in range(20):
        time.sleep(0.25)
        toasts = page.locator('.van-toast').all_text_contents()
        ls_keys = page.evaluate("Object.keys(localStorage)")
        if i in (0, 3, 7, 11, 15, 19):
            print(f"t={0.25*(i+1):.2f}s href={page.url} toasts={[t.encode('unicode_escape').decode() for t in toasts]} ls={ls_keys}")

    print("=== logs ===")
    for l in logs:
        print(l)
    print("=== user-store content ===")
    raw = page.evaluate("localStorage.getItem('user-store')")
    print(raw)
    browser.close()
