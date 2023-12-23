import OpenAI from "openai";
import fs from "node:fs";

export class TextToSpeechAction {
    static async getSpeech(text) {
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
        const url = "/audio/latest.mp3";
        if (!fs.existsSync("./audio")) {
            fs.mkdirSync("./audio");
        }
        fs.writeFileSync(`.${url}`, Buffer.concat(buffer));
        return url;
    }
}