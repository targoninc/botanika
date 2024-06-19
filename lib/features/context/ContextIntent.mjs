import {GenericIntent} from "../../intents/GenericIntent.mjs";
import {Context} from "./Context.mjs";
import {MessageTypes} from "../../MessageTypes.mjs";

export class ContextIntent extends GenericIntent {
    static name = "context";

    static getTool() {
        return {
            tool: Context.getToolFunction(),
            allowFollowupToolCalls: true,
            toolFunction: (text, context, parameters) => {
                const startTime = Date.now();
                const result = Context.callModifyContext(context, "modifyInfo", parameters);
                if (result) {
                    return [{
                        type: MessageTypes.systemResponse,
                        text: result.description,
                        timeToResponse: Date.now() - startTime
                    }];
                } else {
                    return [];
                }
            }
        }
    }
}