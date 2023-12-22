import {GenericResponseAction} from "./GenericResponseAction.mjs";
import {WeatherIntent} from "../intents/WeatherIntent.mjs";
import {TextParser} from "../parsers/TextParser.mjs";
import {DisabledIntent} from "../intents/DisabledIntent.mjs";

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
            if (intent.isDisabled()) {
                responses = await DisabledIntent.execute(intent.name);
            } else {
                responses = responses.concat(await intent.execute(text, context));
            }
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