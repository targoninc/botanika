import {FJS} from "@targoninc/fjs";
import {Api} from "../js/Api.mjs";
import {UiAdapter} from "../js/UiAdapter.mjs";
import {UserTemplates} from "./UserTemplates.mjs";
import {Auth} from "../js/Auth.mjs";

export class ChatTemplates {
    static message(type, text) {
        return FJS.create('div')
            .classes('message', 'text-message', type)
            .children(
                FJS.create('div')
                    .classes('message-text', type)
                    .text(text)
                    .build()
            ).build();
    }

    static chatBox(router, context) {
        return FJS.create('div')
            .classes('chat-box')
            .children(
                FJS.create('div')
                    .classes('loudness-bar')
                    .build(),
                FJS.create('div')
                    .classes("flex")
                    .children(
                        FJS.create("button")
                            .text(`Logout ${context.user.name}`)
                            .onclick(async () => {
                                await Auth.logout();
                                router.navigate("login");
                            }).build(),
                        FJS.create("button")
                            .text(`New chat`)
                            .onclick(async () => {
                                const res = await Api.resetContext();
                                if (res) {
                                    UiAdapter.setChatInput("");
                                    UiAdapter.clearChatMessages();
                                    UiAdapter.addChatMessage(ChatTemplates.message('system', "New chat started"));
                                }
                            }).build(),
                    ).build(),
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
                                        if (res.error) {
                                            UiAdapter.addChatMessage(ChatTemplates.message('error', res.error));
                                            return;
                                        }
                                        window.language = res.context.user.language;
                                        UiAdapter.handleResponse(res.responses.filter(r => r.type !== 'user-message'));
                                    });
                                }
                            })
                            .build(),
                    ).build()
            ).build();
    }

    static image(url) {
        return FJS.create('div')
            .classes('message', 'image-message', 'assistant')
            .children(
                FJS.create('img')
                    .classes('message-image')
                    .src(url)
                    .build()
            ).build();
    }
}