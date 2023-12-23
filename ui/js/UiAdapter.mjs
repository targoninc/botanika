import {ChatTemplates} from "../templates/ChatTemplates.mjs";
import {Synthesizer} from "./Synthesizer.mjs";

export class UiAdapter {
    static addChatMessage(message) {
        const messages = document.querySelector('.chat-box-messages');
        messages.appendChild(message);
        message.scrollIntoView();
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

    static handleMessages(res, open, speak) {
        if (res.constructor === Array) {
            for (const r of res) {
                UiAdapter.handleMessages(r, open, speak);
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
                if (speak) {
                    Synthesizer.speak(res.text, window.language);
                }
                break;
            case "assistant-data":
                UiAdapter.addChatMessage(ChatTemplates.data(res.text));
                break;
            case "system-response":
                UiAdapter.addChatMessage(ChatTemplates.message('system', res.text));
                break;
            case "open-command":
                UiAdapter.addChatMessage(ChatTemplates.message('system', res.text));
                if (open) {
                    window.open(res.url, '_blank');
                }
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
        if (!loudnessBar) {
            return;
        }
        loudnessBar.style.width = `${loudness * 100}%`;
    }

    static showLoginError(error) {
        const loginError = document.querySelector('.login-error');
        loginError.innerHTML = error;
    }

    static removeSpotifyLoginButton() {
        const spotifyLoginButton = document.querySelector('.spotify-login-button');
        if (spotifyLoginButton) {
            spotifyLoginButton.remove();
        }
    }
}