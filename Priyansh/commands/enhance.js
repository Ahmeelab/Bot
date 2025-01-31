const Jimp = require("jimp");
const fs = require("fs");
const axios = require("axios");

module.exports.config = {
  name: "enhance",
  version: "1.0.1",
  hasPermission: 0,
  credits: "ChatGPT",
  description: "Enhance image quality",
  commandCategory: "image",
  usages: "[reply to an image]",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event }) {
  try {
    if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
      return api.sendMessage("Please reply to an image to enhance it.", event.threadID);
    }

    let imageUrl = event.messageReply.attachments[0].url;
    let imagePath = __dirname + "/enhanced.jpg"; // Ensure absolute path

    // 🔄 Processing Start Reaction (⏳)
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    // Image download karo
    let response = await axios({ url: imageUrl, responseType: "arraybuffer" });
    fs.writeFileSync(imagePath, Buffer.from(response.data, "binary"));

    // Jimp se enhance karo
    let image = await Jimp.read(imagePath);
    await image
      .resize(Jimp.AUTO, 1080) // Resize to HD
      .quality(100) // Maximum quality
      .contrast(0.3) // Enhance contrast
      .brightness(0.1) // Slight brightness boost
      .normalize() // Normalize colors
      .writeAsync(imagePath); // Wait until image is fully written

    // ✅ Processing Complete Reaction
    api.setMessageReaction("✅", event.messageID, () => {}, true);

    // Ensure file exists before sending
    if (fs.existsSync(imagePath)) {
      return api.sendMessage(
        { body: "Here is your enhanced image:", attachment: fs.createReadStream(imagePath) },
        event.threadID,
        () => fs.unlinkSync(imagePath) // Delete file after sending
      );
    } else {
      throw new Error("Enhanced image not found.");
    }
  } catch (error) {
    console.error(error);
    api.setMessageReaction("❌", event.messageID, () => {}, true); // ❌ Error Reaction
    return api.sendMessage("Error enhancing the image.", event.threadID);
  }
};
