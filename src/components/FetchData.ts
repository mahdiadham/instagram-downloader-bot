import type { Context } from "telegraf";
import type { ResultSetHeader } from "mysql2";
import type { Message } from "../types/index.js";
import db from "../configs/database.js";

const fetchData = async (url: string, ctx: Context, messages: Message) => {
    if (!ctx.chat || !ctx.message || !("text" in ctx.message)) return;

    const chatID: number = ctx.chat.id;
    const messageID: number = ctx.message.message_id;
    const link: string | undefined = ctx.message.text;
    const firstName: string | undefined = "first_name" in ctx.chat ? ctx.chat.first_name : undefined;
    const username: string | undefined = "username" in ctx.chat ? ctx.chat.username : undefined;

    const processMessage = await ctx.reply(messages.processMessage);

    try {
        const response = await fetch(`${url}?url=${link}`);

        if (!response.ok) throw new Error(`Request Error : ${response.status} - ${response.statusText}`);

        const data = await response.json();
        const mediaURL: string = data.videoUrl;
        const insertUsersDataQuery: string = "INSERT INTO users_data (name, username, chat_id, message_id, link, media_url) VALUES (?, ?, ?, ?, ?, ?)";

        db.query(insertUsersDataQuery, [firstName, username, chatID, messageID, link, mediaURL], async (error: Error | null, result: ResultSetHeader) => {
            if (error) {
                console.error(`Database Error => ${error.stack}`);
                return;
            }
            await ctx.telegram.deleteMessage(chatID, processMessage.message_id);
            try {
                await ctx.replyWithVideo(mediaURL, {
                    caption: data.caption ?
                    data.caption?.length <= 1024 ?
                    data.caption :
                    `${data.caption?.slice(0, 1020)} ...` :
                    !data.caption && ""
                });
            }
            catch (error) {
                console.error(`Video send failed => ${error}`);
                await ctx.reply(messages.invalidURL);
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