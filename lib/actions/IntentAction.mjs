import {GenericResponseAction} from "./GenericResponseAction.mjs";
import {WeatherIntent} from "../intents/WeatherIntent.mjs";

export class IntentAction {
    static getIntendedAction(text) {
        const intent = IntentAction.intents.find(i => i.isIntended(text));
        if (intent) {
            return intent;
        }
        return null;
    }

    static intents = [
        WeatherIntent
    ];

    static async getIntentAndRespond(text, context, responses) {
        const intent = IntentAction.getIntendedAction(text);
        if (intent) {
            responses = responses.concat(intent.execute(text, context));
        } else {
            const res = await GenericResponseAction.getResponse(text);
            if (res) {
                responses.push({
                    type: "assistant-response",
                    text: res.text,
                    language: res.language
                });
            }
        }
        return responses;
    }
}