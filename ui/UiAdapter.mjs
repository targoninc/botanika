import {ChatTemplates} from "./templates/ChatTemplates.mjs";

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
        if (!res.type) {
            throw new Error(`Response type not specified.`);
        }
        switch (res.type) {
            case "message":
                UiAdapter.addChatMessage(ChatTemplates.message(res.text));
                break;
            case "history":
                UiAdapter.clearChatMessages();
                for (const message of res.messages) {
                    UiAdapter.addChatMessage(ChatTemplates.message(message));
                }
                break;
            case "error":
                UiAdapter.addChatMessage(ChatTemplates.message(`Error: ${res.message}`));
                break;
            case "voice-recognition":
                UiAdapter.addChatMessage(ChatTemplates.message(res.text));
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