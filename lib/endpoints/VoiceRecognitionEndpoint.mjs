import {GenericEndpoint} from "./GenericEndpoint.mjs";
import {Recognizer} from "../voice/Recognizer.mjs";

export class VoiceRecognitionEndpoint extends GenericEndpoint {
    static method = 'POST';
    static path = '/voice-recognition';
    static handler = async (req, res) => {
        const file = req.file;
        const text = await Recognizer.recognizeVoice(file);
        res.send({
            type: "voice-recognition",
            text
        });
    }
}