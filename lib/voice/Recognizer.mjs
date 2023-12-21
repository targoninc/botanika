import { Readable } from 'stream';
import FormData from "form-data";
import axios from "axios";

export class Recognizer {
    static async recognizeVoice(file) {
        const formData = new FormData();
        formData.append('model', 'whisper-1');
        const fileStream = new Readable();
        fileStream.push(file.buffer);
        fileStream.push(null);

        formData.append('file', fileStream, {
            filename: 'audio.webm',
            contentType: 'audio/webm; codecs=opus',
            knownLength: file.size
        });
        formData.append('response_format', 'json');
        try {
            const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Bearer ${process.env.OPENAI_KEY}`
                },
                validateStatus: () => true
            });
            if (response.status !== 200) {
                console.log(response.data);
                throw new Error(`Response status code: ${response.status}`);
            }
            const data = await response.data;
            return data.text;
        } catch (err) {
            return `Error recognizing text: ${err}`;
        }
    }
}