import {FJS, FjsObservable} from "@targoninc/fjs";
import {Api} from "../js/Api.mjs";
import {UiAdapter} from "../js/UiAdapter.mjs";
import {Auth} from "../js/Auth.mjs";
import {FormatParser} from "../js/FormatParser.mjs";
import {AudioAssistant} from "../js/AudioAssistant.mjs";
import {VoiceRecorder} from "../js/VoiceRecorder.mjs";
import {Icon} from "../img/Icon.mjs";

export class ChatTemplates {
    static message(type, text, buttons = []) {
        return FJS.create("div")
            .classes("message", "text-message", "flex-v", type)
            .children(
                FJS.create("div")
                    .classes("flex")
                    .children(...buttons)
                    .build(),
                FJS.create("div").classes("message-text", type).text(text).build(),
            )
            .build();
    }

    static tableCell(text) {
        if (text && text.toString().startsWith("http")) {
            return FJS.create("td")
                .children(
                    FJS.create("a").href(text).target("_blank").text(text).build(),
                )
                .build();
        }
        return FJS.create("td").text(text).build();
    }

    static data(text) {
        const json = FormatParser.toJson(text);
        const csv = FormatParser.toCsv(text);
        const buttons = [
            FJS.create("button")
                .text("JSON")
                .onclick(() => {
                    const blob = new Blob([json], {type: "text/plain"});
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "data.json";
                    a.click();
                })
                .build(),
            FJS.create("button")
                .text("CSV")
                .onclick(() => {
                    const blob = new Blob([csv], {type: "text/plain"});
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "data.csv";
                    a.click();
                })
                .build(),
            FJS.create("button")
                .text("Copy")
                .onclick(() => {
                    navigator.clipboard.writeText(text);
                })
                .build(),
        ];
        try {
            if (json.constructor === Array) {
                const table = FJS.create("table")
                    .classes("data-table")
                    .children(
                        FJS.create("thead")
                            .children(
                                FJS.create("tr")
                                    .children(
                                        ...Object.keys(json[0]).map((col) => {
                                            return FJS.create("th").text(col).build();
                                        }),
                                    )
                                    .build(),
                            )
                            .build(),
                        FJS.create("tbody")
                            .children(
                                ...json.map((row) => {
                                    return FJS.create("tr")
                                        .children(
                                            ...Object.keys(json[0]).map((col) => {
                                                const value = row[col] ?? "";
                                                return ChatTemplates.tableCell(value);
                                            }),
                                        )
                                        .build();
                                }),
                            )
                            .build(),
                    )
                    .build();
                return FJS.create("div")
                    .classes("message", "data-message", "assistant", "flex-v")
                    .children(
                        FJS.create("div")
                            .classes("flex")
                            .children(...buttons)
                            .build(),
                        table,
                    )
                    .build();
            }
        } catch (e) {
            console.log(e);
            return ChatTemplates.message("data", text, buttons);
        }
    }

    static voiceButton(isOn) {
        const onState = new FjsObservable(isOn);
        const iconState = new FjsObservable(
            isOn ? Icon.getSvg("mic_on") : Icon.getSvg("mic_off"),
        );
        const textState = new FjsObservable(isOn ? "Mute" : "Unmute");
        onState.onUpdate = (value) => {
            iconState.value = value ? Icon.getSvg("mic_on") : Icon.getSvg("mic_off");
            textState.value = value ? "Mute" : "Unmute";
        };

        return FJS.create("button")
            .classes("voice-button", "flex")
            .onclick(() => {
                VoiceRecorder.toggleRecording();
                onState.value = !onState.value;
            })
            .children(
                FJS.create("img").classes("icon").src(iconState).build(),
                FJS.create("span").text(textState).build(),
            )
            .build();
    }

    static chatBox(router, context) {
        const buttons = [];
        if (!context.apis.spotify) {
            buttons.push(
                FJS.create("button")
                    .text(`Log into Spotify`)
                    .classes("spotify-button")
                    .onclick(async () => {
                        window.open("/api/spotify-login", "_blank");
                    })
                    .build(),
            );
        } else {
            buttons.push(
                FJS.create("button")
                    .text(`Spotify`)
                    .classes("spotify-button", "active")
                    .onclick(async () => {
                        window.open("/api/spotify-logout", "_blank");
                    })
                    .build(),
            );
        }
        buttons.push(
            FJS.create("button")
                .text(context.assistant.muted ? `Unmute assistant` : `Mute assistant`)
                .classes("mute-button", context.assistant.muted ? "muted" : "_")
                .onclick(async () => {
                    await AudioAssistant.toggleMute();
                })
                .build(),
        );

        buttons.push(ChatTemplates.voiceButton());

        return FJS.create("div")
            .classes("chat-box")
            .children(
                FJS.create("div").classes("loudness-bar").build(),
                FJS.create("div")
                    .classes("flex")
                    .children(
                        FJS.create("button")
                            .text(`Reset all context`)
                            .onclick(async () => {
                                const res = await Api.resetContext();
                                if (res) {
                                    UiAdapter.setChatInput("");
                                    UiAdapter.clearChatMessages();
                                    UiAdapter.addChatMessage(
                                        ChatTemplates.message("system", "New context started"),
                                    );
                                }
                            })
                            .build(),
                        FJS.create("button")
                            .text(`Logout ${context.user.name}`)
                            .onclick(async () => {
                                await Auth.logout();
                                router.navigate("login");
                            })
                            .build(),
                        FJS.create("button")
                            .text(`New chat`)
                            .onclick(async () => {
                                const res = await Api.resetHistory();
                                if (res) {
                                    UiAdapter.setChatInput("");
                                    UiAdapter.clearChatMessages();
                                    UiAdapter.addChatMessage(
                                        ChatTemplates.message("system", "New chat started"),
                                    );
                                }
                            })
                            .build(),
                        ...buttons,
                    )
                    .build(),
                FJS.create("div").classes("chat-box-messages").build(),
                FJS.create("div")
                    .classes("chat-box-input")
                    .children(
                        FJS.create("input")
                            .classes("chat-box-input-field")
                            .placeholder("Enter a message...")
                            .onkeydown((e) => {
                                if (e.key === "Enter" && e.ctrlKey) {
                                    const input = UiAdapter.getChatInput();
                                    if (input === "") {
                                        return;
                                    }
                                    UiAdapter.addChatMessage(
                                        ChatTemplates.message("user", input),
                                    );
                                    UiAdapter.addChatMessage(ChatTemplates.loading());
                                    UiAdapter.setChatInput("");
                                    Api.SendMessage(input).then((res) => {
                                        UiAdapter.afterMessage(res);
                                    });
                                }
                            })
                            .build(),
                    )
                    .build(),
            )
            .build();
    }

    static image(url) {
        return FJS.create("div")
            .classes("message", "image-message", "assistant")
            .children(FJS.create("img").classes("message-image").src(url).build())
            .build();
    }

    static loading() {
        return FJS.create("div")
            .classes("message", "text-message", "flex-v", "loading", "assistant")
            .children()
            .build();
    }
}
