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
}