import {create, signal, store} from "https://fjs.targoninc.com/f.js";
import {UiAdapter} from "../js/UiAdapter.mjs";
import {Auth} from "../js/Auth.mjs";
import {FormatParser} from "../js/FormatParser.mjs";
import {AudioAssistant} from "../js/AudioAssistant.mjs";
import {VoiceRecorder} from "../js/VoiceRecorder.mjs";
import {TimeParser} from "../js/TimeParser.mjs";
import {GenericTemplates} from "./GenericTemplates.mjs";
import {StoreKeys} from "../js/StoreKeys.mjs";

export class ChatTemplates {
    static messageContainer(domNode, type, time) {
        if (type.constructor === String) {
            type = [type];
        }

        return create("div")
            .classes("message-container", "flex", "align-content", ...type)
            .children(
                domNode,
                time ? ChatTemplates.messageTime(time) : null,
            ).build();
    }

    static messageTime(time) {
        return create("div")
            .classes("message-time")
            .text(TimeParser.format(time))
            .build();
    }

    static message(type, text, buttons = []) {
        return create("div")
            .classes("message", "text-message", "flex-v", type)
            .children(
                create("div")
                    .classes("flex")
                    .children(...buttons)
                    .build(),
                create("div").classes("message-text", type).text(text).build(),
            )
            .build();
    }

    static tableCell(text) {
        const title = text;
        text = text.length > 1000 ? text.substring(0, 1000) + "..." : text;
        if (text && text.toString().startsWith("http")) {
            return create("td")
                .title(title)
                .children(
                    create("a").href(text).target("_blank").text(text).build(),
                ).build();
        }
        return create("td")
            .title(title)
            .text(text)
            .build();
    }

