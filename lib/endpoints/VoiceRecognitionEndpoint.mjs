import {GenericEndpoint} from "./GenericEndpoint.mjs";

export class VoiceRecognitionEndpoint extends GenericEndpoint {
    static method = 'POST';
    static path = '/voice-recognition';
    static handler = (req, res) => {
        const { body } = req;
        console.log(body);
        res.send('No text yet');
    }
}