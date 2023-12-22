import {GenericEndpoint} from "./GenericEndpoint.mjs";
import {Recognizer} from "../voice/Recognizer.mjs";
import {IntentAction} from "../actions/IntentAction.mjs";
import {TextParser} from "../parsers/TextParser.mjs";

export class VoiceRecognitionEndpoint extends GenericEndpoint {
    static method = 'POST';
    static path = '/voice-recognition';
    static async handler(req, res, context)  {
        const file = req.file;
        if (!process.env.OPENAI_API_KEY) {
            res.send([{
                type: "assistant-response",
                text: "No OpenAI API key found. Please set OPENAI_API_KEY in your environment."
            }]);
            return;
        }
        let text = await Recognizer.recognizeVoice(file);
        let responses = [];
        if (text.startsWith("Error")) {
            responses.push({
                type: "error",
                text
            });
        } else {
            text = TextParser.getValidTextForLanguage(text, "de");
            if (text.trim().length > 0) {
                responses.push({
                    type: "voice-recognition",
                    text
                });
                responses = await IntentAction.getIntentAndRespond(text, context, responses);
            }
        }
        context.history.concat(responses);
        res.send(responses);
    }
}