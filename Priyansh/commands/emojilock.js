module.exports.config = {
    name: "emojilock",
    version: "1.3.0",
    hasPermission: 2,
    credits: "Your Name",
    description: "Lock group emoji (Only Admin Can Change)",
    commandCategory: "group",
    usages: "groupemojilock on/off",
    cooldowns: 5
};

let emojiLock = false;
const ADMIN_ID = "100024385579728"; // Sirf yeh admin hai
let lockedEmoji = "👍"; // Default emoji (auto update ho jayegi)

module.exports.run = async function({ event, api, args }) {
    if (event.senderID !== ADMIN_ID) return api.sendMessage("❌ Only the admin can use this command!", event.threadID);

    if (!args[0]) return api.sendMessage("Use: groupemojilock on/off", event.threadID);

    if (args[0].toLowerCase() === "on") {
        emojiLock = true;
        api.getThreadInfo(event.threadID, (err, info) => {
            if (!err) {
                lockedEmoji = info.emoji; // Current emoji ko lock karo
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

// Auto-Revert Emoji if Changed by Unauthorized User
module.exports.handleEvent = async function({ event, api }) {
    if (!emojiLock) return;

    if (event.logMessageType === "log:thread-icon") {
        if (event.author !== ADMIN_ID) {
            api.sendMessage("🚫 Only the admin can change the group emoji! Resetting to locked emoji.", event.threadID);
            
            setTimeout(() => {
                api.changeThreadEmoji(lockedEmoji, event.threadID, (err) => {
                    if (err) console.log("❌ Failed to reset emoji:", err);
                });
            }, 2000); // 2-second delay to avoid rate limits
        }
    }
};
