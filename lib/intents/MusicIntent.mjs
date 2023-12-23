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
        const spotify = new Spotify(process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET);
        await spotify.connect();
        const song = await MusicIntent.getSong(text, spotify);
        const result = await spotify.playSong(song);
        return {
            type: 'assistant-response',
            text: `Playing ${song.name} by ${song.artist}`
        };
    }
}