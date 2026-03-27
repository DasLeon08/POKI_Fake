const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
    // Ensure the output directory exists
    const verificationDir = path.join(__dirname, 'verification');
    if (!fs.existsSync(verificationDir)) {
        fs.mkdirSync(verificationDir);
    }

    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Set a good viewport size
    await page.setViewportSize({ width: 1280, height: 800 });

    try {
        console.log("Navigating to index.html...");
        await page.goto('http://127.0.0.1:8000/index.html');

        // Wait for page to settle
        await page.waitForTimeout(1000);

        // Click the 'Exotisch' filter button
        console.log("Clicking 'Exotisch' filter...");
        await page.click('button[data-filter="exotic"]');
        await page.waitForTimeout(1000); // Wait for filtering animation

        const indexPath = path.join(verificationDir, 'exotic_games_index.png');
        await page.screenshot({ path: indexPath, fullPage: true });
        console.log(`Saved index screenshot to ${indexPath}`);

        // Navigate to one of the exotic games (e.g., Space Sushi)
        console.log("Navigating to Space Sushi...");
        await page.goto('http://127.0.0.1:8000/games/space-sushi.html');
        await page.waitForTimeout(1000);

        const spaceSushiPath = path.join(verificationDir, 'space_sushi.png');
        await page.screenshot({ path: spaceSushiPath, fullPage: true });
        console.log(`Saved Space Sushi screenshot to ${spaceSushiPath}`);

    } catch (e) {
        console.error("Error during Playwright execution:", e);
    } finally {
        await browser.close();
        console.log("Playwright script finished.");
    }
})();