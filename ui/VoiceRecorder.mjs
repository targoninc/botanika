import {Api} from "./Api.mjs";
import {UiAdapter} from "./UiAdapter.mjs";
import {ChatTemplates} from "./templates/ChatTemplates.mjs";

export class VoiceRecorder {
    constructor() {
        this.threshold = 0.005;
        this.timeout = 2000;
        this.audioChunks = [];
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

                this.mediaRecorder.ondataavailable = e => {
                    this.audioChunks.push(e.data);
                };
                this.dataInterval = setInterval(() => {
                    this.mediaRecorder.requestData();
                }, 1000);
                this.mediaRecorder.start();
            });
    }

    async processAudio(event) {
        const input = event.inputBuffer.getChannelData(0);
        let sum = 0.0;
        for (let i = 0; i < input.length; ++i) {
            sum += input[i] * input[i];
        }
        const level = Math.sqrt(sum / input.length);
        this.currentVolume = level;
        if (level > this.threshold) {
            this.lastDataTime = Date.now();
        } else {
            if (this.lastDataTime && Date.now() - this.lastDataTime > this.timeout && !this.processing) {
                this.processing = true;
                await this.sendAudio();
                this.processing = false;
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

    async sendAudio() {
        if (!this.audioChunks.length || this.audioChunks.length === 0) {
            return;
        }
        console.log('sending audio', this.audioChunks);

        const audioBlob = new Blob(this.audioChunks, {type: 'audio/webm; codecs=opus'});
        const formData = new FormData();
        formData.append('file', audioBlob);
        const res = await Api.VoiceRecognition(formData)
        UiAdapter.handleResponse(res);
    }
}