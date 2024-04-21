import {create, signal, store} from "https://fjs.targoninc.com/f.js";
import {Auth} from "../js/Auth.mjs";
import {GenericTemplates} from "./GenericTemplates.mjs";
import {StoreKeys} from "../js/StoreKeys.mjs";

export class UserTemplates {
    static login(router) {
        const isLoading = signal(false);
        store().get(StoreKeys.isCheckingAuth).subscribe((checking) => {
            isLoading.value = checking;
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
                        }, "login", isLoading),
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

        return UserTemplates.inputField("Username", "username", inputClass);
    }

    static passwordField(isLoading) {
        const inputClass = signal(isLoading.value ? "disabled" : "_");
        isLoading.subscribe((loading) => {
            inputClass.value = loading ? "disabled" : "_";
        });

        return UserTemplates.inputField("Password", "password", inputClass);
    }

    static inputField(label, id, inputClass) {
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
                    .type("text")
                    .build()
            ).build();
    }
}