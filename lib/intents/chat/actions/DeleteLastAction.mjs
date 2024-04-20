import {TextParser} from "../../../parsers/TextParser.mjs";

export class DeleteLastAction {
    static execute(text, context) {
        const startTime = Date.now();
        const deleteCount = DeleteLastAction.getParameter(text);
        if (deleteCount > context.history.length) {
            return [{
                type: "system-response",
                text: "Cannot delete more messages than there are",
                timeToResponse: Date.now() - startTime
            }];
        }
        if (deleteCount === context.history.length) {
            context.history = [];
            return [{
                type: "system-response",
                text: "Deleted all messages",
                timeToResponse: Date.now() - startTime
            }];
        }
        if (deleteCount === 1) {
            context.history.pop();
            return [{
                type: "system-response",
                text: "Deleted last message",
                timeToResponse: Date.now() - startTime
            }];
        }
        if (deleteCount === 0) {
            return [{
                type: "system-response",
                text: "Nothing to delete",
                timeToResponse: Date.now() - startTime
            }];
        }
        context.history = context.history.slice(0, -deleteCount);
        return [{
            type: "system-response",
            text: "Deleted last " + deleteCount + " messages",
            timeToResponse: Date.now() - startTime
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