import {AuthActions} from "./actions/AuthActions.mjs";
import {CLI} from "./tooling/CLI.mjs";
import {DB} from "./db/DB.mjs";
import {SpotifyFeature} from "./features/spotify/SpotifyFeature.mjs";
import {DatabaseFeature} from "./features/database/DatabaseFeature.mjs";
import {VoiceRecognitionFeature} from "./features/voiceRecognition/VoiceRecognitionFeature.mjs";
import {HostingFeature} from "./features/hosting/HostingFeature.mjs";
import {Completion} from "./tooling/Completion.mjs";
import {activeEndpoints} from "./endpoints/ActiveEndpoints.mjs";

export class Features {
    /**
     *
     * @param app {Express}
     * @param contextMap {Object}
     * @param db {DB}
     * @param endpoint {GenericEndpoint}
     */
    static addEndpoint(app, contextMap, db, endpoint) {
        const { path, handler } = endpoint;
        CLI.debug(`Adding endpoint ${endpoint.method} /api${path}`);
        app.post(`/api${path}`, AuthActions.checkAuthenticated, async (req, res) => {
            CLI.debug(`/api${path}`);
            handler(req, res, contextMap[req.sessionID], db).then((context) => {
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
        const contextMap = {};
        const app = HostingFeature.enable(__dirname, db, contextMap);

        activeEndpoints.forEach(endpoint => {
            Features.addEndpoint(app, contextMap, db, endpoint);
        });

        return { app, db, contextMap };
    }

    static async enable(__dirname) {
        const {app, db, contextMap} = await Features.enableRequiredFeatures(__dirname);
        await Completion.prepareProvider();

        const features = [
            SpotifyFeature,
            VoiceRecognitionFeature
        ];
        const enabledFeatures = features.filter(feature => feature.isEnabled());
        CLI.info(`Enabled features: ${enabledFeatures.map(feature => feature.name).join(', ')}`);
        for (const feature of enabledFeatures) {
            await feature.enable(app, contextMap, db);
            const endpoints = feature.getEndpoints();

            endpoints.forEach(endpoint => {
                Features.addEndpoint(app, contextMap, db, endpoint);
            });
        }
    }
}