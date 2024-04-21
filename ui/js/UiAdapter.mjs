import {ChatTemplates} from "../templates/ChatTemplates.mjs";
import {Synthesizer} from "./Synthesizer.mjs";
import {AudioAssistant} from "./AudioAssistant.mjs";
import {Api} from "./Api.mjs";
import {store} from "https://fjs.targoninc.com/f.js";
import {MessageTypes} from "./MessageTypes.mjs";
import {GenericTemplates} from "../templates/GenericTemplates.mjs";

export class UiAdapter {
    /**
     *
     * @param domNode {HTMLElement}
     * @param type {string|string[]}
     * @param time {number|null}
     */
    static addChatMessage(domNode, type = "system", time = null) {
        const messages = document.querySelector('.chat-box-messages');
        messages.appendChild(ChatTemplates.messageContainer(domNode, type, time));
        domNode.scrollIntoView();
    }

    static clearChatMessages() {
        const messages = document.querySelector('.chat-box-messages');
        messages.innerHTML = "";
    }

    static sendCurrentMessage() {
        const input = UiAdapter.getChatInput();
        if (input === "") {
            return;
        }
        store().get("isSending").value = true;
        UiAdapter.addChatMessage(ChatTemplates.message("user", input), "user");
        UiAdapter.addChatMessage(ChatTemplates.loading(), "loading");
        UiAdapter.setChatInput("");
        Api.SendMessage(input).then((res) => {
            UiAdapter.afterMessage(res);
            store().get("isSending").value = false;
            UiAdapter.focusChatInput();
        });
    }

    static async resetContext() {
        const res = await Api.resetContext();
        if (res) {
            UiAdapter.setChatInput("");
            UiAdapter.clearChatMessages();
            UiAdapter.addChatMessage(ChatTemplates.message("system", "New context started"), "system");
        }
    }

    static async resetHistory() {
        const res = await Api.resetHistory();
        if (res) {
            UiAdapter.setChatInput("");
            UiAdapter.clearChatMessages();
            UiAdapter.addChatMessage(ChatTemplates.message("system", "New chat started"));
        }
    }

    static focusChatInput() {
        document.querySelector('.chat-box-input-field')?.focus();
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
                    UiAdapter.addChatMessage(ChatTemplates.message(message.type, message.text), message.type, message.timeToResponse);
                }
                break;
            case MessageTypes.error:
                UiAdapter.addChatMessage(ChatTemplates.message('error', res.text), "error");
                break;
            case MessageTypes.userMessage:
                UiAdapter.addChatMessage(ChatTemplates.message('user', res.text), "user", res.timeToResponse);
                break;
            case MessageTypes.assistantResponse:
                UiAdapter.addChatMessage(ChatTemplates.message('assistant', res.text), "assistant", res.timeToResponse);
                if (speak) {
                    Synthesizer.speak(res.text, window.language);
                }
                break;
            case MessageTypes.assistantData:
                UiAdapter.addChatMessage(ChatTemplates.data(res.text), "data", res.timeToResponse);
                break;
            case MessageTypes.systemResponse:
                UiAdapter.addChatMessage(ChatTemplates.message('system', res.text), "system", res.timeToResponse);
                break;
            case MessageTypes.openCommand:
                UiAdapter.addChatMessage(ChatTemplates.message('system', res.text), "system", res.timeToResponse);
                if (open) {
                    window.open(res.url, '_blank');
                }
                break;
            case MessageTypes.image:
                UiAdapter.addChatMessage(ChatTemplates.image(res.url), "image", res.timeToResponse);
                break;
            default:
                throw new Error(`Unknown response type: ${res.type}`);
        }
    }

    static downloadCsv(csv) {
        const blob = new Blob([csv], {type: "text/plain"});
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "data.csv";
        a.click();
    }

    static downloadJson(json) {
        const blob = new Blob([json], {type: "text/plain"});
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "data.json";
        a.click();
    }

    static showLoginError(error) {
        const loginError = document.querySelector('.login-error');
        loginError.innerHTML = error;
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

    static toast(message, type = "info", timeout = 5) {
        const container = document.querySelector(".toast-container");
        container.appendChild(GenericTemplates.toast(message, type, timeout));
    }
}