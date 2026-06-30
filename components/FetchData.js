const db = require("../configs/database.js");

const fetchData = async (url, ctx, messages) => {
    const chatID = ctx.chat.id;
    const messageID = ctx.message.message_id;
    const link = ctx.message.text;
    const firstName = ctx.chat.first_name;
    const username = ctx.chat.username;

    const formData = new FormData();
    formData.append("url", link);

    const requestOptions = {
        method: "POST",
        body: formData,
        redirect: "follow"
    }

    const processMessage = await ctx.reply(messages.processMessage);

    try {
        const response = await fetch(url, requestOptions);

        if (!response.ok) throw new Error(`Request Error : ${response.status} - ${response.statusText}`);

        const data = await response.json();
        const mediaURL = new URL(data.download_url, new URL(url).origin).href;
        
        const insertUsersDataQuery = "INSERT INTO users_data (name, username, chat_id, message_id, link, media_url, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)";

        db.query(insertUsersDataQuery, [firstName, username, chatID, messageID, link, mediaURL, data.gallery.expires_at], async (error, result) => {
            if (error) console.error(`Database Error => ${error.stack}`);
            else {
                await ctx.telegram.deleteMessage(chatID, processMessage.message_id);
                ctx.replyWithVideo(mediaURL, { caption: data.caption });
            }
        });
        
    }
    catch (error) {
        console.error(`Request Error => ${error.stack}`);
        requestErrorMessage = await ctx.telegram.editMessageText(chatID, processMessage.message_id, undefined, messages.requestError);
    }
}

module.exports = fetchData;