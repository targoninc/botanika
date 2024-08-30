import {GenericIntent} from "../../intents/GenericIntent.mjs";
import {ResetChatAction} from "./actions/ResetChatAction.mjs";
import {DeleteLastAction} from "./actions/DeleteLastAction.mjs";
import {ToolBuilder} from "../../actions/ToolBuilder.mjs";
import {ToolParameter} from "../../actions/ToolParameter.mjs";

export class ChatIntent extends GenericIntent {
    static name = "chat";

    static getTool() {
        return {
            tool: ToolBuilder.function("modifyChatHistory")
                .description("Modifies the chat history. Only use if explicitly asked to do so.")
                .parameters(ToolParameter.object()
                    .property("type", "string", "The type of the action. Can be 'reset' or 'deleteLast'.")
                    .property("value", "string", "The value of the action. For 'reset', this is irrelevant. For 'deleteLast', this is the number of messages to delete.")
                    .required("type", "value")
                    .parameter
                ).tool,
            allowFollowupToolCalls: true,
            toolFunction: (text, context, parameters) => {
                if (parameters.type === "reset") {
                    return ResetChatAction.execute(text, context);
                } else if (parameters.type === "deleteLast") {
                    return DeleteLastAction.execute(text, context, parameters.value);
                }
            }
        };
    }
}