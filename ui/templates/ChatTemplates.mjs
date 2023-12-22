import {FJS} from "@targoninc/fjs";
import {Api} from "../js/Api.mjs";
import {UiAdapter} from "../js/UiAdapter.mjs";
import {UserTemplates} from "./UserTemplates.mjs";
import {Auth} from "../js/Auth.mjs";
import {FormatParser} from "../js/FormatParser.mjs";

export class ChatTemplates {
    static message(type, text, buttons = []) {
        return FJS.create('div')
            .classes('message', 'text-message', 'flex-v', type)
            .children(
                FJS.create('div')
                    .classes('flex')
                    .children(
                        ...buttons
                    ).build(),
                FJS.create('div')
                    .classes('message-text', type)
                    .text(text)
                    .build()
            ).build();
    }

    static data(text) {
        const json = FormatParser.toJson(text);
        const csv = FormatParser.toCsv(text);
        const buttons = [
            FJS.create('button')
                .text('JSON')
                .onclick(() => {
                    const blob = new Blob([json], {type: 'text/plain'});
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'data.json';
                    a.click();
                }).build(),
            FJS.create('button')
                .text('CSV')
                .onclick(() => {
                    const blob = new Blob([csv], {type: 'text/plain'});
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'data.csv';
                    a.click();
                }).build(),
            FJS.create('button')
                .text('Copy')
                .onclick(() => {
                    navigator.clipboard.writeText(text);
                }).build()
        ];
        try {
            if (json.constructor === Array) {
                const table = FJS.create('table')
                    .classes('data-table')
                    .children(
                        FJS.create('thead')
                            .children(
                                FJS.create('tr')
                                    .children(
                                        ...Object.keys(json[0]).map((col) => {
                                            return FJS.create('th')
                                                .text(col)
                                                .build();
                                        })
                                    ).build()
                            ).build(),
                        FJS.create('tbody')
                            .children(
                                ...json.map((row) => {
                                    return FJS.create('tr')
                                        .children(
                                            ...Object.values(row).map((col) => {
                                                return FJS.create('td')
                                                    .text(col)
                                                    .build();
                                            })
                                        ).build();
                                })
                            ).build()
                    ).build();
                return FJS.create('div')
                    .classes('message', 'data-message', 'assistant', "flex-v")
                    .children(
                        FJS.create('div')
                            .classes('flex')
                            .children(
                                ...buttons
                            ).build(),
                        table
                    ).build();
            }
        } catch (e) {
            console.log(e);
            return ChatTemplates.message('data', text, buttons);
        }
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