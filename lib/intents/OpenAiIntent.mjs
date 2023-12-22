import {GenericIntent} from "./GenericIntent.mjs";
import {GenericResponseAction} from "../actions/GenericResponseAction.mjs";

export class OpenAiIntent extends GenericIntent {
    static name = "openai";

    static isDisabled() {
        return !process.env.OPENAI_API_KEY;
    }

    static async execute(text, context) {
        return await GenericResponseAction.getOpenAiResponse(text, context);
    }
}