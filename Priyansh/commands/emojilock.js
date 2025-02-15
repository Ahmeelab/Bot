module.exports.config = {
    name: "groupemojilock",
    version: "2.0.0",
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
let monitoringInterval = null; // Background monitoring process

module.exports.run = async function({ event, api, args }) {
    if (event.senderID !== ADMIN_ID) return api.sendMessage("❌ Only the admin can use this command!", event.threadID);

    if (!args[0]) return api.sendMessage("Use: groupemojilock on/off", event.threadID);

    if (args[0].toLowerCase() === "on") {
        emojiLock = true;

        // Store the current emoji as the locked emoji
        api.getThreadInfo(event.threadID, (err, info) => {
            if (!err) {
                lockedEmoji = info.emoji;
                api.sendMessage(`✅ Group emoji lock enabled! Locked Emoji: ${lockedEmoji}`, event.threadID);
            }
        });

        // Start Background Monitoring to Check & Fix Emoji Every 5 Seconds
        if (!monitoringInterval) {
            monitoringInterval = setInterval(() => {
                if (emojiLock) {
                    api.getThreadInfo(event.threadID, (err, info) => {
                        if (!err && info.emoji !== lockedEmoji) {
                            api.changeThreadEmoji(lockedEmoji, event.threadID, (err) => {
                                if (!err) {
                                    api.sendMessage("🚫 Group emoji was changed! Resetting to locked emoji.", event.threadID);
                                }
                            });
                        }
                    });
                }
            }, 5000); // Check every 5 seconds
        }

    } else if (args[0].toLowerCase() === "off") {
        emojiLock = false;
        clearInterval(monitoringInterval); // Stop checking
        monitoringInterval = null;
        api.sendMessage("❌ Group emoji lock disabled! Now anyone can change the emoji.", event.threadID);
    } else {
        api.sendMessage("Invalid command! Use: groupemojilock on/off", event.threadID);
    }
};
