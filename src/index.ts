import { InputFile } from "grammy";
import { randomUUID } from "crypto";

import bot from "./bot";
import config from "./config";

import yandex from "./lib/yandex";
import threads from "./lib/threads";
import delay from "./lib/utils/delay";

let processingLink = false;

bot.on('message', async ctx => {
    const user = String(ctx.from.id);
    if (!config.allowedUsers.includes(user)) return;
    const text = ctx.message.text;  
    if (text.startsWith('https://market.yandex.ru/')) {
        await ctx.react('👀');
        while(processingLink) {
            await delay(3_000);
        }
        processingLink = true;
        const { err, data } = await yandex.processLink(text);
        if(err) {
            await yandex.start();
            processingLink = false;
            return await ctx.reply('Ошибка парсинга, попробуйте еще раз');
        }
        processingLink = false;
        return await bot.api.sendDocument(
            ctx.chat.id,
            new InputFile(Buffer.from(`Цена: ${data.price}\nПродавец: ${data.shop}`), `${randomUUID()}.txt`)
        );
    }
});

(async () => {
    await yandex.start();
    if(config.links.length > 0) {
        await threads.init();
        threads.start();
    }
    bot.start();
})();