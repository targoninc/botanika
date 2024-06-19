import {GenericIntent} from "../../intents/GenericIntent.mjs";
import {MessageTypes} from "../../context/MessageTypes.mjs";
import {ToolBuilder} from "../../actions/ToolBuilder.mjs";
import {ToolParameter} from "../../actions/ToolParameter.mjs";

export class OpenIntent extends GenericIntent {
    static name = "open";

    static getTool() {
        return {
            tool: ToolBuilder.function("openLink")
                .description("Open a link for the user.")
                .parameters(ToolParameter.object()
                    .property("url", "string", "The url to open.")
                    .required("url")
                    .parameter
                ).tool,
            toolFunction: async (text, context, parameters) => {
                return await OpenIntent.execute(text, context, parameters.url);
            }
        };
    }

    static async execute(text, context, url) {
        const startTime = Date.now();
        try {
            const object = JSON.parse(url);
            return [
                {
                    type: MessageTypes.assistantResponse,
                    text: "Opening " + object.name,
                    timeToResponse: Date.now() - startTime
                },
                {
                    type: MessageTypes.openCommand,
                    text: "Opened " + object.name,
                    url: object.url,
                    timeToResponse: Date.now() - startTime
                }
            ];
        } catch (e) {
            console.error(e);
        }

        return [
            {
                type: MessageTypes.assistantResponse,
                text: "I couldn't figure out which URL you want to open.",
                timeToResponse: Date.now() - startTime
            }
        ]
    }

    static isDisabled() {
        return false;
    }
}