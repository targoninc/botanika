import {WeatherIntent} from "../intents/WeatherIntent.mjs";
import {DisabledIntent} from "../intents/DisabledIntent.mjs";
import {OpenAiIntent} from "../intents/OpenAiIntent.mjs";

export class IntentAction {
    static getIntendedAction(text, language) {
        const intent = IntentAction.intents.find(i => i.isIntended(text, language));
        if (intent) {
            return intent;
        }
        return null;
    }

    static intents = [
        WeatherIntent
    ];

    static async getIntentAndRespond(text, context, responses) {
        const intent = IntentAction.getIntendedAction(text, context.user.language);
        if (intent) {
            if (intent.isDisabled()) {
                responses = await DisabledIntent.execute(intent.name);
            } else {
                responses = responses.concat(await intent.execute(text, context));
            }
        } else {
            responses = responses.concat(await OpenAiIntent.execute(text, context));
        }
        return responses;
    }
}