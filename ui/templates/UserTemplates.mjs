import {create, ifjs, signal, store} from "https://fjs.targoninc.com/f.js";
import {Auth} from "../js/Auth.mjs";
import {GenericTemplates} from "./GenericTemplates.mjs";
import {StoreKeys} from "../js/StoreKeys.mjs";
import {ChatTemplates} from "./ChatTemplates.mjs";

export class UserTemplates {
    static login(router) {
        const isLoading = signal(false);
        const buttonClass = signal(isLoading.value ? "disabled" : "_");
        store().get(StoreKeys.isCheckingAuth).subscribe((checking) => {
            isLoading.value = checking;
        });
        isLoading.subscribe((loading) => {
            buttonClass.value = loading ? "disabled" : "_";
        });

        const form = create("div")
            .classes("full-center")
            .children(
                create("div")
                    .classes("flex-v", "big-gap", "padded", "rounded", "centered", "align-content")
                    .children(
                        UserTemplates.usernameField(isLoading),
                        UserTemplates.passwordField(isLoading),
                        create("div")
                            .classes("flex", "align-content")
                            .children(
                                create("span")
                                    .classes("login-error")
                                    .build(),
                            ).build(),
                        create("div")
                            .classes("flex", "align-content")
                            .children(
                                ChatTemplates.featureButton(),
                                GenericTemplates.buttonWithSpinner("Log in", async () => {
                                    isLoading.value = true;
                                    await Auth.authorizeFromForm(router, () => {
                                        isLoading.value = false;
                                    });
                                }, "login", isLoading, [buttonClass]),
                            ).build(),
                        ifjs(store().get(StoreKeys.isCheckingAuth), create("div")
                            .classes("flex", "align-content")
                            .children(
                                create("span")
                                    .text("Loading context...")
                                    .build()
                            ).build())
                    ).build()
            ).build();

        form.addEventListener("keydown", async (e) => {
            if (e.key === "Enter") {
                isLoading.value = true;
                await Auth.authorizeFromForm(router, () => {
                    isLoading.value = false;
                });
            }
        });

        return form;
    }

    static usernameField(isLoading) {
        const inputClass = signal(isLoading.value ? "disabled" : "_");
        isLoading.subscribe((loading) => {
            inputClass.value = loading ? "disabled" : "_";
        });

        return UserTemplates.inputField("Username", "username", "text", "face", inputClass);
    }

    static passwordField(isLoading) {
        const inputClass = signal(isLoading.value ? "disabled" : "_");
        isLoading.subscribe((loading) => {
            inputClass.value = loading ? "disabled" : "_";
        });

        return UserTemplates.inputField("Password", "password", "password", "password", inputClass);
    }

    static inputField(label, id, type, icon, inputClass) {
        return create("div")
            .classes("flex-v")
            .children(
                create("div")
                    .classes("flex", "align-content")
                    .children(
                        icon ? GenericTemplates.icon(icon) : null,
                        create("label")
                            .attributes("for", id)
                            .text(label)
                            .build(),
                    ).build(),
                create("input")
                    .id(id)
                    .name(id)
                    .classes(inputClass)
                    .autocomplete(id)
                    .type(type)
                    .build()
            ).build();
    }
}