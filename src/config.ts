import dotenv from "dotenv";
import { readFileSync } from "fs";

dotenv.config();

const botToken = process.env.BOT_TOKEN;

if(!botToken) {
    console.error('BOT_TOKEN is not specified!');
    process.exit(0);
}

const allowedUsersRaw = process.env.ALLOWED_USERS;

if(!allowedUsersRaw) {
    console.error('ALLOWED_USERS is not specified!');
    process.exit();
}

const allowedUsers = allowedUsersRaw.split(',').map(userId => userId.trim());

if(allowedUsers.some(userId => isNaN(+userId))) {
    console.error(`Incorrect allowed user`);
    process.exit();
}

const threadsCount = +(process.env.THREADS_COUNT || '1');

if(isNaN(threadsCount)) {
    console.error(`Incorrect THREADS_COUNT`);
    process.exit();
}

let links: string[] = [];

const parseLinks = process.env.PARSE_LINKS;

if(parseLinks && parseLinks === '1') {
    const fileName = process.env.LINKS_FILE_NAME;
    if(!fileName) {
        console.error('LINKS_FILE_NAME is not specified!');
        process.exit();
    }
    try {
        const data = readFileSync(process.cwd()+'/files/'+fileName).toString();
        links = data.split('\n');
    } catch {
        console.error('Links file read error');
        process.exit();
    }
}

const shopName: string = (process.env.SHOP_NAME || '').toLowerCase().trim();

const linkCheckDelay: number = +(process.env.LINK_CHECK_DELAY || '0');

if(parseLinks && parseLinks === '1') {
    if(!shopName) {
        console.error('SHOP_NAME is not specified!');
        process.exit();
    }
    if(isNaN(linkCheckDelay) || linkCheckDelay === 0) {
        console.error('LINK_CHECK_DELAY is not specified or incorrect!');
        process.exit(); 
    }
}

const proxies: string[]= [];

const proxyFileName = process.env.PROXY_FILE_NAME;

if(proxyFileName) {
    try {
        const data = readFileSync(process.cwd()+'/files/'+proxyFileName).toString();
        const proxiesRaw = data.split('\n');
        for(let i=0; i<proxiesRaw.length; i++) {
            const [ip, port, username, password] = proxiesRaw[i].replaceAll('\r', '').trim().split(':');
            if(!ip || !port || !username || !password) {
                continue;
            }
            const proxy = `${username}:${password}@${ip}:${port}`;
            if(proxies.includes(proxy)) continue;
            proxies.push(proxy);
        }
        proxies.sort(() => Math.random()- 0.5);
        console.log(`Added ${proxies.length} proxies`);
    } catch {
        console.error('Proxy file read error, skip');
    }
}

if(proxies.length !== 0 && threadsCount > proxies.length) {
    console.error('THREADS_COUNT must be less than proxies amount');
    process.exit();
}

const config = {
    botToken,
    allowedUsers,
    links,
    proxies,
    shopName,
    linkCheckDelay,
    threadsCount
};

export default config;