import { Telegraf } from "telegraf";
import { readFileSync } from "fs";
import { join } from "path";

import fetchData from "./components/FetchData.js";
import type { Message } from "./types/index.js";

const token = process.env.BOT_TOKEN;
const apiURL = process.env.API_URL;

if (!token || !apiURL) {
    console.error("Bot token or API url must be set !");
    process.exit(1);
}

const bot = new Telegraf(token);
const messagesPath = join(import.meta.dirname, "../messages/messages.json");
const messages: Message = JSON.parse(readFileSync(messagesPath, "utf8"));

bot.start(ctx => ctx.reply(messages.welcomeMessage));

bot.on("text", ctx => fetchData(apiURL, ctx, messages));

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));