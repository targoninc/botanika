import {BotanikaFeature} from "../BotanikaFeature.mjs";
import express from "express";
import cors from "cors";
import passport from "passport";
import path from "path";
import {AuthActions} from "../../actions/AuthActions.mjs";
import {CLI} from "../../tooling/CLI.mjs";
import {setupPassport} from "../../db/Session.mjs";

export class HostingFeature extends BotanikaFeature {
    static name = "hosting";

    static isEnabled() {
        return process.env.SESSION_SECRET !== undefined;
    }

    /**
     *
     * @param __dirname
     * @param db
     * @param contextMap
     * @returns {Express}
     */
    static async enable(__dirname, db, contextMap) {
        const app = express();
        app.use(cors({
            origin: process.env.CORS_ORIGIN,
            credentials: true
        }));
        await setupPassport(app, db);

        app.use(passport.initialize());
        app.use(passport.session({}));
        app.use(express.json());

        app.post("/api/authorize", AuthActions.authorizeUser(db, contextMap));
        app.post("/api/logout", AuthActions.logout(contextMap));
        app.get("/api/isAuthorized", AuthActions.isAuthorized(contextMap));
        return app;
    }

    static finishSetup(app, __dirname) {
        app.use(express.static(path.join(__dirname, "ui")));
        app.use('/audio', AuthActions.checkAuthenticated, express.static(path.join(__dirname, '/audio')));

        app.get('*foo', (req, res) => {
            res.sendFile(__dirname + '/ui/index.html');
        });

        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            CLI.success(`Listening on ${process.env.DEPLOYMENT_URL || `http://localhost:${port}`}`);
        });
    }
}