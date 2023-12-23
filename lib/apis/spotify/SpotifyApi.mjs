import axios from "axios";
import qs from "qs";
import {PlayNextAction} from "./actions/PlayNextAction.mjs";
import {PlayPreviousAction} from "./actions/PlayPreviousAction.mjs";
import {GetPlayingAction} from "./actions/GetPlayingAction.mjs";
import {SetRepeatModeAction} from "./actions/SetRepeatModeAction.mjs";
import {StartPlaybackAction} from "./actions/StartPlaybackAction.mjs";
import {StopPlaybackAction} from "./actions/StopPlaybackAction.mjs";

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

        console.log(`Spotify API login requested.`);
        const state = SpotifyApi.generateRandomString(16);

        const auth_query_parameters = new URLSearchParams({
            response_type: "code",
            client_id: SpotifyApi.CLIENT_ID,
            scope: scope,
            redirect_uri: `${process.env.DEPLOYMENT_URL}/api/spotify-callback`,
            state: state
        });

        res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString());
    }

    static async onCallback(req, res, context) {
        console.log(`Spotify API callback received.`);
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
            url: 'https://accounts.spotify.com/api/token',
            data: qs.stringify(authData),
            headers: headers
        })
            .then(function (response) {
                if (response.status === 200) {
                    context.apis.spotify = response.data;
                    context.apis.spotify.expires_at = Date.now() + (context.apis.spotify.expires_in * 1000);
                    console.log(`Spotify API token received.`);
                    res.redirect('/spotify-login-success');
                }
            })
            .catch(function (error) {
                console.log(`Error while getting Spotify API token: ${error}`);
            });
    }

    static getDefaultHeaders(context) {
        return {
            'Authorization': 'Bearer ' + context.apis.spotify.access_token,
            'Content-Type': 'application/json'
        };
    }

    static runSpotifyAction(text, context) {
        const possibleActions = [
            PlayNextAction,
            PlayPreviousAction,
            GetPlayingAction,
            SetRepeatModeAction,
            StartPlaybackAction,
            StopPlaybackAction
        ];
        for (const action of possibleActions) {
            if (action.isIntendedAction(text)) {
                return action.execute(text, context);
            }
        }
        return null;
    }
}