import {MessageTypes} from "../../../context/MessageTypes.mjs";

export class ResetChatAction {
    static execute(text, context) {
        context.history = [];
        return [{
            type: MessageTypes.systemResponse,
            text: "Started a new chat",
        }];
    }
}