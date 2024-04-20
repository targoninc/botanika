import {Api} from "./Api.mjs";

export class AudioAssistant {
    static async play(url) {
        const audio = new Audio();
        audio.src = url;
        audio.autoplay = true;
        await audio.play();
    }

    static async toggleMute(muteState) {
        try {
            await Api.toggleAssistantMute();
            muteState.value = !muteState.value;
        } catch (e) {
            console.error(e);
        }
    }
}