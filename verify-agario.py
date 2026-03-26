import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1280, "height": 720})
        await page.goto('http://localhost:8000/games/agario-clone.html')
        await page.wait_for_timeout(2000) # Wait for game to initialize and bots to spawn
        await page.screenshot(path='/home/jules/verification/agario.png')
        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
