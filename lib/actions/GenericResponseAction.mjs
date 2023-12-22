import OpenAI from "openai";

export class GenericResponseAction {
    static async getOpenAiResponse(text) {
        const systemPrompt = "You are a virtual assistant. If the user says something that you don't understand, you just respond with an empty message. If the user says something that you do understand, you respond with a message that you think is appropriate.";
        const userPrompt = text;
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const completion = await openai.chat.completions.create({
            messages: [
                {role: "system", content: systemPrompt},
                {role: "user", content: userPrompt},
            ],
            model: "gpt-3.5-turbo",
        });

        const out = completion.choices[0].message.content;

        return [
            {
                type: "assistant-response",
                text: out,
                language: GenericResponseAction.getLanguage(out)
            }
        ];
    }

    static getLanguage(text) {
        if (!text) {
            return "en";
        }
        const words = text.split(" ");
        const english = words.filter(w => w.match(/[a-z]/i)).length;
        const german = words.filter(w => w.match(/[äöüßz]/i)).length;
        if (german > 0 && german > english * 0.1) {
            return "de";
        }
        return "en";
    }
}