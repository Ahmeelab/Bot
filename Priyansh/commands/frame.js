const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "frame",
    version: "1.0.0",
    hasPermission: 0,
    credits: "Your Name",
    description: "Mentioned user ki ID ek pyare frame me show kare",
    commandCategory: "fun",
    usages: ".frame @mention",
    cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
    if (!event.mentions || Object.keys(event.mentions).length === 0) {
        return api.sendMessage("⚠️ Please mention a user!", event.threadID);
    }

    const mention = Object.keys(event.mentions)[0];
    const userName = event.mentions[mention].replace("@", "");

    const frameImageURL = "https://imgur.com/a/kACzUq5.png"; // ✅ Replace with PNG image
    const canvasSize = 500;
    const canvas = createCanvas(canvasSize, canvasSize);
    const ctx = canvas.getContext("2d");

    try {
        console.log("🔄 Downloading frame...");
        
        // ✅ Fix: Convert Image to PNG Format Before Using
        const frame = await loadImage(frameImageURL);
        
        ctx.drawImage(frame, 0, 0, canvasSize, canvasSize);

        // ✅ Add Text
        ctx.font = "bold 30px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText(`User ID: ${mention}`, canvasSize / 2, 450);

        // ✅ Save Image
        const tempDir = "./temp";
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

        const imagePath = path.join(tempDir, `frame_${mention}.png`);
        const buffer = canvas.toBuffer("image/png");
        fs.writeFileSync(imagePath, buffer);

        console.log("✅ Frame image created successfully!");

        // ✅ Send Image to Chat
        api.sendMessage({
            body: `🌟 Here is the frame for ${userName}:`,
            attachment: fs.createReadStream(imagePath)
        }, event.threadID, () => {
            fs.unlinkSync(imagePath);
        });

    } catch (err) {
        console.error("❌ Error generating the frame:", err);
        api.sendMessage(`⚠️ Error: ${err.message}`, event.threadID);
    }
};
