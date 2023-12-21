export class Synthesizer {
    static speak(text, lang = 'en') {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        if (lang === 'de') {
            utterance.lang = 'de-DE';
        }
        speechSynthesis.speak(utterance);
    }
}