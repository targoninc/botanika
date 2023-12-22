import {ChatTemplates} from "../templates/ChatTemplates.mjs";
import {Synthesizer} from "./Synthesizer.mjs";

export class UiAdapter {
    static addChatMessage(message) {
        const messages = document.querySelector('.chat-box-messages');
        messages.appendChild(message);
    }

    static clearChatMessages() {
        const messages = document.querySelector('.chat-box-messages');
        messages.innerHTML = "";
    }

    static getChatInput() {
        return document.querySelector('.chat-box-input-field')?.value ?? "";
    }

    static getChatMessages() {
        return document.querySelector('.chat-box-messages');
    }

    static setChatInput(value) {
        document.querySelector('.chat-box-input-field').value = value;
    }

    static handleResponse(res) {
        if (res.constructor === Array) {
            for (const r of res) {
                UiAdapter.handleResponse(r);
            }
            return;
        }
        if (!res.type) {
            throw new Error(`Response type not specified.`);
        }
        switch (res.type) {
            case "history":
                UiAdapter.clearChatMessages();
                for (const message of res.messages) {
                    UiAdapter.addChatMessage(ChatTemplates.message(message.type, message.text));
                }
                break;
            case "error":
                UiAdapter.addChatMessage(ChatTemplates.message('error', res.text));
                break;
            case "user-message":
                UiAdapter.addChatMessage(ChatTemplates.message('user', res.text));
                break;
            case "assistant-response":
                UiAdapter.addChatMessage(ChatTemplates.message('assistant', res.text));
                Synthesizer.speak(res.text, window.language);
                break;
            case "system-response":
                UiAdapter.addChatMessage(ChatTemplates.message('system', res.text));
                break;
            case "image":
                UiAdapter.addChatMessage(ChatTemplates.image(res.url));
                break;
            default:
                throw new Error(`Unknown response type: ${res.type}`);
        }
    }

    static updateLoudness(loudness) {
        const loudnessBar = document.querySelector('.loudness-bar');
        loudnessBar.style.width = `${loudness * 100}%`;
    }
}