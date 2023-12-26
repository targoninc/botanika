import {TextParser} from "../../../parsers/TextParser.mjs";

export class DeleteLastAction {
    static execute(text, context) {
        const deleteCount = DeleteLastAction.getParameter(text);
        if (deleteCount > context.history.length) {
            return [{
                type: "system-response",
                text: "Cannot delete more messages than there are",
            }];
        }
        if (deleteCount === context.history.length) {
            context.history = [];
            return [{
                type: "system-response",
                text: "Deleted all messages",
            }];
        }
        if (deleteCount === 1) {
            context.history.pop();
            return [{
                type: "system-response",
                text: "Deleted last message",
            }];
        }
        if (deleteCount === 0) {
            return [{
                type: "system-response",
                text: "Nothing to delete",
            }];
        }
        context.history = context.history.slice(0, -deleteCount);
        return [{
            type: "system-response",
            text: "Deleted last " + deleteCount + " messages",
        }];
    }

    static getParameter(text) {
        const words = [
            "one",
            "two",
            "three",
            "four",
            "five",
            "six",
            "seven",
            "eight",
            "nine",
            "ten",
            "eleven",
            "twelve",
            "thirteen"
        ];
        const word = words.find(word => TextParser.includesWord(text, word));
        return word ? words.indexOf(word) + 1 : 1;
    }

    static isIntended(text) {
        const words = [
            "erase",
            "clear",
            "delete",
            "lösch",
            "lösche",
            "entferne"
        ];
        return words.some(word => TextParser.includesWord(text, word));
    }
}