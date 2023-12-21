import {GenericResponseAction} from "./GenericResponseAction.mjs";

export class IntentAction {
    static getIntendedAction(text) {
        return null;
    }

    static async getIntentAndRespond(text, context, responses) {
        const intent = IntentAction.getIntendedAction(text);
        if (intent) {
            responses = responses.concat(intent.execute(text, context));
        } else {
            const responseText = await GenericResponseAction.getResponse(text);
            if (responseText) {
                responses.push({
                    type: "assistant-response",
                    text: responseText
                });
            }
        }
        return responses;
    }
}