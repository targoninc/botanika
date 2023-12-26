import {TextToSpeechAction} from "../actions/TextToSpeechAction.mjs";

export class ResponseHelper {
    static async sendResponse(req, res, responses, context) {
        context.history = context.history.concat(responses);
        if (process.env.VOICE_ENABLED === "true" && !context.assistant.muted) {
            const assistantResponse = responses.find(r => r.type === 'assistant-response');
            if (assistantResponse) {
                const speech = await TextToSpeechAction.getSpeech(req.requestId, assistantResponse.text, context, assistantResponse.canBeCached);
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