    static data(text) {
        const json = FormatParser.toJson(text);
        const csv = FormatParser.toCsv(text);
        const buttons = [
            GenericTemplates.button("JSON", () => {
                UiAdapter.downloadJson(json);
            }, "file_download"),
            GenericTemplates.button("CSV", () => {
                UiAdapter.downloadCsv(csv);
            }, "file_download"),
            GenericTemplates.button("Copy", () => {
                navigator.clipboard.writeText(text);
            }, "content_copy"),
        ];
        try {
            if (json.constructor === Array) {
                const table = create("table")
                    .classes("data-table")
                    .children(
                        create("thead")
                            .children(
                                create("tr")
                                    .children(
                                        ...Object.keys(json[0]).map((col) => {
                                            return create("th").text(col).build();
                                        }),
                                    )
                                    .build(),
                            )
                            .build(),
                        create("tbody")
                            .children(
                                ...json.map((row) => {
                                    return create("tr")
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
                return create("div")
                    .classes("message", "data-message", "assistant", "flex-v")
                    .children(
                        create("div")
                            .classes("flex")
                            .children(...buttons)
                            .build(),
                        table,
                    ).build();
            }
        } catch (e) {
            console.log(e);
            return ChatTemplates.message("data", text, buttons);
        }
    }

    static voiceButton(isOn) {
        const onState = signal(isOn);
        const iconState = signal(isOn ? "mic" : "mic_off",);
        const textState = signal(isOn ? "Mute yourself" : "Unmute yourself");
        onState.onUpdate = (value) => {
            iconState.value = value ? "mic" : "mic_off";
            textState.value = value ? "Mute yourself" : "Unmute yourself";
        };
        const scaleState = store().get(StoreKeys.currentLoudness);

        return create("div")
            .classes("flex", "align-content")
            .children(
                GenericTemplates.button(textState, () => {
                    VoiceRecorder.toggleRecording();
                    onState.value = !onState.value;
                }, iconState),
                GenericTemplates.redDot(onState, scaleState),
            ).build();
    }

    static chatBox(router, context) {
        if (!context) {
            return create("div")
                .text("No context")
                .build();
        }

        return create("div")
            .classes("chat-box")
            .children(
                create("div")
                    .classes("flex", "spaced")
                    .children(
                        create("div")
                            .classes("flex")
                            .children(
                                ChatTemplates.resetContextButton(),
                                ChatTemplates.resetHistoryButton(),
                                ChatTemplates.spotifyButton(),
                            ).build(),
                        create("div")
                            .classes("flex")
                            .children(
                                ChatTemplates.logoutButton(context, router),
                            ).build(),
                    ).build(),
                create("div")
                    .classes("chat-box-messages")
                    .build(),
                create("div")
                    .classes("flex")
                    .children(
                        ChatTemplates.toggleAssistantMuteButton(context),
                        ChatTemplates.voiceButton(),
                    ).build(),
                create("div")
                    .classes("chat-box-input", "flex")
                    .children(
                        ChatTemplates.chatInputField(),
                        ChatTemplates.sendButton(),
                    ).build(),
            )
            .build();
    }

    static toggleAssistantMuteButton(context) {
        const muteState = signal(context.assistant.muted);
        const textState = signal(muteState.value ? "Unmute assistant" : "Mute assistant");
        const iconState = signal(muteState.value ? "volume_off" : "volume_up");
        const buttonClass = signal(muteState.value ? "muted" : "_");
        muteState.subscribe((value) => {
            textState.value = value ? "Unmute assistant" : "Mute assistant";
            iconState.value = value ? "volume_off" : "volume_up";
            buttonClass.value = value ? "muted" : "_";
        });

        return GenericTemplates.button(textState, async () => {
                await AudioAssistant.toggleMute(muteState);
            }, iconState, [buttonClass]);
    }

    static spotifyButton() {
        const loggedIn = store().get(StoreKeys.spotifyLoggedIn);
        const textState = signal(loggedIn.value ? "Spotify" : "Log into Spotify");
        const iconState = signal(loggedIn.value ? "graphic_eq" : "graphic_eq");
        const buttonClass = signal(loggedIn.value ? "active" : "_");
        const openUrl = signal(loggedIn.value ? "/api/spotify-logout" : "/api/spotify-login");
        loggedIn.subscribe((value) => {
            textState.value = value ? "Spotify" : "Log into Spotify";
            iconState.value = value ? "graphic_eq" : "graphic_eq";
            buttonClass.value = value ? "active" : "_";
            openUrl.value = value ? "/api/spotify-logout" : "/api/spotify-login";
        });

        return GenericTemplates.button(textState, async () => {
            window.open(openUrl.value, "_blank");
        }, iconState, ["spotify-button", buttonClass]);
    }

    static logoutButton(context, router) {
        return GenericTemplates.button(`Logout ${context.user.name}`, async () => {
            await Auth.logout();
            router.navigate("login");
        }, "logout");
    }

    static chatInputField() {
        return create("input")
            .classes("chat-box-input-field")
            .placeholder("Enter a message...")
            .onkeydown((e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                    UiAdapter.sendCurrentMessage();
                }
            })
            .build();
    }

    static sendButton() {
        const isSending = store().get("isSending");
        const buttonClass = signal(isSending.value ? "sending" : "_");
        isSending.subscribe((value) => {
            buttonClass.value = value ? "sending" : "_";
        });

        return GenericTemplates.buttonWithSpinner("Send", async () => {
            await UiAdapter.sendCurrentMessage();
        }, "send", isSending, ["send-button", buttonClass]);
    }

    static resetContextButton() {
        return GenericTemplates.button("Reset all context", async () => {
            await UiAdapter.resetContext();
        }, "delete");
    }

    static resetHistoryButton() {
        return GenericTemplates.button("New chat", async () => {
            await UiAdapter.resetHistory();
        }, "refresh");
    }

    static image(url) {
        return create("div")
            .classes("message", "image-message", "assistant")
            .children(create("img").classes("message-image").src(url).build())
            .build();
    }

    static loading() {
        return create("div")
            .classes("message", "text-message", "flex-v", "loading", "assistant")
            .children()
            .build();
    }

    static userLoading() {
        return create("div")
            .classes("message", "text-message", "flex-v", "loading", "user")
            .children()
            .build();
    }
}
