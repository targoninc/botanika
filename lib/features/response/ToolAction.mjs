import {Context} from "../../context/Context.mjs";
import {CLI} from "../../tooling/CLI.mjs";
import {MessageTypes} from "../../context/MessageTypes.mjs";

export class ToolAction {
    static async getToolResponse(completionProvider, text, context, responses) {
        const startTime = Date.now();
        const messages = ToolAction.getToolMessages(text, context);
        let completion;
        try {
            completion = await completionProvider.api.chat.completions.create({
                messages,
                model: completionProvider.models.quick,
                temperature: 1,
                tool_choice: "auto",
                tools: Context.getOpenAiCompatibleToolFunctions()
            });

            const calledFunctions = completion.choices[0].message.tool_calls;
            ToolAction.checkToolCalls(calledFunctions, context, responses, startTime);
        } catch (e) {
            CLI.error(e);
        }
        // Ignore the tool response, because calling tool functions is all we want to do here
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
}