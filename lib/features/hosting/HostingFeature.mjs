import {BotanikaFeature} from "../BotanikaFeature.mjs";
import express from "express";
import session from "express-session";
import passport from "passport";
import path from "path";
import {AuthActions} from "../../actions/AuthActions.mjs";
import {CLI} from "../../tooling/CLI.mjs";
import {PassportDeserializeUser, PassportSerializeUser, PassportStrategy} from "../../tooling/PassportStrategy.mjs";

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
    static enable(__dirname, db, contextMap) {
        const app = express();
        app.use(session({
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: false
        }));

        app.use(passport.initialize());
        app.use(passport.session({}));

        app.use(express.json());

        passport.use(PassportStrategy(db));
        passport.serializeUser(PassportSerializeUser());
        passport.deserializeUser(PassportDeserializeUser(db));

        app.post("/api/authorize", AuthActions.authorizeUser(db, contextMap));
        app.post("/api/logout", AuthActions.logout(contextMap));
        app.get("/api/isAuthorized", AuthActions.isAuthorized(contextMap));
        return app;
    }

    static finishSetup(app, __dirname) {
        app.use(express.static(path.join(__dirname, "ui")));
        app.use('/audio', AuthActions.checkAuthenticated, express.static(path.join(__dirname, '/audio')));

        app.get('*', (req, res) => {
            res.sendFile(__dirname + '/ui/index.html');
        });

        app.listen(3000, () => {
            CLI.success(`Listening on ${process.env.DEPLOYMENT_URL || 'http://localhost:3000'}`);
        });
    }
}