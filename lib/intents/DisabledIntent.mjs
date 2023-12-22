import {GenericIntent} from "./GenericIntent.mjs";

export class DisabledIntent extends GenericIntent {
    static name = "disabled";

    static isIntended(text) {
        return false;
    }

    static async execute(text, context) {
        return [
            {
                type: "assistant-response",
                text: `The feature '${text}' is disabled.`
            }
        ]
    }
}