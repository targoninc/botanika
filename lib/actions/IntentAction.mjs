import {WeatherIntent} from "../intents/WeatherIntent.mjs";
import {DisabledIntent} from "../intents/DisabledIntent.mjs";
import {ResponseIntent} from "../intents/ResponseIntent.mjs";
import {DatabaseIntent} from "../intents/DatabaseIntent.mjs";
import {OpenIntent} from "../intents/OpenIntent.mjs";
import {MusicIntent} from "../intents/MusicIntent.mjs";
import {ChatIntent} from "../intents/chat/ChatIntent.mjs";
import {TestIntent} from "../intents/TestIntent.mjs";
import {CreateFileIntent} from "../intents/CreateFileIntent.mjs";

export class IntentAction {
    static getIntendedAction(text, context) {
        const intent = IntentAction.intents.find(i => i.isIntended(text, context));
        if (intent) {
            return intent;
        }
        return null;
    }

    static intents = [
        TestIntent,
        OpenIntent,
        WeatherIntent,
        MusicIntent,
        DatabaseIntent,
        CreateFileIntent,
        ChatIntent
    ];

    static async getIntentAndRespond(text, context, responses) {
        const intent = IntentAction.getIntendedAction(text, context);
        if (intent) {
            if (intent.isDisabled()) {
                responses = await DisabledIntent.execute(intent.name);
            } else {
                let newResponses = await intent.execute(text, context);
                if (!newResponses) {
                    newResponses = await ResponseIntent.execute(text, context);
                }
                responses = responses.concat(newResponses);
            }
        } else {
            responses = responses.concat(await ResponseIntent.execute(text, context));
        }
        return responses;
    }
}