import config from "../config";
import delay from "./utils/delay";
import { Yandex } from "./yandex";

class Threads {
    private threads: {
        yandex: Yandex;
        errors: number;
    }[] = [];
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
        while(true) {
            const queu: Promise<void>[] = [];
            for(let i=0; i<tasks.length; i++) {
                queu.push((async (links: string[]) => {
                    for(let j=0; j<links.length; j++) {
                        if(this.threads[i].errors === 3) {
                            await this.threads[i].yandex.start(); 
                        }
                        const {err, data} = await this.threads[i].yandex.processLink(links[j], true);
                        if(!err) this.threads[i].errors = 0;
                        else this.threads[i].errors = this.threads[i].errors + 1;
                    }
                })(tasks[i]));
            }
            await Promise.all(queu);
            await delay(60_000);
        }
    }
}

const threads = new Threads();

export default threads;