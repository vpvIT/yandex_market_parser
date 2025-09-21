import { Bot } from "grammy";
import config from "./config";

const bot = new Bot(config.botToken);

export default bot;