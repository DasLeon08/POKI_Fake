import os
from playwright.sync_api import sync_playwright

def verify_exotic_games():
    verification_dir = "/home/jules/verification"
    os.makedirs(verification_dir, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 800})

        try:
            print("Navigating to index.html...")
            # We use file:// protocol because it's a static site
            page.goto(f"file://{os.getcwd()}/index.html")
            page.wait_for_timeout(1000)

            print("Clicking 'Exotisch' filter...")
            page.click('button[data-filter="exotic"]')
            page.wait_for_timeout(1000)

            index_path = f"{verification_dir}/exotic_games_index.png"
            page.screenshot(path=index_path, full_page=True)
            print(f"Saved index screenshot to {index_path}")

            print("Navigating to Space Sushi...")
            page.goto(f"file://{os.getcwd()}/games/space-sushi.html")
            page.wait_for_timeout(1000)

            sushi_path = f"{verification_dir}/space_sushi.png"
            page.screenshot(path=sushi_path, full_page=True)
            print(f"Saved Space Sushi screenshot to {sushi_path}")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
            print("Done.")

if __name__ == "__main__":
    verify_exotic_games()