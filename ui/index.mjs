import {createRouter} from 'router5';
import browserPlugin from 'router5-plugin-browser';
import {ChatTemplates} from "./templates/ChatTemplates.mjs";
import {VoiceRecorder} from "./VoiceRecorder.mjs";

const router = createRouter([
    { name: 'chat', path: '/' },
],
{
    defaultRoute: 'chat'
});
router.usePlugin(browserPlugin());

router.subscribe(({ route }) => {
    const content = document.getElementById('content');
    console.log(`Route changed to ${route.name}`);
    switch (route.name) {
        case 'chat':
            content.innerHTML = "";
            content.appendChild(ChatTemplates.chatBox());
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