import {GenericEndpoint} from "./GenericEndpoint.mjs";
import {Recognizer} from "../voice/Recognizer.mjs";
import {IntentAction} from "../actions/IntentAction.mjs";

export class VoiceRecognitionEndpoint extends GenericEndpoint {
    static method = 'POST';
    static path = '/voice-recognition';
    static async handler(req, res, context)  {
        const file = req.file;
        const text = await Recognizer.recognizeVoice(file);
        let responses = [];
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
            responses = await IntentAction.getIntentAndRespond(text, context, responses);
        }
        context.history.concat(responses);
        res.send(responses);
    }
}