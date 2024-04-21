import {Context} from "../context/Context.mjs";
import {CLI} from "../CLI.mjs";
import {MessageTypes} from "../context/MessageTypes.mjs";
import {Completion} from "../Completion.mjs";

export class ResponseAction {
    static temperature = 1;

    static async getToolResponse(completionProvider, text, context, responses) {
        const startTime = Date.now();
        const messages = ResponseAction.getToolMessages(text, context);
        let completion;
        try {
            completion = await completionProvider.api.chat.completions.create({
                messages,
                model: completionProvider.models.quick,
                temperature: ResponseAction.temperature,
                tool_choice: "auto",
                tools: Context.getOpenAiCompatibleToolFunctions()
            });

            const calledFunctions = completion.choices[0].message.tool_calls;
            ResponseAction.checkToolCalls(calledFunctions, context, responses, startTime);
        } catch (e) {
            CLI.error(e);
        }
        // Ignore the tool response, because calling tool functions is all we want to do here
    }

    static async getTextResponse(completionProvider, text, context, responses) {
        const startTime = Date.now();
        const messages = ResponseAction.getResponseMessages(text, context);

        const completion = await completionProvider.api.chat.completions.create({
            messages,
            model: completionProvider.models.quick,
            temperature: ResponseAction.temperature,
            response_format: {
                type: "json_object",
            }
        });

        let out = completion.choices[0].message.content;

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

        if (out && out.trim().length > 0) {
            responses.push({
                type: MessageTypes.assistantResponse,
                text: out,
                timeToResponse: Date.now() - startTime,
                language: this.getLanguage(out)
            });
        }
    }

    static async getResponse(text, context) {
        const responses = [];
        const completionProvider = Completion.getProvider();

        await ResponseAction.getToolResponse(completionProvider, text, context, responses);
        await ResponseAction.getTextResponse(completionProvider, text, context, responses);
        return responses;
    }

    static checkToolCalls(calledFunctions, context, responses, startTime) {
        if (!calledFunctions) {
            return;
        }
        for (const calledFunction of calledFunctions) {
            const functionDefinition = Context.getOpenAiCompatibleToolFunctions().find(f => f.function.name === calledFunction.function.name);
            if (functionDefinition) {
                const parameters = JSON.parse(calledFunction.function.arguments);
                CLI.debug(`Called function ${calledFunction.function.name} with parameters: ${JSON.stringify(parameters)}`);
                const result = Context.callContextFunction(context, calledFunction.function.name, parameters);
                if (result) {
                    context = result.context;
                    responses.push({
                        type: MessageTypes.systemResponse,
                        text: result.description,
                        timeToResponse: Date.now() - startTime
                    });
                } else {
                    CLI.warning(`Function ${calledFunction.function.name} did not return a result`);
                }
            } else {
                CLI.warning(`Function ${calledFunction.function.name} not found in tool functions`);
            }
        }
    }

    static getResponseMessages(text, context) {
        const data = {type: "data", data: "--data--"};
        const textExample = {type: "text", text: "--text--"};
        const systemPrompt = `You are a virtual assistant called ${context.assistant.name}. Your language is currently ${context.assistant.language}. If the user says something that you understand, 
            you respond with a message that responds to it and the given context and message history. If the user uses a different language, you should respond in that language.
            Answer short and concise and with the following JSON format if some form of data or modification of it was requested:
            
            ${JSON.stringify(data, null, 2)} 
            
            If not, answer with:
            
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
            ...Context.getMessageHistory(context),
            {role: "user", content: userPrompt},
        ];
    }

    static getToolMessages(text, context) {
        const systemPrompt = `You are a virtual assistant called ${context.assistant.name}. Your language is currently ${context.assistant.language}.`;
        const toolInfo = `Call a tool function if it seems in any way possible to do so, e.g. if you recognize any info that can be extracted from the user's message. 
        Example: "My ex wife Ana left me" -> relationshipStatus = "divorced", exWifeName = "Ana"`;
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