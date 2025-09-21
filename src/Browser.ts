import puppeteer, { Browser, Cookie, ElementHandle, Page } from 'puppeteer-core';
import { locateChrome } from 'locate-app';

import delay from './utils/delay';

class Yandex {
    private page: Page;
    private browser: Browser;
    async init() {
        const pathToChrome = await locateChrome();
        const browser = await puppeteer.launch({
            headless: false,
            ignoreDefaultArgs: ["--enable-automation"],
            defaultViewport: null,
            args: [
                "--disable-blink-features=AutomationControlled",
                '--start-maximized',
                '--useAutomationExtension=false',
                '--no-sandbox'
            ],
            executablePath: pathToChrome
        });
        const page = (await browser.pages())[0];
        await delay(5_000);
        await page.evaluate(`Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
Object.defineProperty(navigator, 'vendor', { get: () => 'Google Inc.' });
window.chrome = { runtime: {} };
Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });`);
        await page.goto('https://market.yandex.ru', {
            timeout: 0,
            waitUntil: 'domcontentloaded'
        });
        await delay(10_000);
        this.browser = browser;
        this.page = page;
    }
    async processLink(link: string): Promise<{
        err: boolean;
        data: {
            price: number;
            shop: string;
        };
    }> {
        if(!link.endsWith('?how=aprice')) {
            link = link + '?how=aprice';
        }
        this.page.goto(link, {
            waitUntil: 'domcontentloaded',
            timeout: 0
        });
        const loaded = await this.page.waitForSelector('[data-auto="snippet-price-current"]', {
            visible: true,
            timeout: 30_000
        }).then(() => true).catch(err => {
            console.log(err);
            return false;
        });
        const errorResponse = {
            err: true,
            data: {
                price: 0,
                shop: ''
            }
        };
        if(!loaded) {
            return errorResponse;
        }
        const offerLinkContainer: ElementHandle<HTMLAnchorElement> | null = await this.page.waitForSelector('a[data-auto="galleryLink"]', {
            visible: true,
            timeout: 10_000
        }).catch(() => null);
        if(!offerLinkContainer) {
            return errorResponse;
        }
        const offerLink = offerLinkContainer.evaluate(el => el.href);
        if(!offerLink) {
            return errorResponse;
        }
    }
}

const yandex = new Yandex();

export default yandex;