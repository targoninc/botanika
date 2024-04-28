import {GenericIntent} from "../../intents/GenericIntent.mjs";
import {TextParser} from "../../tooling/TextParser.mjs";
import {SpotifyApi} from "./api/SpotifyApi.mjs";

export class SpotifyIntent extends GenericIntent {
    static name = 'spotify';
    static isDisabled() {
        const neededEnvVars = [
            "SPOTIFY_CLIENT_ID",
            "SPOTIFY_CLIENT_SECRET"
        ];
        return neededEnvVars.some(envVar => !process.env[envVar]);
    }

    static isIntended(text, context) {
        const words = [
            'music',
            'song',
            'track',
            'album',
            'lied',
            'musik',
            'spotify',
            'play',
            'playing',
            'artist',
            'abspielen',
            'playback',
            'wiedergabe'
        ];
        return words.some(word => TextParser.includesWord(text, word));
    }

    static async execute(text, context) {
        const startTime = Date.now();
        if (!context.apis.spotify) {
            return null;
        } else {
            const result = SpotifyApi.runSpotifyAction(text, context, startTime);
            if (result) {
                return result;
            } else {
                return null;
            }
        }
    }
}