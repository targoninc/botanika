import {GenericIntent} from "../../intents/GenericIntent.mjs";
import {ResponseAction} from "./ResponseAction.mjs";
import {Completion} from "../../tooling/Completion.mjs";
import {ToolAction} from "./ToolAction.mjs";

export class ResponseIntent extends GenericIntent {
    static name = "response";

    static isDisabled() {
        if (!process.env.COMPLETION_PROVIDER) {
            return true;
        }

        if (process.env.COMPLETION_PROVIDER === "groq" && !process.env.GROQ_API_KEY) {
            return true;
        }

        return process.env.COMPLETION_PROVIDER === "openai" && !process.env.OPENAI_API_KEY;
    }

    static async execute(text, context) {
        const responses = [];
        const completionProvider = Completion.getProvider();

        await ToolAction.getToolResponse(completionProvider, text, context, responses);
        await ResponseAction.getTextResponse(completionProvider, text, context, responses);
        return responses;
    }
}