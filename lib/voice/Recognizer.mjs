export class Recognizer {
    static async recognizeVoice(voiceData, encoding = 'LINEAR16', sampleRateHertz = 16000) {
        const request = {
            model: 'whisper-1',
            file: voiceData,
            language: 'en',
            response_format: 'json',
        };

        try {
            const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
                method: 'POST',
                body: JSON.stringify(request),
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${process.env.OPENAI_KEY}`
                }
            });
            const jsonData = await response.json();
            console.log(jsonData);
            return jsonData[0].text;
        } catch (err) {
            return `Error recognizing text: ${err.message}`;
        }
    }
}