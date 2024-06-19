import {Context} from "../context/Context.mjs";
import {CLI} from "../../tooling/CLI.mjs";
import {MessageTypes} from "../../MessageTypes.mjs";

export class ToolAction {
    static async getCalledTool(completionProvider, text, context, tools) {
        const startTime = Date.now();
        const messages = ToolAction.getToolMessages(text, context);
        let completion;
        try {
            completion = await completionProvider.api.chat.completions.create({
                messages,
                model: completionProvider.models.good,
                temperature: 1,
                tool_choice: "required",
                tools
            });

            const diff = Date.now() - startTime;
            CLI.debug(`Tool response took ${diff}ms`);
            return completion.choices[0].message.tool_calls;
        } catch (e) {
            CLI.warning(e);
        }
    }

    static getToolMessages(text, context) {
        const systemPrompt = `You are a virtual assistant called ${context.assistant.name}. Your language is currently ${context.assistant.language}.`;
        const toolInfo = `Call the tool function that seems most sensible to use. E.g. if the weather is requested, call the weather function or if something related to music is requested, call the according function. If nothing matches, use the response function.`;
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
            ...Context.getMessageHistoryWithOnlyLastUserMessage(context),
            {role: "user", content: userPrompt},
        ];
    }
}