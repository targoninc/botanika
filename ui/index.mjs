import {ChatTemplates} from "./templates/ChatTemplates.mjs";
import {VoiceRecorder} from "./js/VoiceRecorder.mjs";
import {UiAdapter} from "./js/UiAdapter.mjs";
import {UserTemplates} from "./templates/UserTemplates.mjs";
import {Auth} from "./js/Auth.mjs";
import {PageTemplates} from "./templates/PageTemplates.mjs";
import {Broadcast} from "./js/Broadcast.mjs";
import {Router} from "./js/Router.mjs";
import {routes} from "./js/Routes.mjs";
import {signal, store} from "https://fjs.targoninc.com/f.js";

store().set("isSending", signal(false));

const router = new Router(routes, async (route, params) => {
    const content = document.getElementById('content');
    console.log(`Route changed to ${route.path}`);
    document.title = `botanika - ${route.title}`;

    const state = await Auth.userState();
    switch (route.path) {
        case 'chat':
            if (!state.user) {
                console.log('User not logged in');
                await router.navigate('login');
                break;
            }
            content.innerHTML = "";
            content.appendChild(ChatTemplates.chatBox(router, state.context));
            const history = state.context.history;
            UiAdapter.setHistory(history, false, false);
            UiAdapter.addChatMessage(ChatTemplates.message('system', "Welcome!"), "system");
            break;
        case 'login':
            if (state.user) {
                console.log('User already logged in');
                await router.navigate('chat');
                break;
            }
            content.innerHTML = "";
            content.appendChild(UserTemplates.login(router));
            break;
        case 'spotify-login-success':
            if (!state.user) {
                await router.navigate('login');
                break;
            }
            content.innerHTML = "";
            content.appendChild(PageTemplates.redirectPage('Spotify Login Successful', 1, '--close'));
            Broadcast.send('spotify-login-success');
            break;
        case 'spotify-logout-success':
            if (!state.user) {
                await router.navigate('login');
                break;
            }
            content.innerHTML = "";
            content.appendChild(PageTemplates.redirectPage('Spotify Logout Successful', 1, '--close'));
            Broadcast.send('spotify-logout-success');
            break;
        default:
            content.innerHTML = "404";
            break;
    }
});

window.recorder = new VoiceRecorder();

setInterval(() => {
    UiAdapter.updateLoudness(recorder.currentVolume);
}, 16);

Broadcast.listen((e) => {
    if (e.origin !== window.location.origin) {
        return;
    }
    const message = e.data;
    switch (message) {
        case 'spotify-login-success':
            UiAdapter.activateSpotifyLoginButton();
            break;
        case 'spotify-logout-success':
            UiAdapter.deactivateSpotifyLoginButton();
            break;
    }
});