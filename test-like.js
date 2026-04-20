const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch({ headless: true });
    const ctx = await browser.newContext({
        viewport: { width: 390, height: 844 },
        isMobile: true, hasTouch: true
    });
    const page = await ctx.newPage();
    // Go to homepage
    await page.goto('https://www.rightspoon.co.kr', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Get first article link
    const firstArticleUrl = await page.evaluate(() => {
        const a = document.querySelector('a[href^="/article/"]');
        return a ? a.href : null;
    });

    if (firstArticleUrl) {
        console.log('Navigating to', firstArticleUrl);
        await page.goto(firstArticleUrl, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(3000);

        await page.evaluate(() => {
            const buttons = document.querySelectorAll('button');
            for (const b of buttons) {
                if (b.textContent && (b.textContent.includes('🤍') || b.textContent.includes('❤️'))) {
                    b.scrollIntoView({ block: 'center', inline: 'center' });
                    break;
                }
            }
        });
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\e7235e77-8e50-4bad-9669-f157d570c178\\like_button_result.png' });
        console.log('Screenshot saved');
    } else {
        console.log('No article found');
    }

    await browser.close();
})();
