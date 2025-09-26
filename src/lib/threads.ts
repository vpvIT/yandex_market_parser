import bot from "../bot";
import config from "../config";
import delay from "./utils/delay";
import { Yandex } from "./yandex";
import { InlineKeyboard } from "grammy";

class Threads {
    private threads: {
        yandex: Yandex;
        errors: number;
    }[] = [];
    private checkTimes: Record<string, number> = {};
    async init() {
        for (let i = 0; i < config.threadsCount; i++) {
            const yandex = new Yandex();
            await yandex.start();
            this.threads.push({
                yandex,
                errors: 0
            });
        }
    }
    async start() {
        const tasks: string[][] = [];
        const chunkSize = Math.ceil(config.links.length / config.threadsCount);
        for (let i = 0; i < config.links.length; i += chunkSize) {
            const chunk = config.links.slice(i, i + chunkSize);
            tasks.push(chunk);
        }
        while (true) {
            const queu: Promise<void>[] = [];
            for (let i = 0; i < tasks.length; i++) {
                queu.push((async (links: string[]) => {
                    for (let j = 0; j < links.length; j++) {
                        if (this.checkTimes[links[j]]) {
                            const checkTime = this.checkTimes[links[j]] + config.linkCheckDelay * 60;
                            if (checkTime > Math.floor(Date.now() / 1000)) {
                                await delay(1_000);
                                continue;
                            }
                        }
                        if (this.threads[i].errors === 3) {
                            await this.threads[i].yandex.start();
                        }
                        try {
                            const { err, data } = await this.threads[i].yandex.processLink(links[j], true);
                            if (!err) {
                                this.threads[i].errors = 0;
                                if (!config.shopNames.includes(data.shop.toLowerCase())) {
                                    this.checkTimes[links[j]] = Math.floor(Date.now() / 1000);
                                    const urlParts = links[j].split('/');
                                    let out = `Ваша цена не самая маленькая!\n`;
                                    out += `<b>Магазин:</b> ${data.shop}\n`;
                                    out += `<b>Товар: </b> ${urlParts[4]}`;
                                    if (config.groupId) {
                                        await bot.api.sendMessage(config.groupId, out, {
                                            reply_markup: new InlineKeyboard().url(`Товар`, links[j]),
                                            parse_mode: "HTML"
                                        }).catch(() => null);
                                    } else {
                                        for (let k = 0; k < config.allowedUsers.length; k++) {
                                            await bot.api.sendMessage(config.allowedUsers[k], out, {
                                                reply_markup: new InlineKeyboard().url(`Товар`, links[j]),
                                                parse_mode: "HTML"
                                            }).catch(() => null);
                                        }
                                    }
                                    await delay(10_000);
                                }
                            }
                            else this.threads[i].errors = this.threads[i].errors + 1;
                        } catch (err) {
                            console.log(err);
                            await this.threads[i].yandex.start();
                        }
                        await delay(10_000);
                    }
                })(tasks[i]));
            }
            await Promise.all(queu);
        }
    }
}

const threads = new Threads();

export default threads;