import {Api} from "./Api.mjs";
import {UiAdapter} from "./UiAdapter.mjs";
import {ChatTemplates} from "./templates/ChatTemplates.mjs";

export class VoiceRecorder {
    constructor() {
        this.threshold = 0.05; // define your threshold here
        this.timeout = 2000;
        this.silence = true;
        this.start_time = null;
        this.audioChunks = [];
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

        if (level > this.threshold) {
            if (this.silence) {
                this.start_time = Date.now();
                this.silence = false;
            }
            this.audioChunks.push(event.data);
        } else if (!this.silence) {
            this.silence = true;

            if ((Date.now() - this.start_time) > this.threshold) {
                this.sendAudio();
            }
            this.audioChunks = [];
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
        Api.VoiceRecognition(audioBlob, 'LINEAR16', 16000).then((res) => {
            const messages = UiAdapter.getChatMessages();
            messages.appendChild(ChatTemplates.message(res));
        });
    }
}