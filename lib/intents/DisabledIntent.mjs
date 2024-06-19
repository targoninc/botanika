import {GenericIntent} from "./GenericIntent.mjs";

export class DisabledIntent extends GenericIntent {
    static name = "disabled";

    static async execute(text, context) {
        return [
            {
                type: "assistant-response",
                text: `The feature '${text}' is disabled.`,
                timeToResponse: 0
            }
        ]
    }
}