const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const baseUrl = process.env.CAPTURE_BASE_URL || 'https://ankitparekh007.github.io/ngx-copilot-platform/';
const outputDir = process.env.CAPTURE_OUTPUT_DIR || path.join(process.cwd(), 'public-proof-captures');
fs.mkdirSync(outputDir, { recursive: true });

const manifest = [];

function url(relative) {
  return new URL(relative, baseUrl).toString();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light', reducedMotion: 'reduce' });
  const page = await context.newPage();

  async function open(target) {
    const response = await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(1200);
    return response;
  }

  async function capture(name, target) {
    const response = await open(target);
    const file = path.join(outputDir, `${name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    manifest.push({ name, file: path.basename(file), url: page.url(), status: response ? response.status() : null });
  }

  async function failureScenario(name, matcher) {
    const response = await open(url('failure-lab'));
    const control = page.getByRole('button', { name: matcher }).first();
    if (!(await control.count())) {
      manifest.push({ name, skipped: true, reason: `No button matched ${matcher}` });
      return;
    }
    await control.click();
    await page.waitForTimeout(900);
    const file = path.join(outputDir, `${name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    manifest.push({ name, file: path.basename(file), url: page.url(), status: response ? response.status() : null });
  }

  await capture('platform-main-demo', baseUrl);
  await capture('platform-failure-lab-default', url('failure-lab'));
  await failureScenario('failure-sse-disconnect', /(sse disconnect|disconnect)/i);
  await failureScenario('failure-retrieval-unavailable', /(retrieval unavailable|retrieval)/i);
  await failureScenario('failure-approval-rejected', /(approval rejected|reject.*approval)/i);
  await failureScenario('failure-tool-policy-disabled', /(policy|tool disabled)/i);

  fs.writeFileSync(path.join(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
