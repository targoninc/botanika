import {FJS} from "https://fjs.targoninc.com/f.js";
import {Api} from "../Api.mjs";

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
                            .onkeydown((e) => {
                                if (e.key === 'Enter' && e.ctrlKey) {
                                    Api.AddContext({
                                        text: e.target.value
                                    }).then((res) => {
                                        console.log(res);
                                    });
                                }
                            })
                            .build(),
                    ).build()
            ).build();
    }
}