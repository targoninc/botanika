import {TextParser} from "../../../tooling/TextParser.mjs";
import {MessageTypes} from "../../../context/MessageTypes.mjs";

export class ResetChatAction {
    static execute(text, context) {
        context.history = [];
        return [{
            type: MessageTypes.systemResponse,
            text: "Started a new chat",
        }];
    }

    static isIntended(text) {
        const words = [
            "start a new",
            "restart",
            "new",
            "neu",
            "neuen",
            "von vorne",
        ];
        return words.some(word => TextParser.includesWord(text, word));
    }
}