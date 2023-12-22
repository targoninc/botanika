import {Api} from "./Api.mjs";
import {UiAdapter} from "./UiAdapter.mjs";

export class Auth {
    static async user() {
        const res = await Api.isAuthorized();
        if (res.user) {
            return res.user;
        }

        return null;
    }

    static async authorizeFromForm(router) {
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        Auth.authorize(username, password).then((res) => {
            if (res.error) {
                UiAdapter.showLoginError(res.error);
                return;
            }
            router.navigate("search");
        });
    }

    static async authorize(username, password) {
        return await Api.authorize(username, password);
    }

    static async logout() {
        await Api.logout();
    }
}