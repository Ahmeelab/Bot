const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");

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

module.exports.run = async function ({ api, event, args }) {
    if (!event.mentions || Object.keys(event.mentions).length === 0) {
        return api.sendMessage("⚠️ Please mention a user!", event.threadID);
    }

    // Get mentioned user ID & name
    const mention = Object.keys(event.mentions)[0];
    const userName = event.mentions[mention].replace("@", "");

    // Frame Settings
    const frameImage = "https://imgur.com/a/kACzUq5.png"; // Replace with your frame image URL
    const canvas = createCanvas(500, 500);
    const ctx = canvas.getContext("2d");

    try {
        // Load Frame & Add Text
        const frame = await loadImage(frameImage);
        ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);

        // Add Text (User ID)
        ctx.font = "bold 30px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText(`User ID: ${mention}`, canvas.width / 2, 450);

        // Save Image
        const imagePath = `./temp/frame_${mention}.png`;
        const buffer = canvas.toBuffer("image/png");
        fs.writeFileSync(imagePath, buffer);

        // Send Image
        api.sendMessage({
            body: `🌟 Here is the frame for ${userName}:`,
            attachment: fs.createReadStream(imagePath)
        }, event.threadID, () => fs.unlinkSync(imagePath));
    } catch (err) {
        console.error("Error generating frame:", err);
        api.sendMessage("⚠️ Something went wrong while generating the frame. Please try again later.", event.threadID);
    }
};
