import {GenericIntent} from "../../intents/GenericIntent.mjs";
import {SpotifyApi} from "./api/SpotifyApi.mjs";
import {ToolBuilder} from "../../actions/ToolBuilder.mjs";
import {ToolParameter} from "../../actions/ToolParameter.mjs";

export class SpotifyIntent extends GenericIntent {
    static name = 'spotify';
    static isDisabled() {
        const neededEnvVars = [
            "SPOTIFY_CLIENT_ID",
            "SPOTIFY_CLIENT_SECRET"
        ];
        return neededEnvVars.some(envVar => !process.env[envVar]);
    }

    static getTool() {
        return {
            tool: ToolBuilder.function('spotify')
                .description('Use the Spotify API to do something related to music.')
                .parameters(ToolParameter.object()
                    .property("action", "string", "The action to perform. Can be 'playNext', 'playPrevious', 'getPlaying', 'setRepeatMode', 'startPlayback', 'stopPlayback' or 'search'.")
                    .required("action")
                    .parameter
                ).tool,
            toolFunction: async (text, context, parameters) => {
                return await SpotifyIntent.execute(text, context, parameters.action);
            }
        }
    }

    static async execute(text, context, action) {
        const startTime = Date.now();
        if (!context.apis.spotify) {
            return null;
        } else {
            const result = SpotifyApi.runSpotifyAction(text, context, action, startTime);
            if (result) {
                return result;
            } else {
                return null;
            }
        }
    }
}