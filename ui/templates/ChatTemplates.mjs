import {FJS} from "@targoninc/fjs";
import {Api} from "../Api.mjs";
import {UiAdapter} from "../UiAdapter.mjs";

export class ChatTemplates {
    static message(text) {
        return FJS.create('div')
            .classes('message')
            .children(
                FJS.create('div')
                    .classes('message-text')
                    .text(text)
                    .build()
            ).build();
    }

    static chatBox() {
        return FJS.create('div')
            .classes('chat-box')
            .children(
                FJS.create('div')
                    .classes('chat-box-messages')
                    .build(),
                FJS.create('div')
                    .classes('chat-box-input')
                    .children(
                        FJS.create('input')
                            .classes('chat-box-input-field')
                            .placeholder('Enter a message...')
                            .onkeydown((e) => {
                                if (e.key === 'Enter' && e.ctrlKey) {
                                    const input = UiAdapter.getChatInput();
                                    if (input === "") {
                                        return;
                                    }
                                    Api.AddContext(input).then((res) => {
                                        const messages = UiAdapter.getChatMessages();
                                        messages.appendChild(ChatTemplates.message(input));
                                        messages.appendChild(ChatTemplates.message(res));
                                        UiAdapter.setChatInput("");
                                    });
                                }
                            })
                            .build(),
                    ).build()
            ).build();
    }
}