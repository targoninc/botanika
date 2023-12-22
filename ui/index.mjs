import {createRouter} from 'router5';
import browserPlugin from 'router5-plugin-browser';
import {ChatTemplates} from "./templates/ChatTemplates.mjs";
import {VoiceRecorder} from "./js/VoiceRecorder.mjs";
import {UiAdapter} from "./js/UiAdapter.mjs";
import {UserTemplates} from "./templates/UserTemplates.mjs";
import {Auth} from "./js/Auth.mjs";

const router = createRouter([
    { name: 'chat', path: '/' },
    { name: 'login', path: '/login' },
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
            UiAdapter.addChatMessage(ChatTemplates.message('system', "New chat started"));
            break;
        case 'login':
            if (state.user) {
                router.navigate('chat');
                break;
            }
            content.innerHTML = "";
            content.appendChild(UserTemplates.login(router));
            break;
        default:
            content.innerHTML = "404";
            break;
    }
});

router.start();
console.log('Router started.');

const recorder = new VoiceRecorder();
recorder.start();
console.log('Recorder started.');
setInterval(() => {
    UiAdapter.updateLoudness(recorder.currentVolume);
}, 16);