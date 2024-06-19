import {Context} from "../context/Context.mjs";
import {CLI} from "../../tooling/CLI.mjs";
import {MessageTypes} from "../../MessageTypes.mjs";

export class ResponseAction {
    static async getTextResponse(completionProvider, text, context, responses) {
        const startTime = Date.now();
        const messages = ResponseAction.getResponseMessages(text, context);

        let completion;
        try {
            completion = await completionProvider.api.chat.completions.create({
                messages,
                model: completionProvider.models.quick,
                temperature: 1,
                response_format: {
                    type: "json_object",
                }
            });
        } catch (e) {
            CLI.warning(e);
            const failedGeneration = e.error.error.failed_generation;
            if (failedGeneration) {
                responses.push({
                    type: MessageTypes.assistantResponse,
                    text: failedGeneration,
                    timeToResponse: Date.now() - startTime,
                    language: this.getLanguage(failedGeneration)
                });
            }
            return;
        }

        let out = completion.choices[0].message.content;
        out = ResponseAction.postProcessResponse(out);

        let json;
        tryParsingJson: {
            try {
                json = JSON.parse(out);
                if (json.type) {
                    if (json.type === "text") {
                        out = json.text;
                        break tryParsingJson;
                    } else if (json.type === "data") {
                        responses.push({
                            type: MessageTypes.assistantData,
                            text: json.data,
                            timeToResponse: Date.now() - startTime
                        });
                        return;
                    }
                }
            } catch (e) {
                CLI.warning("Could not parse JSON from response: " + out);
            }
        }

        if (out && out.length > 0) {
            responses.push({
                type: MessageTypes.assistantResponse,
                text: out,
                timeToResponse: Date.now() - startTime,
                language: this.getLanguage(out)
            });
        }
    }

    static postProcessResponse(text) {
        const remove = ["</s>"];
        for (const r of remove) {
            text = text.replaceAll(r, "");
        }

        return text.trim();
    }

    static getResponseMessages(text, context) {
        const textExample = {type: "text", text: "--text--"};
        const systemPrompt = `You are a virtual assistant called ${context.assistant.name}. Your language is currently ${context.assistant.language}. If the user says something that you understand, 
            you respond with a message that responds to it and the given context and message history. If the user uses a different language, you should respond in that language.
            Answer short and concise and with the following JSON format:
            
            ${JSON.stringify(textExample, null, 2)}`;
        const assistantInfo = `You give your best to be nice, you are allowed to be funny and charming. You can use ascii emoticons like :D, ;), :p, etc.`;
        let userInfo = `The user's name is ${context.user.name}. Their language is ${context.user.language}. Here is some information about the user:`;
        const userPrompt = text;
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
            {role: "system", content: userInfo},
            {role: "system", content: generalInfo},
            ...Context.getMessageHistoryWithoutUserMessages(context),
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