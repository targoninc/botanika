import {GenericIntent} from "../../intents/GenericIntent.mjs";
import {ResponseAction} from "./ResponseAction.mjs";
import {Completion} from "../../tooling/Completion.mjs";
import {ToolAction} from "./ToolAction.mjs";
import {ToolBuilder} from "../../actions/ToolBuilder.mjs";

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

    static getTool() {
        return {
            tool: ToolBuilder.function("response")
                .description("Generates a response with an LLM based on the given text.")
                .tool,
            toolFunction: async (text, context) => {
                return ResponseIntent.execute(text, context);
            }
        };
    }

    static async execute(text, context) {
        const responses = [];
        const completionProvider = Completion.getProvider();
        await ResponseAction.getTextResponse(completionProvider, text, context, responses);
        return responses;
    }
}