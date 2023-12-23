export class AudioAssistant {
    static async play(url) {
        const audio = new Audio();
        audio.src = url;
        audio.autoplay = true;
        await audio.play();
    }
}