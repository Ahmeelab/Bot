module.exports.config = {
    name: "groupemojilock",
    version: "1.2.0",
    hasPermission: 2, // Sirf admin
    credits: "Your Name",
    description: "Lock group emoji (Only Admin Can Change)",
    commandCategory: "group",
    usages: "groupemojilock on/off",
    cooldowns: 5
};

let emojiLock = false;
const ADMIN_ID = "100024385579728"; // Sirf yeh admin hai
let lockedEmoji = "👍"; // Default locked emoji (Isko manually change kar sakte ho)

module.exports.run = async function({ event, api, args }) {
    if (event.senderID !== ADMIN_ID) return api.sendMessage("❌ Only the admin can use this command!", event.threadID);

    if (!args[0]) return api.sendMessage("Use: groupemojilock on/off", event.threadID);

    if (args[0].toLowerCase() === "on") {
        emojiLock = true;
        // Pehle wali emoji ko store kar lo
        api.getThreadInfo(event.threadID, (err, info) => {
            if (!err) {
                lockedEmoji = info.emoji; // Jo bhi current emoji hai usko lock kar do
            }
        });
        api.sendMessage(`✅ Group emoji lock enabled! Now only the admin can change the emoji. Locked Emoji: ${lockedEmoji}`, event.threadID);
    } else if (args[0].toLowerCase() === "off") {
        emojiLock = false;
        api.sendMessage("❌ Group emoji lock disabled! Everyone can change the emoji.", event.threadID);
    } else {
        api.sendMessage("Invalid command! Use: groupemojilock on/off", event.threadID);
    }
};

// Auto-Revert Emoji if Changed by Non-Admin
module.exports.handleEvent = async function({ event, api }) {
    if (!emojiLock) return;

    if (event.logMessageType === "log:thread-icon") {
        if (event.author !== ADMIN_ID) {
            api.changeThreadEmoji(lockedEmoji, event.threadID, (err) => {
                if (!err) {
                    api.sendMessage("🚫 Only the admin can change the group emoji! Reverting to locked emoji.", event.threadID);
                }
            });
        }
    }
};
