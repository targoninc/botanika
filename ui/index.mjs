import {createRouter} from 'router5';
import browserPlugin from 'router5-plugin-browser';
import {ChatTemplates} from "./templates/ChatTemplates.mjs";
import {VoiceRecorder} from "./js/VoiceRecorder.mjs";
import {UiAdapter} from "./js/UiAdapter.mjs";
import {UserTemplates} from "./templates/UserTemplates.mjs";
import {Auth} from "./js/Auth.mjs";
import {PageTemplates} from "./templates/PageTemplates.mjs";
import {Broadcast} from "./js/Broadcast.mjs";

const router = createRouter([
        {name: 'chat', path: '/'},
        {name: 'login', path: '/login'},
        {name: 'spotify-login-success', path: '/spotify-login-success'},
        {name: 'spotify-logout-success', path: '/spotify-logout-success'},
        {name: 'spotify-login-success-mock', path: '/spotify-login-success-mock'}
    ],
    {
        defaultRoute: 'chat'
    });
router.usePlugin(browserPlugin());

router.subscribe(async ({route}) => {
    const content = document.getElementById('content');
    console.log(`Route changed to ${route.name}`);
    const state = await Auth.userState();
    switch (route.name) {
        case 'chat':
            if (!state.user) {
                router.navigate('login');
                break;
            }
            content.innerHTML = "";
            content.appendChild(ChatTemplates.chatBox(router, state.context));
            const history = state.context.history;
            UiAdapter.setHistory(history, false, false);
            UiAdapter.addChatMessage(ChatTemplates.message('system', "Welcome!"));
            break;
        case 'login':
            if (state.user) {
                router.navigate('chat');
                break;
            }
            content.innerHTML = "";
            content.appendChild(UserTemplates.login(router));
            break;
        case 'spotify-login-success':
            if (!state.user) {
                router.navigate('login');
                break;
            }
            content.innerHTML = "";
            content.appendChild(PageTemplates.redirectPage('Spotify Login Successful', 1, '--close'));
            Broadcast.send('spotify-login-success');
            break;
        case 'spotify-logout-success':
            if (!state.user) {
                router.navigate('login');
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

router.start();

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