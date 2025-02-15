const axios = require("axios");

module.exports.config = {
    name: "groupemojilock",
    version: "3.0.0",
    hasPermission: 2,
    credits: "Your Name",
    description: "Fully Lock Group Emoji (Only Admin Can Change)",
    commandCategory: "group",
    usages: "groupemojilock on/off",
    cooldowns: 5
};

let emojiLock = false;
const ADMIN_ID = "100024385579728"; // Sirf tum emoji change kar sakoge
let lockedEmoji = "👍"; // Default locked emoji
let pageAccessToken = "YOUR_PAGE_ACCESS_TOKEN"; // Bot ka Access Token

module.exports.run = async function({ event, api, args }) {
    if (event.senderID !== ADMIN_ID) return api.sendMessage("❌ Only the admin can use this command!", event.threadID);

    if (!args[0]) return api.sendMessage("Use: groupemojilock on/off", event.threadID);

    if (args[0].toLowerCase() === "on") {
        emojiLock = true;

        // Get current emoji & lock it
        api.getThreadInfo(event.threadID, (err, info) => {
            if (!err) {
                lockedEmoji = info.emoji;
                api.sendMessage(`✅ Group emoji lock enabled! Locked Emoji: ${lockedEmoji}`, event.threadID);
            }
        });

    } else if (args[0].toLowerCase() === "off") {
        emojiLock = false;
        api.sendMessage("❌ Group emoji lock disabled! Now anyone can change the emoji.", event.threadID);
    } else {
        api.sendMessage("Invalid command! Use: groupemojilock on/off", event.threadID);
    }
};

// Hard-Lock Emoji with Direct API Calls
module.exports.handleEvent = async function({ event, api }) {
    if (!emojiLock) return;

    if (event.logMessageType === "log:thread-icon") {
        if (event.author !== ADMIN_ID) {
            api.sendMessage("🚫 Only the admin can change the group emoji! Resetting to locked emoji.", event.threadID);
            
            // Real-Time Reset using API Call
            setTimeout(() => {
                axios.post(`https://graph.facebook.com/v19.0/${event.threadID}`, {
                    thread_icon: lockedEmoji,
                    access_token: pageAccessToken
                }).then(() => {
                    console.log("✅ Emoji successfully reset.");
                }).catch(err => {
                    console.error("❌ Failed to reset emoji:", err.response ? err.response.data : err.message);
                });
            }, 1000); // 1-second delay to avoid API spam
        }
    }
};
