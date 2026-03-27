import os
from playwright.sync_api import sync_playwright

def verify_more_sims():
    verification_dir = "/home/jules/verification"
    os.makedirs(verification_dir, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 800})

        try:
            print("Navigating to index.html...")
            # Use file:// to avoid needing a web server
            page.goto(f"file://{os.getcwd()}/index.html")
            page.wait_for_timeout(1000)

            print("Clicking 'Simulation' filter...")
            page.click('button[data-filter="simulation"]')
            page.wait_for_timeout(1000)

            index_path = f"{verification_dir}/all_simulation_games_index.png"
            page.screenshot(path=index_path, full_page=True)
            print(f"Saved index screenshot to {index_path}")

            print("Navigating to Space Docking Sim...")
            page.goto(f"file://{os.getcwd()}/games/space-docking.html")
            page.wait_for_timeout(1000)

            dock_path = f"{verification_dir}/space_docking.png"
            page.screenshot(path=dock_path, full_page=True)
            print(f"Saved Space Docking screenshot to {dock_path}")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
            print("Done.")

if __name__ == "__main__":
    verify_more_sims()