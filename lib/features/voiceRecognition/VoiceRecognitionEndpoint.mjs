import {GenericEndpoint} from "../../endpoints/GenericEndpoint.mjs";
import {Recognizer} from "./Recognizer.mjs";
import {IntentAction} from "../../actions/IntentAction.mjs";
import {TextParser} from "../../tooling/TextParser.mjs";
import {ResponseHelper} from "../../tooling/ResponseHelper.mjs";
import {AudioFileConverter} from "../../tooling/AudioFileConverter.mjs";
import {CLI} from "../../tooling/CLI.mjs";

export class VoiceRecognitionEndpoint extends GenericEndpoint {
    static method = 'POST';
    static path = '/voice-recognition';
    static async handler(req, res, context, db)  {
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
            CLI.debug(`Error in voice recognition, file format is ${fileFormat}`);
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
        await db.updateContext(req.user.id, JSON.stringify(context));
        return context;
    }
}