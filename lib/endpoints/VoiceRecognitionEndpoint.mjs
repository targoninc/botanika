import {GenericEndpoint} from "./GenericEndpoint.mjs";
import {Recognizer} from "../voice/Recognizer.mjs";
import {IntentAction} from "../actions/IntentAction.mjs";
import {TextParser} from "../parsers/TextParser.mjs";
import {ResponseHelper} from "../context/ResponseHelper.mjs";
import {AudioFileConverter} from "../AudioFileConverter.mjs";
import {CLI} from "../CLI.mjs";

export class VoiceRecognitionEndpoint extends GenericEndpoint {
    static method = 'POST';
    static path = '/voice-recognition';
    static async handler(req, res, context)  {
        let file = req.file;
        if (!process.env.OPENAI_API_KEY) {
            res.send([{
                type: "assistant-response",
                text: "No OpenAI API key found. Please set OPENAI_API_KEY in your environment."
            }]);
            return;
        }
        const fileFormat = file.mimetype.split("/")[1];
        const supportedFormats = ["flac", "m4a", "mp3", "mp4", "mpeg", "mpga", "oga", "ogg", "wav", "webm"];
        if (!supportedFormats.includes(fileFormat)) {
            CLI.warning(`Unsupported file format: ${fileFormat}`);
            file = AudioFileConverter.convertToMp3(file);
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
                    type: "user-message",
                    text
                });
                responses = await IntentAction.getIntentAndRespond(text, context, responses);
            }
        }
        await ResponseHelper.sendResponse(req, res, responses, context);
    }
}