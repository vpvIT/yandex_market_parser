import { anonymizeProxy, closeAnonymizedProxy } from "proxy-chain";
import proxyController from "./proxyController";


export class ProxyAgent {
    private proxyRaw: string;
    private proxy: string;
    async init(proxy: string) {
        this.proxyRaw = proxy;
        this.proxy = await anonymizeProxy(`http://${this.proxyRaw}`);;
    }
    getUrl() {
        return this.proxy;
    }
    async release() {
        await closeAnonymizedProxy(this.proxy, true);
        await proxyController.release(this.proxyRaw);
    }
}

export default ProxyAgent;
