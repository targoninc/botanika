import OpenAI from "openai";

export class GenericResponseAction {
    static async getResponse(text) {
        if (text.includes("who are you")) {
            return `I am a virtual assistant. I am here to help you with whatever you need.`;
        }
        if (text.includes("what is your name")) {
            return `My name is botanika.`;
        }
        if (text.includes("what is your purpose")) {
            return `I am here to help you with whatever you need.`;
        }

        return await GenericResponseAction.getOpenAiResponse(text);
    }

    static async getOpenAiResponse(text) {
        const systemPrompt = "You are a virtual assistant. If the user says something that you don't understand, you just respond with an empty message. If the user says something that you do understand, you respond with a message that you think is appropriate.";
        const userPrompt = text;
        const openai = new OpenAI();

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            model: "gpt-3.5-turbo",
        });

        return completion.choices[0].message.content;
    }
}