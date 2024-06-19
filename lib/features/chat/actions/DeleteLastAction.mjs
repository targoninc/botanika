import {MessageTypes} from "../../../context/MessageTypes.mjs";

export class DeleteLastAction {
    static execute(text, context, deleteCount) {
        const startTime = Date.now();
        if (deleteCount > context.history.length) {
            return [{
                type: MessageTypes.systemResponse,
                text: "Cannot delete more messages than there are",
                timeToResponse: Date.now() - startTime
            }];
        }
        if (deleteCount === context.history.length) {
            context.history = [];
            return [{
                type: MessageTypes.systemResponse,
                text: "Deleted all messages",
                timeToResponse: Date.now() - startTime
            }];
        }
        if (deleteCount === 1) {
            context.history.pop();
            return [{
                type: MessageTypes.systemResponse,
                text: "Deleted last message",
                timeToResponse: Date.now() - startTime
            }];
        }
        if (deleteCount === 0) {
            return [{
                type: MessageTypes.systemResponse,
                text: "Nothing to delete",
                timeToResponse: Date.now() - startTime
            }];
        }
        context.history = context.history.slice(0, -deleteCount);
        return [{
            type: MessageTypes.systemResponse,
            text: "Deleted last " + deleteCount + " messages",
            timeToResponse: Date.now() - startTime
        }];
    }
}