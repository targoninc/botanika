import {GenericIntent} from "./GenericIntent.mjs";
import {TextParser} from "../parsers/TextParser.mjs";
import {SpotifyApi} from "../apis/spotify/SpotifyApi.mjs";

export class MusicIntent extends GenericIntent {
    static name = 'music';
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
            return [{
                type: 'assistant-response',
                text: `Please login to Spotify first.`,
                canBeCached: true,
                timeToResponse: Date.now() - startTime
            }];
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