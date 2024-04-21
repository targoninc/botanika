import {Api} from "./Api.mjs";
import {UiAdapter} from "./UiAdapter.mjs";
import {StoreKeys} from "./StoreKeys.mjs";
import {store} from "https://fjs.targoninc.com/f.js";

export class Auth {
    static async userState() {
        store().get(StoreKeys.isCheckingAuth).value = true;
        const res = await Api.isAuthorized();
        store().get(StoreKeys.isCheckingAuth).value = false;
        return res;
    }

    static async authorizeFromForm(router) {
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        Auth.authorize(username, password).then((res) => {
            if (res.error) {
                UiAdapter.showLoginError(res.error);
                return;
            }
            router.navigate("chat");
        });
    }

    static async authorize(username, password) {
        return await Api.authorize(username, password);
    }

    static async logout() {
        await Api.logout();
    }
}