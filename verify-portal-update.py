from playwright.sync_api import sync_playwright

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1280, "height": 800})

        # Open index
        page.goto("http://localhost:8000/index.html")

        # Take screenshot of default
        page.screenshot(path="portal-all.png")

        # Click on Online PVP filter
        page.click("button[data-filter='online-pvp']")
        page.wait_for_timeout(500)

        # Take screenshot with filter applied
        page.screenshot(path="portal-filtered.png")

        browser.close()

if __name__ == "__main__":
    main()
