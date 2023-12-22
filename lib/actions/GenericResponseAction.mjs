import OpenAI from "openai";
import {Context} from "../context/Context.mjs";

export class GenericResponseAction {
    static async getOpenAiResponse(text, context) {
        const systemPrompt = "You are a virtual assistant. If the user says something that you don't understand, you just respond with an empty message. If the user says something that you do understand, you respond with a message that you think is appropriate.";
        const userPrompt = text;
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        const messagesFromContext = context.history.map(h => {
            if (h.type === "assistant-response") {
                return {role: "assistant", content: h.text};
            } else if (h.type === "user-input") {
                return {role: "user", content: h.text};
            }
        });
        const assistantInfo = `You are ${context.assistant.name}. Your language is ${context.assistant.language}.`;
        let userInfo = `The user is ${context.user.name}. Their language is ${context.user.language}. Here is some information about the user:`;
        for (const userProperty in context.user) {
            if (userProperty !== "name" && userProperty !== "language") {
                userInfo += ` ${userProperty} = ${context.user[userProperty]}`;
            }
        }

        const completion = await openai.chat.completions.create({
            messages: [
                {role: "system", content: systemPrompt},
                {role: "system", content: assistantInfo},
                {role: "system", content: userInfo},
                ...messagesFromContext,
                {role: "user", content: userPrompt},
            ],
            model: "gpt-3.5-turbo",
            tools: Context.getOpenAiToolFunctions()
        });

        const out = completion.choices[0].message.content;

        const calledFunctions = completion.choices[0].message.tool_calls;
        const responses = [];
        if (calledFunctions && calledFunctions.length > 0) {
            for (const calledFunction of calledFunctions) {
                const functionDefinition = Context.getOpenAiToolFunctions().find(f => f.function.name === calledFunction.function.name);
                if (functionDefinition) {
                    const parameters = JSON.parse(calledFunction.function.arguments);
                    console.log("Calling function", calledFunction.function.name, "with parameters", parameters);
                    const result = Context.callContextFunction(context, calledFunction.function.name, parameters);
                    if (result) {
                        context = result.context;
                        responses.push({
                            type: "assistant-response",
                            text: result.description
                        });
                    }
                }
            }
        }

        if (out && out.trim().length > 0) {
            responses.push({
                type: "assistant-response",
                text: out,
                language: GenericResponseAction.getLanguage(out)
            });
        }
        return responses;
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