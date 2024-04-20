import {GenericIntent} from "./GenericIntent.mjs";

export class TestIntent extends GenericIntent {
    static name = "Test";

    static isIntended(text, context) {
        return text.toLowerCase() === "test";
    }

    static isDisabled() {
        return false;
    }

    static async execute(text, context) {
        const startTime = Date.now();
        await new Promise(resolve => setTimeout(resolve, 2000));
        return [
            {
                type: "assistant-response",
                text: "Test Response",
                timeToResponse: Date.now() - startTime
            }
        ]
    }
}