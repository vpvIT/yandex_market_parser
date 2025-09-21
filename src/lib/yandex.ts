import puppeteer, { Browser, ElementHandle, Page } from 'puppeteer-core';
import { locateChrome } from 'locate-app';

import delay from './utils/delay';

export class Yandex {
    private page: Page;
    private browser: Browser;
    async start() {
        if (this.browser) {
            await this.browser.close();
            //realese proxy here
        }
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
    async processLink(link: string, onlyName = false): Promise<{
        err: boolean;
        data: {
            price: number;
            shop: string;
        };
    }> {
        if (!link.endsWith('?how=aprice')) {
            link = link + '?how=aprice';
        }
        this.page.goto(link, {
            waitUntil: 'domcontentloaded',
            timeout: 0
        });
        const loaded = await this.page.waitForSelector('[data-auto="snippet-price-current"]', {
            visible: true,
            timeout: 10_000
        }).then(() => true).catch(() => {
            return false;
        });
        const errorResponse = {
            err: true,
            data: {
                price: 0,
                shop: ''
            }
        };
        if (!loaded) {
            return errorResponse;
        }
        const offerLinkContainer: ElementHandle<HTMLAnchorElement> | null = await this.page.waitForSelector('a[data-auto="galleryLink"]', {
            visible: true,
            timeout: 10_000
        }).catch(() => null);
        if (!offerLinkContainer) {
            return errorResponse;
        }
        const offerLink = await offerLinkContainer.evaluate(el => el.href);
        if (!offerLink) {
            return errorResponse;
        }
        this.page.goto(offerLink, {
            waitUntil: 'domcontentloaded',
            timeout: 0
        });
        const pricesContainer: ElementHandle | null = await this.page.waitForSelector('[data-baobab-name="price"]', {
            visible: true,
            timeout: 10_000
        }).catch(() => null);
        if (!pricesContainer) {
            return errorResponse;
        }
        let price: number = !onlyName ? 0 : 1;
        if (!price) {
            let elements: ElementHandle[] = [];
            let tries = 0;
            while (elements.length < 2 && tries < 5) {
                await delay(3_000);
                tries++;
                elements = await pricesContainer.$$('.ds-text.ds-text_weight_reg.ds-text_color_text-secondary.ds-text_typography_text.ds-text_text_tight.ds-text_text_reg');
            }
            for (let i = 0; i < elements.length; i++) {
                const value = +(await elements[i].evaluate(el => el.textContent)).replace(/\s/g, '');
                if (+value !== 0 && !isNaN(value)) {
                    price = value;
                    break;
                }
            }
        }
        if (!price) {
            const priceContainer: ElementHandle | null = await this.page.waitForSelector('.ds-text.ds-text_weight_bold.ds-text_color_text-primary.ds-text_typography_headline-3.ds-text_headline-3_tight.ds-text_headline-3_bold', {
                visible: true,
                timeout: 3_000
            }).catch(() => null);
            if (priceContainer) {
                const priceRaw = (await priceContainer.evaluate(el => el.textContent)).replace(/\s/g, '')
                if (!isNaN(+priceRaw)) {
                    price = +priceRaw;
                }
            }
        }
        if (!price) {
            const redPriceContainer: ElementHandle | null = await this.page.waitForSelector('.ds-text.ds-text_weight_bold.ds-text_color_price-sale.ds-text_typography_headline-3.ds-text_headline-3_tight.ds-text_headline-3_bold', {
                visible: true,
                timeout: 3_000
            }).catch(() => null);
            if (redPriceContainer) {
                const priceRaw = (await redPriceContainer.evaluate(el => el.textContent)).replace(/\s/g, '')
                if (!isNaN(+priceRaw)) {
                    price = +priceRaw;
                }
            }
        }
        const shopContainer: ElementHandle | null = await this.page.waitForSelector('.ds-text.ds-text_lineClamp_1.ds-text_weight_bold.ds-text_typography_text.ds-text_text_tight.ds-text_text_bold.ds-text_lineClamp', {
            visible: true,
            timeout: 10_000
        }).catch(() => null);
        if (!shopContainer) {
            return errorResponse;
        }
        const shop = await shopContainer.evaluate(el => el.textContent);
        return {
            err: false,
            data: {
                price,
                shop
            }
        };
    }
}

const yandex = new Yandex();

export default yandex;

