;
import bot from "./bot";
import config from "./config";

bot.on('message', async ctx => {
    const user = String(ctx.from.id);
    if(!config.allowedUsers.includes(user)) return;
    const text = ctx.message.text;
    if(text.startsWith('https://market.yandex.ru/')) {
        
    }
});