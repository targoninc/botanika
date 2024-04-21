import {create, ifjs, signal, store} from "https://fjs.targoninc.com/f.js";
import {Auth} from "../js/Auth.mjs";
import {GenericTemplates} from "./GenericTemplates.mjs";
import {StoreKeys} from "../js/StoreKeys.mjs";

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
                    .classes("flex-v", "padded", "rounded", "centered", "align-content")
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
                        GenericTemplates.buttonWithSpinner("Submit", async () => {
                            isLoading.value = true;
                            await Auth.authorizeFromForm(router);
                        }, "login", isLoading, [buttonClass]),
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
                await Auth.authorizeFromForm(router);
            }
        });

        return form;
    }

    static usernameField(isLoading) {
        const inputClass = signal(isLoading.value ? "disabled" : "_");
        isLoading.subscribe((loading) => {
            inputClass.value = loading ? "disabled" : "_";
        });

        return UserTemplates.inputField("Username", "username", "text", inputClass);
    }

    static passwordField(isLoading) {
        const inputClass = signal(isLoading.value ? "disabled" : "_");
        isLoading.subscribe((loading) => {
            inputClass.value = loading ? "disabled" : "_";
        });

        return UserTemplates.inputField("Password", "password", "password", inputClass);
    }

    static inputField(label, id, type, inputClass) {
        return create("div")
            .classes("flex", "align-content")
            .children(
                create("label")
                    .attributes("for", id)
                    .text(label)
                    .build(),
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