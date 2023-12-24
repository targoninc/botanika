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

    static isIntended(text, language) {
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
        if (!context.apis.spotify) {
            return [{
                type: 'assistant-response',
                text: `Please login to Spotify first.`,
                canBeCached: true
            }];
        } else {
            const result = SpotifyApi.runSpotifyAction(text, context);
            if (result) {
                return result;
            } else {
                return [{
                    type: 'assistant-response',
                    text: `Sorry, I don't know what you want me to do.`,
                    canBeCached: true
                }];
            }
        }
    }
}