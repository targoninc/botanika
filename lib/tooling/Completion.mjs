import OpenAI from "openai";
import Groq from "groq-sdk";
import ollama from "ollama";
import {CLI} from "./CLI.mjs";

export class Completion {
    static async prepareProvider(provider = process.env.COMPLETION_PROVIDER) {
        if (provider === 'ollama') {
            const desiredModels = ['llama2-uncensored', 'gemma'];
            const existingModels = await ollama.list();
            if (existingModels.models.length > 0) {
                CLI.info(`[ollama] Found existing models: ${existingModels.models.map(m => m.name).join(', ')}`);
            }
            for (const model of desiredModels) {
                if (!existingModels.models.find(m => m.name.startsWith(model))) {
                    CLI.info(`[ollama] Pulling model ${model}...`);
                    await ollama.pull({
                        model: model
                    });
                    CLI.success(`[ollama] Finished pulling model ${model}`);
                }
            }
        }
    }

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
                    quick: process.env.OPENAI_MODEL_QUICK ?? "gpt-4o-mini",
                    good: process.env.OPENAI_MODEL_GOOD ?? "gpt-4o",
                },
            };
        } else if (provider === "groq") {
            const groq = new Groq({
                apiKey: process.env.GROQ_API_KEY
            });
            return {
                api: groq,
                models: {
                    quick: process.env.GROQ_MODEL_QUICK ?? "mixtral-8x7b-32768",
                    good: process.env.GROQ_MODEL_GOOD ?? "llama3-70b-8192"
                },
            };
        } else if (provider === "ollama") {
            return {
                api: {
                    chat: {
                        completions: {
                            create: async (options) => {
                                const ollamaOptions = {
                                    model: options.model,
                                    messages: options.messages,
                                    options: {
                                        temperature: 1,
                                    }
                                };
                                if (options.response_format?.type === "json_object") {
                                    ollamaOptions.format = "json";
                                }
                                const baseResponse = await ollama.chat(ollamaOptions);
                                return { choices: [baseResponse] };
                            }
                        }
                    }
                },
                models: {
                    quick: "gemma",
                    good: "llama2-uncensored"
                }
            };
        } else {
            throw new Error("Unknown completion provider: " + provider);
        }
    }

    static async complete(provider, messages, model, options = {}) {
        return provider.api.chat.completions.create({
            messages,
            model: provider.models[model],
            ...options,
        });
    }
}