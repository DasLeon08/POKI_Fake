import os
from playwright.sync_api import sync_playwright

def verify_simulation_games():
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

            index_path = f"{verification_dir}/simulation_games_index.png"
            page.screenshot(path=index_path, full_page=True)
            print(f"Saved index screenshot to {index_path}")

            print("Navigating to Euro Truck 2D...")
            page.goto(f"file://{os.getcwd()}/games/euro-truck.html")
            page.wait_for_timeout(1000)

            truck_path = f"{verification_dir}/euro_truck.png"
            page.screenshot(path=truck_path, full_page=True)
            print(f"Saved Euro Truck 2D screenshot to {truck_path}")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
            print("Done.")

if __name__ == "__main__":
    verify_simulation_games()