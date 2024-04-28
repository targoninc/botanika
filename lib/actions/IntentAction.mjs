import {WeatherIntent} from "../features/weather/WeatherIntent.mjs";
import {ResponseIntent} from "../features/response/ResponseIntent.mjs";
import {DatabaseIntent} from "../intents/DatabaseIntent.mjs";
import {OpenIntent} from "../features/open/OpenIntent.mjs";
import {SpotifyIntent} from "../features/spotify/SpotifyIntent.mjs";
import {ChatIntent} from "../features/chat/ChatIntent.mjs";
import {TestIntent} from "../intents/TestIntent.mjs";
import {CreateFileIntent} from "../features/files/CreateFileIntent.mjs";

export class IntentAction {
    static getIntendedActions(text, context) {
        const intents = IntentAction.intents.filter(i => i.isIntended(text, context));
        if (intents) {
            return intents;
        }
        return null;
    }

    static intents = [
        TestIntent,
        OpenIntent,
        WeatherIntent,
        SpotifyIntent,
        DatabaseIntent,
        CreateFileIntent,
        ChatIntent
    ];

    static async getIntentAndRespond(text, context, responses) {
        const intents = IntentAction.getIntendedActions(text, context);
        let addedResponses = [];
        if (intents) {
            for (const intent of intents) {
                if (!intent.isDisabled()) {
                    let newResponses = await intent.execute(text, context);
                    if (newResponses) {
                        addedResponses = addedResponses.concat(newResponses);
                    }
                }
            }
            if (addedResponses.length === 0) {
                responses = responses.concat(await ResponseIntent.execute(text, context));
            } else {
                responses = responses.concat(addedResponses);
            }
        } else {
            responses = responses.concat(await ResponseIntent.execute(text, context));
        }
        return responses;
    }
}