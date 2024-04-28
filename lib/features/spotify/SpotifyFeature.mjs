import {AuthActions} from "../../actions/AuthActions.mjs";
import {SpotifyApi} from "./api/SpotifyApi.mjs";
import {BotanikaFeature} from "../BotanikaFeature.mjs";

export class SpotifyFeature extends BotanikaFeature {
    static name = 'spotify';

    static enable(app, contextMap, db) {
        app.get('/api/spotify-login', AuthActions.checkAuthenticated, async (req, res) => {
            await SpotifyApi.onLogin(req, res);
        });

        app.get('/api/spotify-logout', AuthActions.checkAuthenticated, async (req, res) => {
            delete contextMap[req.sessionID].apis.spotify;
            await db.updateContext(req.user.id, JSON.stringify(contextMap[req.sessionID]));
            res.redirect('/spotify-logout-success');
        });

        app.get('/api/spotify-callback', AuthActions.checkAuthenticated, async (req, res) => {
            await SpotifyApi.onCallback(req, res, contextMap[req.sessionID], db);
        });
    }

    static isEnabled() {
        return process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET;
    }
}