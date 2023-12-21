import {ChatTemplates} from "./templates/ChatTemplates.mjs";
import {UiAdapter} from "./UiAdapter.mjs";
import {Api} from "./Api.mjs";

export class VoiceRecorder {
    static start() {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const mediaRecorder = new MediaRecorder(stream);
                const audioChunks = [];
                mediaRecorder.addEventListener('dataavailable', event => {
                    audioChunks.push(event.data);
                });
                mediaRecorder.addEventListener('stop', () => {
                    const audioBlob = new Blob(audioChunks);
                    this.sendAudio(audioBlob);
                });
                mediaRecorder.start();
                setTimeout(() => {
                    mediaRecorder.stop();
                }, 5000);
            });
    }

    static sendAudio(audioBlob) {
        Api.VoiceRecognition(audioBlob, 'LINEAR16', 16000).then((res) => {
            const messages = UiAdapter.getChatMessages();
            messages.appendChild(ChatTemplates.message(res));
        });
    }
}