import OpenAI from "openai";
import Groq from "groq-sdk";
import {Context} from "../context/Context.mjs";
import {CLI} from "../CLI.mjs";
import {MessageTypes} from "../context/MessageTypes.mjs";

export class ResponseAction {
    /**
     *
     * @param provider {'groq' | 'openai'}
     * @returns {{api: OpenAI | Groq, models: {quick: string, good: string}}}
     */
    static getCompletionProvider(provider = process.env.COMPLETION_PROVIDER) {
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
                    quick: "llama3-70b-8192",
                    good: "llama3-70b-8192"
                },
            };
        } else {
            throw new Error("Unknown completion provider: " + provider);
        }
    }

    static async getResponse(text, context) {
        const startTime = Date.now();
        const messages = ResponseAction.getMessages(text, context);
        const temperature = 1;

        const completionProvider = ResponseAction.getCompletionProvider();
        let completion;
        try {
            completion = await completionProvider.api.chat.completions.create({
                messages,
                model: completionProvider.models.quick,
                temperature,
                tool_choice: "auto",
                tools: Context.getOpenAiCompatibleToolFunctions()
            });
        } catch (e) {
            CLI.error(e);
            return [{
                type: MessageTypes.systemResponse,
                text: "An error occurred while trying to get a response.",
                timeToResponse: Date.now() - startTime
            }];
        }

        const out = completion.choices[0].message.content;

        const calledFunctions = completion.choices[0].message.tool_calls;
        const responses = [];
        if (calledFunctions && calledFunctions.length > 0) {
            ResponseAction.checkToolCalls(calledFunctions, context, responses, startTime);

            const completion = await completionProvider.api.chat.completions.create({
                messages: messages.splice(0, 1),
                model: completionProvider.models.quick,
                temperature,
            });

            const out2 = completion.choices[0].message.content;
            if (out2 && out2.trim().length > 0) {
                responses.push({
                    type: MessageTypes.assistantResponse,
                    text: out2,
                    timeToResponse: Date.now() - startTime,
                    language: this.getLanguage(out2)
                });
            }
        }

        if (out && out.trim().length > 0) {
            responses.push({
                type: MessageTypes.assistantResponse,
                text: out,
                timeToResponse: Date.now() - startTime,
                language: this.getLanguage(out)
            });
        }
        return responses;
    }

    static checkToolCalls(calledFunctions, context, responses, startTime) {
        for (const calledFunction of calledFunctions) {
            const functionDefinition = Context.getOpenAiCompatibleToolFunctions().find(f => f.function.name === calledFunction.function.name);
            if (functionDefinition) {
                const parameters = JSON.parse(calledFunction.function.arguments);
                CLI.debug(`Calling function ${calledFunction.function.name} with parameters: ${JSON.stringify(parameters)}`);
                const result = Context.callContextFunction(context, calledFunction.function.name, parameters);
                if (result) {
                    context = result.context;
                    responses.push({
                        type: MessageTypes.systemResponse,
                        text: result.description,
                        timeToResponse: Date.now() - startTime
                    });
                }
            }
        }
        return context;
    }

    static getMessages(text, context) {
        const systemPrompt = `You are a virtual assistant called ${context.assistant.name}. Your language is currently ${context.assistant.language}. If the user says something that you understand, 
            you respond with a message that responds to it and the given context and message history. If the user uses a different language, you should respond in that language.`;
        const userPrompt = text;
        const assistantInfo = `You give your best to be nice, you are allowed to be funny and charming. You can use emoticons like :D, ;), :p, etc.`;
        const toolInfo = `Prefer calling tool functions over responding, especially if you recognize any info that can be extracted from the user's message.
        Never expliticly offer the user to save any information, just do it. There will be a second chance to respond to the user's message after the tool function has been called. 
        Example: "My ex wife Ana left me" -> relationshipStatus = "divorced", exWifeName = "Ana"`;
        let userInfo = `The user's name is ${context.user.name}. Their language is ${context.user.language}. Here is some information about the user:`;
        for (const userProperty in context.user) {
            if (userProperty !== "name" && userProperty !== "language") {
                userInfo += ` ${userProperty} = ${context.user[userProperty]}`;
            }
        }
        const generalString = Object.keys(context.general).map(g => `${g} = ${context.general[g]}`).join(", ");
        const generalInfo = `Here is some general information: ${generalString}`;
        return [
            {role: "system", content: systemPrompt},
            {role: "system", content: assistantInfo},
            {role: "system", content: toolInfo},
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