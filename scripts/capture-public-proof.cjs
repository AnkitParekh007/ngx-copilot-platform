const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const baseUrl = process.env.CAPTURE_BASE_URL || 'https://ankitparekh007.github.io/ngx-copilot-platform/';
const outputDir = process.env.CAPTURE_OUTPUT_DIR || path.join(process.cwd(), 'public-proof-captures');
const viewport = { width: 1440, height: 900 };
fs.mkdirSync(outputDir, { recursive: true });

const manifest = [];
let browser;

function url(relative) {
  return new URL(relative, baseUrl).toString();
}

(async () => {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport, colorScheme: 'light', reducedMotion: 'reduce' });
  const page = await context.newPage();

  async function open(target, waitForFailureLab = false) {
    const response = await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 45000 });
    if (waitForFailureLab) {
      await page.getByRole('tab', { name: /^SSE disconnect/i }).waitFor({ state: 'visible', timeout: 30000 });
    } else {
      await page.locator('body').waitFor({ state: 'visible', timeout: 30000 });
      await page.waitForTimeout(500);
    }
    return response;
  }

  async function shot(name, response) {
    const file = path.join(outputDir, `${name}.png`);
    await page.screenshot({ path: file, fullPage: false });
    manifest.push({ name, file: path.basename(file), url: page.url(), status: response ? response.status() : null, viewport });
  }

  async function failureScenario(name, matcher, retry = false) {
    const response = await open(url('failure-lab'), true);
    const control = page.getByRole('tab', { name: matcher }).first();
    await control.waitFor({ state: 'visible', timeout: 10000 });
    await control.click();
    await page.waitForTimeout(300);
    if (retry) {
      const retryButton = page.getByRole('button', { name: /retry from request boundary/i }).first();
      await retryButton.waitFor({ state: 'visible', timeout: 10000 });
      await retryButton.click();
      await page.waitForTimeout(400);
    }
    await shot(name, response);
  }

  let response = await open(baseUrl);
  await shot('platform-main-demo', response);
  response = await open(url('failure-lab'), true);
  await shot('platform-failure-lab-default', response);
  await failureScenario('failure-retrieval-unavailable', /^Retrieval failure/i);
  await failureScenario('failure-approval-rejected', /^Approval rejected/i);
  await failureScenario('failure-sse-disconnect', /^SSE disconnect/i);
  await failureScenario('failure-sse-recovered', /^SSE disconnect/i, true);
  await failureScenario('failure-tool-policy-disabled', /^Tool disabled/i);

  fs.writeFileSync(path.join(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  if (browser) await browser.close();
});
