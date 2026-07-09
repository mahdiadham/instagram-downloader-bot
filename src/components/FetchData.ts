import type { Context } from "telegraf";
import type { ResultSetHeader } from "mysql2";
import type { Message } from "../types/index.js";
import db from "../configs/database.js";

const fetchData = async (url: string, ctx: Context, messages: Message, apiToken: string) => {
    if (!ctx.chat || !ctx.message || !("text" in ctx.message)) return;

    const chatID: number = ctx.chat.id;
    const messageID: number = ctx.message.message_id;
    const link: string | undefined = ctx.message.text;
    const firstName: string | undefined = "first_name" in ctx.chat ? ctx.chat.first_name : undefined;
    const username: string | undefined = "username" in ctx.chat ? ctx.chat.username : undefined;

    const shortCode: string | undefined = new URL(link).pathname.split("/")[2];
    const requestOptions: RequestInit = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "one-api-token": apiToken
        },
        redirect: "follow"
    };

    const processMessage = await ctx.reply(messages.processMessage);

    try {
        const response = await fetch(`${url}?shortcode=${shortCode}`, requestOptions);

        if (!response.ok) throw new Error(`Request Error : ${response.status} - ${response.statusText}`);

        const data = await response.json();
        const mediaURL: string = data.result.media[0].url || "";
        const insertUsersDataQuery: string = "INSERT INTO users_data (name, username, chat_id, message_id, link, media_url) VALUES (?, ?, ?, ?, ?, ?)";

        db.query(insertUsersDataQuery, [firstName, username, chatID, messageID, link, mediaURL], async (error: Error | null, result: ResultSetHeader) => {
            if (error) {
                console.error(`Database Error => ${error.stack}`);
                return;
            }
            await ctx.telegram.deleteMessage(chatID, processMessage.message_id);
            try {
                await ctx.replyWithVideo(mediaURL, { caption: data.result.caption || "" });
            }
            catch (error) {
                console.error(`Video send failed => ${error}`);
                await ctx.reply(messages.serverError);
            }
        });

    }
    catch (error) {
        const message = error instanceof Error ? error.stack : String(error);
        console.error(`Request Error => ${message}`);
        await ctx.telegram.editMessageText(chatID, processMessage.message_id, undefined, messages.requestError);
    }

}
export default fetchData;