import {TextParser} from "../../parsers/TextParser.mjs";
import {GenericIntent} from "../GenericIntent.mjs";
import {ResetChatAction} from "./actions/ResetChatAction.mjs";
import {DeleteLastAction} from "./actions/DeleteLastAction.mjs";

export class ChatIntent extends GenericIntent {
    static name = "chat";

    static isIntended(text) {
        const words = [
            "chat",
            "message",
            "messages",
            "nachricht",
            "nachrichten",
        ];
        return words.some(word => TextParser.includesWord(text, word));
    }

    static async execute(text, context) {
        const possibleActions = [
            ResetChatAction,
            DeleteLastAction
        ];
        for (const action of possibleActions) {
            if (action.isIntended(text)) {
                return action.execute(text, context);
            }
        }
    }
}