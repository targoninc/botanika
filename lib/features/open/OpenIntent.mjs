import {GenericIntent} from "../../intents/GenericIntent.mjs";
import {MessageTypes} from "../../MessageTypes.mjs";
import {ToolBuilder} from "../../actions/ToolBuilder.mjs";
import {ToolParameter} from "../../actions/ToolParameter.mjs";

export class OpenIntent extends GenericIntent {
    static name = "open";

    static getTool() {
        return {
            tool: ToolBuilder.function("openLink")
                .description("Open a link for the user.")
                .parameters(ToolParameter.object()
                    .property("name", "string", "The name of the link.")
                    .property("url", "string", "The url to open.")
                    .required("name, url")
                    .parameter
                ).tool,
            toolFunction: async (text, context, parameters) => {
                return await OpenIntent.execute(text, context, parameters.name, parameters.url);
            }
        };
    }

    static async execute(text, context, name, url) {
        const startTime = Date.now();
        try {
            return [
                {
                    type: MessageTypes.assistantResponse,
                    text: "Opening " + name,
                    timeToResponse: Date.now() - startTime
                },
                {
                    type: MessageTypes.openCommand,
                    text: "Opened " + name + " (" + url + ")",
                    url: url,
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