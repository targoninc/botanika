import axios from "axios";
import qs from "qs";
import {PlayNextAction} from "../actions/PlayNextAction.mjs";
import {PlayPreviousAction} from "../actions/PlayPreviousAction.mjs";
import {GetPlayingAction} from "../actions/GetPlayingAction.mjs";
import {SetRepeatModeAction} from "../actions/SetRepeatModeAction.mjs";
import {StartPlaybackAction} from "../actions/StartPlaybackAction.mjs";
import {StopPlaybackAction} from "../actions/StopPlaybackAction.mjs";
import {SearchAction} from "../actions/SearchAction.mjs";
import {CLI} from "../../../tooling/CLI.mjs";
import {spotifyConfig} from "../SpotifyConfig.mjs";

export class SpotifyApi {
    static get CLIENT_ID() {
        return process.env.SPOTIFY_CLIENT_ID;
    }

    static get CLIENT_SECRET() {
        return process.env.SPOTIFY_CLIENT_SECRET;
    }

    static generateRandomString(length) {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    static async onLogin(req, res) {
        const scope = "streaming \
               user-read-email \
               user-read-private \
               user-read-playback-state \
               user-modify-playback-state \
               user-read-currently-playing \
               user-read-recently-played";

        CLI.info(`Spotify API login requested.`);
        const state = SpotifyApi.generateRandomString(16);

        const auth_query_parameters = new URLSearchParams({
            response_type: "code",
            client_id: SpotifyApi.CLIENT_ID,
            scope: scope,
            redirect_uri: `${process.env.DEPLOYMENT_URL}/api/spotify-callback`,
            state: state
        });

        res.redirect(`${spotifyConfig.accountsBaseUrl}/authorize/?` + auth_query_parameters.toString());
    }

    static async onCallback(req, res, context, db) {
        CLI.info(`Spotify API callback received.`);
        const code = req.query.code;
        const authData = {
            code: code,
            redirect_uri: `${process.env.DEPLOYMENT_URL}/api/spotify-callback`,
            grant_type: 'authorization_code'
        };

        const headers = {
            'Authorization': 'Basic ' + (Buffer.from(SpotifyApi.CLIENT_ID + ':' + SpotifyApi.CLIENT_SECRET).toString('base64')),
            'Content-Type': 'application/x-www-form-urlencoded'
        };

        axios({
            method: 'post',
            url: `${spotifyConfig.accountsBaseUrl}/api/token`,
            data: qs.stringify(authData),
            headers: headers
        })
            .then(async (response) => {
                if (response.status === 200) {
                    CLI.info(`Spotify API token received.`);
                    context.apis.spotify = response.data;
                    context.apis.spotify.expires_at = Date.now() + (context.apis.spotify.expires_in * 1000);
                    await db.updateContext(req.user.id, JSON.stringify(context));
                    res.redirect('/spotify-login-success');
                }
            })
            .catch(function (error) {
                CLI.error(`Error while getting Spotify API token: ${error}`);
            });
    }

    static getDefaultHeaders(context) {
        return {
            'Authorization': 'Bearer ' + context.apis.spotify.access_token,
            'Content-Type': 'application/json'
        };
    }

    static runSpotifyAction(text, context, actionName, startTime) {
        const possibleActions = [
            PlayNextAction,
            PlayPreviousAction,
            GetPlayingAction,
            SetRepeatModeAction,
            StartPlaybackAction,
            StopPlaybackAction,
            SearchAction
        ];
        for (const action of possibleActions) {
            if (action.name === actionName) {
                return action.execute(text, context, startTime);
            }
        }
        return null;
    }

    static async getDevices(context) {
        try {
            const res = await axios({
                method: 'GET',
                url: `${spotifyConfig.apiBaseUrl}/me/player/devices`,
                headers: SpotifyApi.getDefaultHeaders(context)
            });
            if (res.status === 200) {
                return res.data.devices;
            }
        } catch (e) {
            CLI.error(e);
            return [];
        }
    }

    static async getContextTracks(contextUri, context) {
        try {
            const url = `${spotifyConfig.apiBaseUrl}/${contextUri.includes('album') ? "albums" : "playlists"}/${SpotifyApi.getContextId(contextUri)}/tracks`;
            const res = await axios({
                method: 'GET',
                url,
                headers: SpotifyApi.getDefaultHeaders(context)
            });
            if (res.status === 200) {
                return res.data.items.map(track => track.uri);
            }
        } catch (e) {
            CLI.error(e);
            return [];
        }
    }

    static getContextId(text) {
        return text.split(":")[2];
    }

    static async refreshToken(refreshToken) {
        try {
            const refreshData = {grant_type: 'refresh_token', refresh_token: refreshToken};
            const headers = {
                'Authorization': 'Basic ' + (Buffer.from(SpotifyApi.CLIENT_ID + ':' + SpotifyApi.CLIENT_SECRET).toString('base64')),
                'Content-Type': 'application/x-www-form-urlencoded'
            };
            const response = await axios({
                method: 'post',
                url: `${spotifyConfig.accountsBaseUrl}/api/token`,
                data: qs.stringify(refreshData),
                headers: headers
            });
            if (response.status === 200) {
                CLI.debug(`Spotify API refresh token received.`);
                return response.data;
            }
        } catch (error) {
            CLI.error(`Error while refreshing Spotify API token: ${error}`);
        }
        return null;
    }
}