import {OpenAiTranscriptionProvider} from "./OpenAiTranscriptionProvider.mjs";

export class Recognizer {
    static getProvider() {
        if (!process.env.OPENAI_API_KEY || process.env.TRANSCRIPTION_PROVIDER !== 'openai') {
            //return LocalWhisperTranscriptionProvider;
        }

        return OpenAiTranscriptionProvider;
    }

    static async recognizeVoice(file) {
        const provider = Recognizer.getProvider();
        if (!provider) {
            return "Error recognizing text: No provider available";
        }

        return await provider.transcribe(file);
    }
}