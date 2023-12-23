import axios from "axios";
import qs from "qs";

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
               user-read-private";

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
                    console.log(`Spotify API token received.`);
                    res.redirect('/spotify-login-success');
                }
            })
            .catch(function (error) {
                console.log(`Error while getting Spotify API token: ${error}`);
            });
    }
}