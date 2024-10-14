import {AuthActions} from "./actions/AuthActions.mjs";
import {CLI} from "./tooling/CLI.mjs";
import {DB} from "./db/DB.mjs";
import {SpotifyFeature} from "./features/spotify/SpotifyFeature.mjs";
import {DatabaseFeature} from "./features/database/DatabaseFeature.mjs";
import {VoiceRecognitionFeature} from "./features/stt/VoiceRecognitionFeature.mjs";
import {HostingFeature} from "./features/hosting/HostingFeature.mjs";
import {Completion} from "./tooling/Completion.mjs";
import {activeEndpoints} from "./endpoints/ActiveEndpoints.mjs";
import {WeatherFeature} from "./features/weather/WeatherFeature.mjs";
import {CreateFileFeature} from "./features/files/CreateFileFeature.mjs";
import {ChatFeature} from "./features/chat/ChatFeature.mjs";
import {OpenFeature} from "./features/open/OpenFeature.mjs";
import {ResponseFeature} from "./features/response/ResponseFeature.mjs";
import {ContextFeature} from "./features/context/ContextFeature.mjs";
import {ensureSessionStore, setupPassport} from "./db/Session.mjs";

export class Features {
    /**
     *
     * @param app {Express}
     * @param contextMap {Object}
     * @param db {DB}
     * @param endpoint {GenericEndpoint}
     * @param intents {Array<GenericIntent>}
     */
    static addEndpoint(app, contextMap, db, endpoint, intents) {
        const { path, handler } = endpoint;
        CLI.debug(`Adding endpoint ${endpoint.method} /api${path}`);
        app.post(`/api${path}`, AuthActions.checkAuthenticated, async (req, res) => {
            //CLI.debug(`/api${path}`);
            handler(req, res, contextMap[req.sessionID], db, intents).then((context) => {
                contextMap[req.sessionID] = context;
            });
        });
    }


    static async enableRequiredFeatures(__dirname) {
        if (!DatabaseFeature.isEnabled()) {
            throw new Error("Database feature is required");
        }

        if (!HostingFeature.isEnabled()) {
            throw new Error("Hosting feature is required");
        }

        const db = await DatabaseFeature.enable();
        await ensureSessionStore(db);
        const contextMap = {};
        const app = await HostingFeature.enable(__dirname, db, contextMap);

        return { app, db, contextMap };
    }

    static async enable(__dirname) {
        const {app, db, contextMap} = await Features.enableRequiredFeatures(__dirname);
        await Completion.prepareProvider();

        const features = [
            ResponseFeature,
            SpotifyFeature,
            VoiceRecognitionFeature,
            CreateFileFeature,
            ContextFeature,
            ChatFeature,
            OpenFeature,
            WeatherFeature
        ];
        const enabledFeatures = features.filter(feature => feature.isEnabled());
        const allIntents = enabledFeatures.flatMap(feature => feature.getIntents())
            .concat(DatabaseFeature.getIntents());

        activeEndpoints.forEach(endpoint => {
            Features.addEndpoint(app, contextMap, db, endpoint, allIntents);
        });

        CLI.info(`Enabled features: ${enabledFeatures.map(feature => feature.name).join(', ')}`);
        for (const feature of enabledFeatures) {
            await feature.enable(app, contextMap, db, allIntents);
            const endpoints = feature.getEndpoints();

            endpoints.forEach(endpoint => {
                Features.addEndpoint(app, contextMap, db, endpoint, allIntents);
            });
        }

        HostingFeature.finishSetup(app, __dirname);
    }
}