import {Api} from "./Api.mjs";
import {UiAdapter} from "./UiAdapter.mjs";
import {ChatTemplates} from "./templates/ChatTemplates.mjs";

export class VoiceRecorder {
    constructor() {
        this.threshold = 0.05;
        this.timeout = 2000;
        this.silence = true;
        this.audioChunks = [];
        this.timeoutHandle = null;
        this.currentVolume = 0;
    }

    start() {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                this.mediaRecorder = new MediaRecorder(stream);
                this.audioContext = new AudioContext();
                const source = this.audioContext.createMediaStreamSource(stream);
                const processor = this.audioContext.createScriptProcessor(1024, 1, 1);
                source.connect(processor);
                processor.connect(this.audioContext.destination);
                processor.onaudioprocess = this.processAudio.bind(this);
                this.mediaRecorder.start();
            });
    }

    processAudio(event) {
        const input = event.inputBuffer.getChannelData(0);
        let sum = 0.0;
        for(let i = 0; i < input.length; ++i) {
            sum += input[i] * input[i];
        }
        const level = Math.sqrt(sum / input.length);
        this.currentVolume = level;
        if (level > this.threshold) {
            const chunk = input.slice(0);
            this.audioChunks.push(chunk);
            this.lastDataTime = Date.now();
        } else {
            if (this.lastDataTime && Date.now() - this.lastDataTime > this.timeout) {
                this.sendAudio();
                this.audioChunks = [];
                this.lastDataTime = null;
            }
        }
    }

    stop() {
        if (this.mediaRecorder) {
            this.mediaRecorder.stop();
        }
    }

    sendAudio() {
        if (!this.audioChunks.length) {
            return;
        }

        const audioBlob = new Blob(this.audioChunks, {type: 'audio/ogg; codecs=opus'});
        const formData = new FormData();
        formData.append('file', audioBlob);
        Api.VoiceRecognition(formData).then((res) => {
            const messages = UiAdapter.getChatMessages();
            messages.appendChild(ChatTemplates.message(res));
        });
    }
}