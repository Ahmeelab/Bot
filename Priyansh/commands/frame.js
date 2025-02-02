const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports.config = {
    name: "frame",
    version: "1.0.4",
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

    // ✅ Frame aur Profile Picture URLs
    const frameImageURL = "https://i.imgur.com/iF24qyn.jpeg"; // ✅ Frame Image
    const profilePicURL = `https://graph.facebook.com/${mention}/picture?width=500&height=500`; // ✅ User Profile Picture
    const defaultAvatar = "https://i.imgur.com/Nz2ACiw.png"; // ✅ Default avatar if profile pic fails

    const canvasWidth = 500, canvasHeight = 500;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d");

    const tempDir = "./temp";
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const framePath = path.join(tempDir, "frame.jpeg");
    const profilePath = path.join(tempDir, `${mention}_profile.png`);
    const finalImagePath = path.join(tempDir, `frame_${mention}.png`);

    try {
        console.log("🔄 Downloading frame image...");
        const frameResponse = await axios({ url: frameImageURL, responseType: "arraybuffer" });
        fs.writeFileSync(framePath, Buffer.from(frameResponse.data));

        console.log("🔄 Downloading profile picture...");
        let profilePicData;
        try {
            const profileResponse = await axios({ url: profilePicURL, responseType: "arraybuffer" });
            profilePicData = profileResponse.data;
        } catch (error) {
            console.warn("⚠️ Profile picture not available, using default avatar.");
            const defaultResponse = await axios({ url: defaultAvatar, responseType: "arraybuffer" });
            profilePicData = defaultResponse.data;
        }

        fs.writeFileSync(profilePath, Buffer.from(profilePicData));

        console.log("🖼️ Loading images into canvas...");
        const frame = await loadImage(framePath);
        const profilePic = await loadImage(profilePath);

        // ✅ Frame Image Draw
        ctx.drawImage(frame, 0, 0, canvasWidth, canvasHeight);

        // ✅ Proper Centering for Profile Picture
        const circleX = 250, circleY = 230, radius = 85; // Adjusted for perfect center

        ctx.save();
        ctx.beginPath();
        ctx.arc(circleX, circleY, radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        // ✅ Ensure Profile Picture fits perfectly in the frame's circle
        ctx.drawImage(profilePic, circleX - radius, circleY - radius, radius * 2, radius * 2);
        ctx.restore();

        // ✅ Add User ID Text
        ctx.font = "bold 30px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText(`User ID: ${mention}`, canvasWidth / 2, 450);

        // ✅ Save Image
        const buffer = canvas.toBuffer("image/png");
        fs.writeFileSync(finalImagePath, buffer);

        console.log("✅ Frame image created successfully!");

        // ✅ Send Image to Chat
        api.sendMessage({
            body: `🌟 Here is the frame for ${userName}:`,
            attachment: fs.createReadStream(finalImagePath)
        }, event.threadID, () => {
            fs.unlinkSync(finalImagePath);
            fs.unlinkSync(framePath);
            fs.unlinkSync(profilePath);
        });

    } catch (err) {
        console.error("❌ Error generating the frame:", err);
        api.sendMessage(`⚠️ Error: ${err.message}`, event.threadID);
    }
};
