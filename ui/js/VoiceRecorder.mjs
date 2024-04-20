import {Api} from "./Api.mjs";
import {UiAdapter} from "./UiAdapter.mjs";
import {ChatTemplates} from "../templates/ChatTemplates.mjs";

export class VoiceRecorder {
    constructor() {
        this.threshold = 0.015;
        this.timeout = 2000;
        this.audioChunks = [];
        this.currentVolume = 0;
        this.sum = 0.0;
        this.recording = false;
    }

    static start() {
        window.recorder.start();
    }

    static stop() {
        window.recorder.stop();
    }

    static toggleRecording() {
        if (window.recorder.recording) {
            window.recorder.stop();
        } else {
            window.recorder.start();
        }
    }

    start() {
        this.recording = true;
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                this.mediaRecorder = new MediaRecorder(stream);
                this.audioContext = new AudioContext();
                const source = this.audioContext.createMediaStreamSource(stream);
                const processor = this.audioContext.createScriptProcessor(1024, 1, 1);
                source.connect(processor);
                processor.connect(this.audioContext.destination);
                processor.onaudioprocess = this.processAudio.bind(this);

                this.chunkCounter = 0;
                this.mediaRecorder.ondataavailable = e => {
                    this.chunkCounter++;
                    if (this.chunkCounter === 1) {
                        this.audioHeader = e.data;
                    } else {
                        this.audioChunks.push(e.data);
                    }
                };

                this.dataInterval = setInterval(() => {
                    if (!this.recording) {
                        return;
                    }
                    this.mediaRecorder.requestData();
                }, 1000);
                this.mediaRecorder.start();
            });
    }

    async processAudio(event) {
        if (!this.recording) {
            this.lastDataTime = Date.now();
            this.sum = 0.0;
            return;
        }
        const input = event.inputBuffer.getChannelData(0);
        let sum = 0.0;
        for (let i = 0; i < input.length; ++i) {
            sum += input[i] * input[i];
        }
        const level = Math.sqrt(sum / input.length);
        this.currentVolume = level;
        if (level > this.threshold) {
            this.lastDataTime = Date.now();
            this.sum += level;
        } else {
            if (this.lastDataTime && Date.now() - this.lastDataTime > this.timeout && !this.processing) {
                await this.sendAudio();
                this.sum = 0.0;
            }
        }
    }

    stop() {
        if (this.mediaRecorder) {
            this.mediaRecorder.stop();
        }
        this.dataInterval && clearInterval(this.dataInterval);
        this.recording = false;
    }

    getAverageVolume(chunks) {
        return this.sum / chunks.length;
    }

    async sendAudio() {
        if (this.audioChunks.length === 0) {
            return;
        }

        const averageVolume = this.getAverageVolume(this.audioChunks);
        if (averageVolume < this.threshold * 2) {
            return;
        }

        this.processing = true;
        const allAudioData = [this.audioHeader, ...this.audioChunks];
        const audioBlob = new Blob(allAudioData, {type: 'audio/webm; codecs=opus'});

        const formData = new FormData();
        formData.append('file', audioBlob);
        UiAdapter.addChatMessage(ChatTemplates.loading());
        const res = await Api.VoiceRecognition(formData);
        if (!UiAdapter.afterMessage(res)) {
            return;
        }

        this.audioChunks = [];
        this.processing = false;
        this.lastDataTime = null;
    }
}