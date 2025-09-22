import config from "../config";
import ProxyAgent from "./ProxyAgent";
import delay from "./utils/delay";

class ProxyController {
    private proxies: Record<string, boolean> = {};
    constructor() {
        for(let i=0; i<config.proxies.length; i++) this.proxies[config.proxies[i]] = true;
    }
    async get() {
        while(true) {
            const proxy = this.findFree();
            if(!proxy) {
                await delay(5_000);
                continue;
            }
            this.proxies[proxy] = false;
            const agent = new ProxyAgent();
            await agent.init(proxy);
            return agent;
         }
    }
    private findFree(): string | null{
        for(let key in this.proxies) {
            const status = this.proxies[key];
            if(status) {
                return key;
            }
        }
        return null;
    }
    async release(proxy: string) {
        this.proxies[proxy] = true;
    }
}

const proxyController = new ProxyController();

export default proxyController;