import {TextToSpeechAction} from "../actions/TextToSpeechAction.mjs";

export class ResponseHelper {
    static async sendResponse(res, responses, context) {
        context.history = context.history.concat(responses);
        context.modified = true;
        if (process.env.VOICE_ENABLED === "true") {
            const assistantResponse = responses.find(r => r.type === 'assistant-response');
            if (assistantResponse) {
                const speech = await TextToSpeechAction.getSpeech(assistantResponse.text, assistantResponse.canBeCached);
                res.send({
                    responses,
                    context,
                    speech
                });
                return;
            }
        }
        res.send({
            responses,
            context,
            speech: null
        });
    }
}