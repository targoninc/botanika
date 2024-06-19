import {ResponseIntent} from "../features/response/ResponseIntent.mjs";
import {CLI} from "../tooling/CLI.mjs";
import {ToolAction} from "../features/response/ToolAction.mjs";
import {Completion} from "../tooling/Completion.mjs";

export class IntentAction {
    static async getIntentAndRespond(text, context, responses, availableIntents) {
        const tools = availableIntents.map(i => i.getTool()).filter(t => t);
        const completionProvider = Completion.getProvider();
        const toolCalls = await ToolAction.getCalledTool(completionProvider, text, context, tools.map(t => t.tool));
        if (toolCalls) {
            for (const tc of toolCalls) {
                const tool = tools.find(t => t.tool.function.name === tc.function.name);
                if (!tool) {
                    CLI.warning(`Tool ${tc.function.name} not found`);
                    continue;
                }

                const parameters = JSON.parse(tc.function.arguments);
                CLI.debug(`Called function ${tc.function.name} with parameters: ${JSON.stringify(parameters)}`);
                const newResponses = await tool.toolFunction(text, context, parameters);
                if (newResponses) {
                    responses = responses.concat(newResponses);
                } else {
                    CLI.debug(`Tool ${tc.function.name} returned no response with parameters: ${JSON.stringify(parameters)}`);
                    responses = responses.concat(await ResponseIntent.execute(text, context));
                }
            }
        } else {
            responses = responses.concat(await ResponseIntent.execute(text, context));
        }
        return responses;
    }
}