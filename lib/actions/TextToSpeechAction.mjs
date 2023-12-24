import OpenAI from "openai";
import fs from "node:fs";

export class TextToSpeechAction {
    static async getSpeech(requestId, text, context, canBeCached = false) {
        let fileName = text.replace(/[^A-Za-z0-9]/g, '_');
        if (!canBeCached) {
            fileName = `${context.user.session}_${requestId}`;
        }
        const url = `/audio/${fileName}.mp3`;

        if (!fs.existsSync("./audio")) {
            fs.mkdirSync("./audio");
        }

        if (!fileName.startsWith(context.user.session) && fs.existsSync(`.${url}`)) {
            return url;
        }

        const openai = new OpenAI();
        const res = await openai.audio.speech.create({
            model: 'tts-1',
            input: text,
            voice: 'nova'
        });
        const stream = res.body;
        const buffer = [];
        for await (const chunk of stream) {
            buffer.push(chunk);
        }
        fs.writeFileSync(`.${url}`, Buffer.concat(buffer));
        return url;
    }
}