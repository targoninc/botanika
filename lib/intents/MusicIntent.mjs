import {GenericIntent} from "./GenericIntent.mjs";
import {TextParser} from "../parsers/TextParser.mjs";

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
            'lied',
            'musik',
            'spotify',
            'play',
            'abspielen'
        ];
        return words.some(word => TextParser.includesWord(text, word));
    }

    static async execute(text, context) {
        if (!context.spotifyAccessToken) {
            return [{
                type: 'assistant-response',
                text: `Please login to Spotify first.`
            }];
        }
    }
}