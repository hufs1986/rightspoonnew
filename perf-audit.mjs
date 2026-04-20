import { chromium } from 'playwright';

const BASE = 'https://www.rightspoon.co.kr';
const results = [];

async function measurePage(page, name, url) {
    try {
        const start = Date.now();
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        const elapsed = Date.now() - start;

        const perf = await page.evaluate(() => {
            const nav = performance.getEntriesByType('navigation')[0];
            const resources = performance.getEntriesByType('resource');
            const totalResSize = resources.reduce((s, r) => s + (r.transferSize || 0), 0);
            return {
                domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd - nav.startTime) : null,
                loadComplete: nav ? Math.round(nav.loadEventEnd - nav.startTime) : null,
                resourceCount: resources.length,
                totalTransferKB: Math.round(totalResSize / 1024),
                largestResources: resources
                    .sort((a, b) => (b.transferSize || 0) - (a.transferSize || 0))
                    .slice(0, 5)
                    .map(r => ({
                        name: r.name.length > 60 ? '...' + r.name.slice(-57) : r.name,
                        sizeKB: Math.round((r.transferSize || 0) / 1024),
                        type: r.initiatorType,
                        duration: Math.round(r.duration)
                    }))
            };
        });

        results.push({ name, url, elapsed, ...perf, status: 'OK' });
        console.log(`✅ ${name}: ${elapsed}ms (DOM: ${perf.domContentLoaded}ms, Load: ${perf.loadComplete}ms, Res: ${perf.resourceCount}, Transfer: ${perf.totalTransferKB}KB)`);
    } catch (err) {
        results.push({ name, url, elapsed: -1, status: 'ERROR', error: err.message.split('\n')[0] });
        console.log(`❌ ${name}: ERROR - ${err.message.split('\n')[0]}`);
    }
}

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
    });
    const page = await context.newPage();

    console.log('=== RightSpoon Performance Audit ===\n');

    // 1. Main pages
    await measurePage(page, '홈페이지', BASE);
    await measurePage(page, '정치 카테고리', `${BASE}/category/politics`);
    await measurePage(page, '경제 카테고리', `${BASE}/category/economy`);
    await measurePage(page, '역사 카테고리', `${BASE}/category/history`);
    await measurePage(page, '소개 페이지', `${BASE}/about`);

    // 2. Get article links from homepage
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
    const articleLinks = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href*="/article/"]'));
        return links.slice(0, 3).map(a => ({
            href: a.getAttribute('href'),
            text: a.textContent?.trim().substring(0, 30) || 'Article'
        }));
    });

    for (const art of articleLinks) {
        await measurePage(page, `기사: ${art.text}`, `${BASE}${art.href}`);
    }

    // 3. Static/utility pages
    await measurePage(page, '개인정보처리방침', `${BASE}/privacy`);
    await measurePage(page, '이용약관', `${BASE}/terms`);

    await browser.close();

    // === SUMMARY ===
    console.log('\n\n========================================');
    console.log('        PERFORMANCE SUMMARY');
    console.log('========================================\n');

    for (const r of results) {
        const bar = r.elapsed > 0 ? '█'.repeat(Math.min(Math.round(r.elapsed / 500), 20)) : '❌';
        const emoji = r.elapsed < 2000 ? '🟢' : r.elapsed < 4000 ? '🟡' : '🔴';
        console.log(`${emoji} ${r.name.padEnd(25)} ${String(r.elapsed + 'ms').padStart(8)} | DOM: ${String((r.domContentLoaded ?? '-') + 'ms').padStart(7)} | Res: ${String(r.resourceCount ?? '-').padStart(3)} | ${String((r.totalTransferKB ?? '-') + 'KB').padStart(7)} | ${bar}`);
    }

    // Slow pages details
    const slowPages = results.filter(r => r.elapsed > 3000 && r.status === 'OK');
    if (slowPages.length > 0) {
        console.log('\n\n⚠️  SLOW PAGES (>3s) - DETAILED ANALYSIS:');
        for (const sp of slowPages) {
            console.log(`\n  📛 ${sp.name} — Total: ${sp.elapsed}ms`);
            console.log(`     URL: ${sp.url}`);
            console.log(`     DOM Ready: ${sp.domContentLoaded}ms | Full Load: ${sp.loadComplete}ms`);
            console.log(`     Resources: ${sp.resourceCount} files, ${sp.totalTransferKB}KB transferred`);
            if (sp.largestResources) {
                console.log('     🏋️ Top heavy resources:');
                for (const r of sp.largestResources) {
                    console.log(`       ${String(r.sizeKB + 'KB').padStart(7)} | ${String(r.duration + 'ms').padStart(7)} | ${r.type.padEnd(8)} | ${r.name}`);
                }
            }
        }
    }

    // Overall heaviest resources
    console.log('\n\n========================================');
    console.log('   TOP 10 HEAVIEST RESOURCES (ALL PAGES)');
    console.log('========================================\n');
    const allRes = results
        .filter(r => r.largestResources)
        .flatMap(r => r.largestResources.map(res => ({ ...res, page: r.name })));
    allRes.sort((a, b) => b.sizeKB - a.sizeKB);
    for (const r of allRes.slice(0, 10)) {
        console.log(`  ${String(r.sizeKB + 'KB').padStart(7)} | ${r.type.padEnd(8)} | [${r.page}] ${r.name}`);
    }

    console.log('\n=== AUDIT COMPLETE ===');
})();
