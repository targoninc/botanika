import {ResponseIntent} from "../features/response/ResponseIntent.mjs";
import {CLI} from "../tooling/CLI.mjs";

export class IntentAction {
    static getIntendedActions(text, context, availableIntents) {
        const intents = availableIntents.filter(i => i.isIntended(text, context));
        if (intents) {
            return intents;
        }
        return null;
    }

    static async getIntentAndRespond(text, context, responses, availableIntents) {
        const intents = IntentAction.getIntendedActions(text, context, availableIntents);
        let addedResponses = [];
        if (intents) {
            for (const intent of intents) {
                if (!intent.isDisabled()) {
                    CLI.debug(`Executing intent ${intent.name}`);
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