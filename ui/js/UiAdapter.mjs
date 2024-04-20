import {ChatTemplates} from "../templates/ChatTemplates.mjs";
import {Synthesizer} from "./Synthesizer.mjs";
import {AudioAssistant} from "./AudioAssistant.mjs";

export class UiAdapter {
    static addChatMessage(domNode, time = null) {
        const messages = document.querySelector('.chat-box-messages');
        messages.appendChild(ChatTemplates.messageContainer(domNode, time));
        domNode.scrollIntoView();
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

    static setHistory(res, open, speak) {
        const messages = document.querySelector('.chat-box-messages');
        messages.innerHTML = "";
        for (const r of res) {
            const isLast = res.indexOf(r) === res.length - 1;
            UiAdapter.handleMessage(r, open, speak && isLast);
        }
    }

    static handleMessage(res, open, speak) {
        if (!res.type) {
            throw new Error(`Response type not specified.`);
        }
        switch (res.type) {
            case "history":
                UiAdapter.clearChatMessages();
                for (const message of res.messages) {
                    UiAdapter.addChatMessage(ChatTemplates.message(message.type, message.text), message.timeToResponse);
                }
                break;
            case "error":
                UiAdapter.addChatMessage(ChatTemplates.message('error', res.text));
                break;
            case "user-message":
                UiAdapter.addChatMessage(ChatTemplates.message('user', res.text), res.timeToResponse);
                break;
            case "assistant-response":
                UiAdapter.addChatMessage(ChatTemplates.message('assistant', res.text), res.timeToResponse);
                if (speak) {
                    Synthesizer.speak(res.text, window.language);
                }
                break;
            case "assistant-data":
                UiAdapter.addChatMessage(ChatTemplates.data(res.text), res.timeToResponse);
                break;
            case "system-response":
                UiAdapter.addChatMessage(ChatTemplates.message('system', res.text), res.timeToResponse);
                break;
            case "open-command":
                UiAdapter.addChatMessage(ChatTemplates.message('system', res.text), res.timeToResponse);
                if (open) {
                    window.open(res.url, '_blank');
                }
                break;
            case "image":
                UiAdapter.addChatMessage(ChatTemplates.image(res.url), res.timeToResponse);
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

    static activateSpotifyLoginButton() {
        const spotifyLoginButton = document.querySelector('.spotify-button');
        if (spotifyLoginButton) {
            spotifyLoginButton.classList.add('active');
            spotifyLoginButton.innerText = "Spotify";
            spotifyLoginButton.onclick = () => {
                window.open('/api/spotify-logout', '_blank');
            }
        }
    }

    static deactivateSpotifyLoginButton() {
        const spotifyLoginButton = document.querySelector('.spotify-button');
        if (spotifyLoginButton) {
            spotifyLoginButton.classList.remove('active');
            spotifyLoginButton.innerText = "Login to Spotify";
            spotifyLoginButton.onclick = () => {
                window.open('/api/spotify-login', '_blank');
            }
        }
    }

    static removeLoading() {
        const loadingMessage = document.querySelector('.loading-message');
        if (loadingMessage) {
            loadingMessage.remove();
        }
    }

    static afterMessage(res) {
        UiAdapter.removeLoading();
        if (res.error) {
            UiAdapter.addChatMessage(ChatTemplates.message('error', res.error));
            return false;
        }

        window.language = res.context.user.language;
        const speech = res.speech;
        if (speech) {
            AudioAssistant.play(speech).then();
        }
        const fallbackToNativeSpeech = !speech && !res.context.assistant.muted;
        const shouldOpen = res.responses.some(r => r.type === "open-command");
        UiAdapter.setHistory(res.context.history, shouldOpen, fallbackToNativeSpeech);
        return true;
    }
}