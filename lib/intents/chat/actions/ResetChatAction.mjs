import {TextParser} from "../../../parsers/TextParser.mjs";

export class ResetChatAction {
    static execute(text, context) {
        context.history = [];
        return [{
            type: "system-response",
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