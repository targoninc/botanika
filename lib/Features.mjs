import {AuthActions} from "./actions/AuthActions.mjs";
import {VoiceRecognitionEndpoint} from "./endpoints/VoiceRecognitionEndpoint.mjs";
import multer from "multer";
import passport from "passport";
import {PassportDeserializeUser, PassportSerializeUser, PassportStrategy} from "./tooling/PassportStrategy.mjs";
import express from "express";
import path from "path";
import {CLI} from "./tooling/CLI.mjs";
import session from "express-session";
import {DB} from "./db/DB.mjs";
import {SpotifyFeature} from "./features/spotify/SpotifyFeature.mjs";

const upload = multer({ storage: multer.memoryStorage() });

export class Features {
    static addSpotify(app, contextMap, db) {
        SpotifyFeature.enable(app, contextMap, db);
    }

    static addVoiceRecognition(app, contextMap, db) {
        app.post('/api' + VoiceRecognitionEndpoint.path, AuthActions.checkAuthenticated, upload.single('file'), async (req, res) => {
            VoiceRecognitionEndpoint.handler(req, res, contextMap[req.sessionID], db).then((context) => {
                contextMap[req.sessionID] = context;
            });
        });
    }

    static addAuthentication(app, contextMap, db) {
        passport.use(PassportStrategy(db));
        passport.serializeUser(PassportSerializeUser());
        passport.deserializeUser(PassportDeserializeUser(db));

        app.post("/api/authorize", AuthActions.authorizeUser(db, contextMap));
        app.post("/api/logout", AuthActions.logout(contextMap));
        app.get("/api/isAuthorized", AuthActions.isAuthorized(contextMap));
    }

    static addHosting(app, __dirname) {
        app.use(express.static(path.join(__dirname, "ui")));
        app.use('/audio', AuthActions.checkAuthenticated, express.static(path.join(__dirname, '/audio')));

        app.get('*', (req, res) => {
            res.sendFile(__dirname + '/ui/index.html');
        });

        app.listen(3000, () => {
            CLI.success(`Listening on ${process.env.DEPLOYMENT_URL || 'http://localhost:3000'}`);
        });
    }

    static addExpress() {
        const app = express();
        app.use(session({
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: false
        }));

        app.use(passport.initialize());
        app.use(passport.session({}));

        app.use(express.json());
        return app;
    }

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
        app.post('/api' + path, AuthActions.checkAuthenticated, async (req, res) => {
            handler(req, res, contextMap[req.sessionID], db).then((context) => {
                contextMap[req.sessionID] = context;
            });
        });
    }

    static addEndpoints(app, contextMap, db, endpoints) {
        endpoints.forEach(endpoint => Features.addEndpoint(app, contextMap, db, endpoint));
    }

    static async addDatabase() {
        const db_url = process.env.MYSQL_URL.toString();
        CLI.debug(`Connecting to database at url ${db_url}...`);
        const db = new DB(process.env.MYSQL_URL);
        await db.connect();
        CLI.success('Connected to database!');

        return db;
    }

    static getEnabledFeatures() {
        return {
            spotify: SpotifyFeature.isEnabled(),
            database: process.env.MYSQL_URL && process.env.MYSQL_USER && process.env.MYSQL_PASSWORD,
            voiceRecognition: process.env.OPENAI_API_KEY,
        }
    }
}