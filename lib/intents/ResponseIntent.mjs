import {GenericIntent} from "./GenericIntent.mjs";
import {ResponseAction} from "../actions/ResponseAction.mjs";

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
        return await ResponseAction.getResponse(text, context);
    }
}