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

    static async onCallback(req, res) {
        const code = req.query.code;

        const authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: "http://localhost:3000/api/spotify-callback",
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (Buffer.from(SpotifyApi.CLIENT_ID + ':' + SpotifyApi.CLIENT_SECRET).toString('base64')),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            json: true
        };

        request.post(authOptions, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                const access_token = body.access_token;
                res.redirect('/')
            }
        });
    }
}