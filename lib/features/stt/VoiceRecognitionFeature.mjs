import {VoiceRecognitionEndpoint} from "./VoiceRecognitionEndpoint.mjs";
import {BotanikaFeature} from "../BotanikaFeature.mjs";
import {AuthActions} from "../../actions/AuthActions.mjs";
import multer from "multer";
import {CLI} from "../../tooling/CLI.mjs";

const upload = multer({ storage: multer.memoryStorage() });

export class VoiceRecognitionFeature extends BotanikaFeature {
    static name = 'stt';

    static isEnabled() {
        return process.env.OPENAI_API_KEY !== undefined;
    }

    static enable(app, contextMap, db, intents) {
        app.post('/api' + VoiceRecognitionEndpoint.path, AuthActions.checkAuthenticated, upload.single('file'), async (req, res) => {
            CLI.debug(`/api${VoiceRecognitionEndpoint.path}`);
            VoiceRecognitionEndpoint.handler(req, res, contextMap[req.sessionID], db, intents).then((context) => {
                contextMap[req.sessionID] = context;
            });
        });
    }
}