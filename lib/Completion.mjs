import OpenAI from "openai";
import Groq from "groq-sdk";

export class Completion {
    /**
     *
     * @param provider {'groq' | 'openai'}
     * @returns {{api: OpenAI | Groq, models: {quick: string, good: string}}}
     */
    static getProvider(provider = process.env.COMPLETION_PROVIDER) {
        if (provider === "openai") {
            const openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
            });
            return {
                api: openai,
                models: {
                    quick: "gpt-3.5-turbo-1106",
                    good: "gpt-4-1106-preview",
                },
            };
        } else if (provider === "groq") {
            const groq = new Groq({
                apiKey: process.env.GROQ_API_KEY
            });
            return {
                api: groq,
                models: {
                    quick: "llama3-8b-8192",
                    good: "llama3-70b-8192"
                },
            };
        } else {
            throw new Error("Unknown completion provider: " + provider);
        }
    }

    static async complete(provider, messages, model, options = {}) {
        return provider.api.chat.completions.create({
            messages,
            model: provider.models[model],
            ...options
        });
    }
}