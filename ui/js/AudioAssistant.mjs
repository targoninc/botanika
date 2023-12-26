import {Api} from "./Api.mjs";

export class AudioAssistant {
    static async play(url) {
        const audio = new Audio();
        audio.src = url;
        audio.autoplay = true;
        await audio.play();
    }

    static async toggleMute() {
        try {
            await Api.toggleAssistantMute();
            const muteButton = document.getElementById('mute-button');
            const isMuted = muteButton.classList.contains('muted');
            if (isMuted) {
                muteButton.classList.remove('muted');
                muteButton.innerText = 'Mute assistant';
            } else {
                muteButton.classList.add('muted');
                muteButton.innerText = 'Unmute assistant';
            }
        } catch (e) {
            console.error(e);
        }
    }
}