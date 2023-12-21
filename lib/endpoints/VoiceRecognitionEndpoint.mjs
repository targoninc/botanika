import {GenericEndpoint} from "./GenericEndpoint.mjs";
import {Recognizer} from "../voice/Recognizer.mjs";

export class VoiceRecognitionEndpoint extends GenericEndpoint {
    static method = 'POST';
    static path = '/voice-recognition';
    static handler = async (req, res) => {
        const {body} = req;
        const {data, encoding, sampleRate} = body;
        if (!data) {
            res.status(400).send('No voice data');
            return;
        }
        const text = await Recognizer.recognizeVoice(data, encoding, sampleRate);
        res.send(text);
    }
}