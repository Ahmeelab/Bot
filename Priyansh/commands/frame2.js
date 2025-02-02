const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports.config = {
    name: "frame2", // ✅ Changed from "frame" to "frame2"
    version: "1.0.0",
    hasPermission: 0,
    credits: "Your Name",
    description: "Mentioned user ki ID ek pyare frame me show kare",
    commandCategory: "fun",
    usages: ".frame2 @mention",
    cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
    if (!event.mentions || Object.keys(event.mentions).length === 0) {
        return api.sendMessage("⚠️ Please mention a user!", event.threadID);
    }

    const mention = Object.keys(event.mentions)[0];
    const userName = event.mentions[mention].replace("@", "");

    const frameImageURL = "https://i.postimg.cc/pry96JKH/images-1.jpg"; // ✅ Frame image link
    const profilePicURL = `https://graph.facebook.com/${mention}/picture?width=500&height=500`; // ✅ FB Profile Pic
    const canvasSize = 500;
    const circleSize = 180;
    const circleX = 250, circleY = 190; // ✅ Adjust as per frame image circle position

    const canvas = createCanvas(canvasSize, canvasSize);
    const ctx = canvas.getContext("2d");

    const tempDir = "./temp";
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const framePath = path.join(tempDir, "frame.png");
    const profilePath = path.join(tempDir, `profile_${mention}.png`);
    const finalImagePath = path.join(tempDir, `frame_${mention}.png`);

    try {
        console.log("🔄 Downloading frame image...");
        const frameResponse = await axios({ url: frameImageURL, responseType: "arraybuffer" });
        fs.writeFileSync(framePath, Buffer.from(frameResponse.data));

        console.log("🔄 Downloading profile picture...");
        const profileResponse = await axios({ url: profilePicURL, responseType: "arraybuffer" });
        fs.writeFileSync(profilePath, Buffer.from(profileResponse.data));

        console.log("🖼️ Loading images into canvas...");
        const frame = await loadImage(framePath);
        const profilePic = await loadImage(profilePath);

        // Draw frame image
        ctx.drawImage(frame, 0, 0, canvasSize, canvasSize);

        // Draw profile picture inside circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(circleX, circleY, circleSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(profilePic, circleX - circleSize / 2, circleY - circleSize / 2, circleSize, circleSize);
        ctx.restore();

        // Save final image
        const buffer = canvas.toBuffer("image/png");
        fs.writeFileSync(finalImagePath, buffer);

        console.log("✅ Frame image created successfully!");

        // ✅ Send Image to Chat
        api.sendMessage({
            body: `🌟 Here is the frame for ${userName}:`,
            attachment: fs.createReadStream(finalImagePath)
        }, event.threadID, () => {
            fs.unlinkSync(finalImagePath);
            fs.unlinkSync(profilePath);
            fs.unlinkSync(framePath);
        });

    } catch (err) {
        console.error("❌ Error generating the frame:", err);
        api.sendMessage(`⚠️ Error: ${err.message}`, event.threadID);
    }
};
