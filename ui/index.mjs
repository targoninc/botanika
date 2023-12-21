import Router from 'router5';
import {ChatTemplates} from "./templates/ChatTemplates.mjs";
import {VoiceRecorder} from "./VoiceRecorder.mjs";

const router = new Router([
    { name: 'chat', path: '/' },
]);

router.start();

router.subscribe(({ route }) => {
    const content = document.getElementById('content');
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

const recorder = new VoiceRecorder();
recorder.start();
