import {GenericIntent} from "./GenericIntent.mjs";
import {ToolBuilder} from "../actions/ToolBuilder.mjs";

export class TestIntent extends GenericIntent {
    static name = "Test";

    static getTool() {
        return {
            tool: ToolBuilder.function("test")
                .description("Test tool. Call if you want to test the bot.")
                .parameters()
                .tool,
            toolFunction: async (text, context, parameters) => {
                return await TestIntent.execute(text, context);
            }
        }
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