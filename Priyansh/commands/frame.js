import jimp from "https://esm.sh/jimp@0.16.1";

export default async function generateFrame(api, event) {
    if (!event.mentions || Object.keys(event.mentions).length === 0) {
        return api.sendMessage("⚠️ Please mention a user!", event.threadID);
    }

    const mention = Object.keys(event.mentions)[0];
    const userName = event.mentions[mention].replace("@", "");

    const frameURL = "https://imgur.com/a/kACzUq5.png"; // Replace with your frame
    const imagePath = `./temp/frame_${mention}.png`;

    try {
        console.log("🔄 Downloading frame...");
        const frame = await jimp.read(frameURL);

        console.log("📝 Adding text...");
        const font = await jimp.loadFont(jimp.FONT_SANS_32_WHITE);
        frame.print(font, 50, 450, `User ID: ${mention}`);

        console.log("💾 Saving image...");
        await frame.writeAsync(imagePath);

        api.sendMessage({
            body: `🌟 Here is the frame for ${userName}:`,
            attachment: fs.createReadStream(imagePath)
        }, event.threadID, () => fs.unlinkSync(imagePath));

    } catch (err) {
        console.error("❌ Error:", err);
        api.sendMessage("⚠️ An error occurred while generating the frame.", event.threadID);
    }
}
