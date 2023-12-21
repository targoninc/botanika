import speech from '@google-cloud/speech';

export class Recognizer {
    static async recognizeVoice(voiceData, encoding = 'LINEAR16', sampleRateHertz = 16000) {
        const client = new speech.SpeechClient();

        const audio = {
            content: voiceData,
        };

        const config = {
            encoding,
            sampleRateHertz,
            languageCode: 'en-US',
        };

        const request = {
            audio: audio,
            config: config,
        };

        try {
            const [response] = await client.recognize(request);
            const transcription = response.results
                .map(result => result.alternatives[0].transcript)
                .join('\n');
            return transcription;
        } catch (err) {
            return `Error recognizing text: ${err.message}`;
        }
    }
}