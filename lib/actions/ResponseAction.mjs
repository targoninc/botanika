import OpenAI from "openai";
import Groq from "groq-sdk";
import {Context} from "../context/Context.mjs";

export class ResponseAction {
    /**
     *
     * @param provider {'groq' | 'openai'}
     */
    static getCompletionProvider(provider) {
        if (provider === "openai") {
            const openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
            });
            return {
                api: openai,
                model: "gpt-3.5-turbo-1106",
            };
        } else if (provider === "groq") {
            const groq = new Groq({
                apiKey: process.env.GROQ_API_KEY
            });
            return {
                api: groq,
                model: "mixtral-8x7b-32768",
            };
        } else {
            throw new Error("Unknown completion provider: " + provider);
        }
    }

    static async getResponse(text, context) {
        const messages = ResponseAction.getMessages(text, context);
        const temperature = 1;

        const completionProvider = ResponseAction.getCompletionProvider(process.env.COMPLETION_PROVIDER);
        const completion = await completionProvider.api.chat.completions.create({
            messages,
            model: completionProvider.model,
            temperature,
            tool_choice: "auto",
            tools: Context.getOpenAiCompatibleToolFunctions()
        });

        const out = completion.choices[0].message.content;

        const calledFunctions = completion.choices[0].message.tool_calls;
        const responses = [];
        if (calledFunctions && calledFunctions.length > 0) {
            ResponseAction.checkToolCalls(calledFunctions, context, responses);

            const completion = await completionProvider.api.chat.completions.create({
                messages: messages.splice(0, 1),
                model: completionProvider.model,
                temperature,
            });

            const out2 = completion.choices[0].message.content;
            if (out2 && out2.trim().length > 0) {
                responses.push({
                    type: "assistant-response",
                    text: out2,
                    language: this.getLanguage(out2)
                });
            }
        }

        if (out && out.trim().length > 0) {
            responses.push({
                type: "assistant-response",
                text: out,
                language: this.getLanguage(out)
            });
        }
        return responses;
    }

    static checkToolCalls(calledFunctions, context, responses) {
        for (const calledFunction of calledFunctions) {
            const functionDefinition = Context.getOpenAiCompatibleToolFunctions().find(f => f.function.name === calledFunction.function.name);
            if (functionDefinition) {
                const parameters = JSON.parse(calledFunction.function.arguments);
                console.log("Calling function", calledFunction.function.name, "with parameters", parameters);
                const result = Context.callContextFunction(context, calledFunction.function.name, parameters);
                if (result) {
                    context = result.context;
                    responses.push({
                        type: "system-response",
                        text: result.description
                    });
                }
            }
        }
        return context;
    }

    static getMessages(text, context) {
        const systemPrompt = "You are a virtual assistant. If the user says something that you don't understand, you just respond with an empty message. If the user says something that you do understand, you respond with a message that responds to that.";
        const userPrompt = text;
        const assistantInfo = `You are ${context.assistant.name}. Your language is ${context.assistant.language}. You try to be nice, you can be funny and charming. You can use emojis, but emoticons are preferred.`;
        const toolInfo = `Prefer calling tool functions over responding, especially for saving info. Example: "My ex wife Ana left me" -> relationshipStatus = "divorced", exWifeName = "Ana" | "My favorite car is a Tesla" -> favoriteCar = "Tesla"`;
        let userInfo = `The user is ${context.user.name}. Their language is ${context.user.language}. Here is some information about the user:`;
        for (const userProperty in context.user) {
            if (userProperty !== "name" && userProperty !== "language") {
                userInfo += ` ${userProperty} = ${context.user[userProperty]}`;
            }
        }
        const generalString = Object.keys(context.general).map(g => `${g} = ${context.general[g]}`).join(", ");
        const generalInfo = `Here is some general information: ${generalString}`;
        return [
            {role: "system", content: toolInfo},
            {role: "system", content: systemPrompt},
            {role: "system", content: assistantInfo},
            {role: "system", content: userInfo},
            {role: "system", content: generalInfo},
            ...Context.getMessageHistory(context),
            {role: "user", content: userPrompt},
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