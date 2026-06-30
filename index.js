const { Telegraf } = require("telegraf");
const { readFileSync } = require("fs");

const token = process.env.BOT_TOKEN;

const fetchData = require("./components/FetchData.js");

if (!token || !process.env.API_URL) {
    console.error("Bot token or API url must be set !");
    process.exit(1);
}

const bot = new Telegraf(token);
const messages = JSON.parse(readFileSync("./utils/messages.json", "utf8"));

bot.start(ctx => ctx.reply(messages.welcomeMessage));

bot.on("text", ctx => fetchData(process.env.API_URL, ctx, messages));

bot.action("restart", async ctx => {
    ctx.answerCbQuery();
    ctx.telegram.editMessageText(ctx.chat.id, requestErrorMessage.message_id, undefined, messages.restartMessage);
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));