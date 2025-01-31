const fs = require("fs");
const { exec } = require("child_process");

module.exports.config = {
    name: "addcmd",
    version: "1.0.0",
    hasPermission: 2, // 2 means admin-only
    credits: "Your Name",
    description: "Add a new command to the bot via chat",
    commandCategory: "admin",
    usages: ".addcmd frame <code>",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    if (args.length < 2) {
        return api.sendMessage("⚠️ Usage: .addcmd <commandName> <code>", event.threadID);
    }

    const commandName = args.shift();
    const commandCode = args.join(" ");

    // File path
    const filePath = `./commands/${commandName}.js`;

    // Save command file
    fs.writeFileSync(filePath, commandCode, "utf8");

    // Restart bot to apply new command
    api.sendMessage(`✅ Command '${commandName}' added successfully! Restarting bot...`, event.threadID, () => {
        exec("pm2 restart all || node index.js");
    });
};
