import {GenericIntent} from "./GenericIntent.mjs";

export class MusicIntent extends GenericIntent {
    static name = 'music';
    static isDisabled() {
        const neededEnvVars = [
            "SPOTIFY_CLIENT_ID",
            "SPOTIFY_CLIENT_SECRET"
        ];
        return neededEnvVars.some(envVar => !process.env[envVar]);
    }
}