import {FJS} from "@targoninc/fjs";
import {Api} from "../Api.mjs";
import {UiAdapter} from "../UiAdapter.mjs";

export class ChatTemplates {
    static message(type, text) {
        return FJS.create('div')
            .classes('message', type)
            .children(
                FJS.create('div')
                    .classes('message-text', type)
                    .text(text)
                    .build()
            ).build();
    }

    static chatBox() {
        return FJS.create('div')
            .classes('chat-box')
            .children(
                FJS.create('div')
                    .classes('loudness-bar')
                    .build(),
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
                                    UiAdapter.addChatMessage(ChatTemplates.message('user', input));
                                    UiAdapter.setChatInput("");
                                    Api.SendMessage(input).then((res) => {
                                        UiAdapter.handleResponse(res.filter(r => r.type !== 'message'));
                                    });
                                }
                            })
                            .build(),
                    ).build()
            ).build();
    }
}