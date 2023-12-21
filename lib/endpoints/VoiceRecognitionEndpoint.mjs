import {GenericEndpoint} from "./GenericEndpoint.mjs";
import {Recognizer} from "../voice/Recognizer.mjs";
import {IntentAction} from "../actions/IntentAction.mjs";
import {GenericResponseAction} from "../actions/GenericResponseAction.mjs";

export class VoiceRecognitionEndpoint extends GenericEndpoint {
    static method = 'POST';
    static path = '/voice-recognition';
    static async handler(req, res, context)  {
        const file = req.file;
        const text = await Recognizer.recognizeVoice(file);
        let responses = [];
        console.log(text);
        if (text.startsWith("Error")) {
            responses.push({
                type: "error",
                text
            });
        } else {
            responses.push({
                type: "voice-recognition",
                text
            });
            const intent = IntentAction.getIntendedAction(text);
            if (intent) {
                responses = responses.concat(intent.execute(text, context));
            } else {
                const responseText = GenericResponseAction.getResponse(text);
                if (responseText) {
                    responses.push({
                        type: "assistant-response",
                        text: responseText
                    });
                }
            }
        }
        res.send(responses);
    }
}