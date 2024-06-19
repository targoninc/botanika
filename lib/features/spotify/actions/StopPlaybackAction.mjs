import {GenericSpotifyAction} from "./GenericSpotifyAction.mjs";
import {TextParser} from "../../../tooling/TextParser.mjs";
import axios from "axios";
import {SpotifyApi} from "../api/SpotifyApi.mjs";
import {CLI} from "../../../tooling/CLI.mjs";
import {MessageTypes} from "../../../context/MessageTypes.mjs";
import {spotifyConfig} from "../SpotifyConfig.mjs";

export class StopPlaybackAction extends GenericSpotifyAction {
    static name = "stopPlayback";

    static async execute(text, context, startTime) {
        const result = await StopPlaybackAction.executeInternal(context);
        if (result) {
            return [
                {
                    type: MessageTypes.systemResponse,
                    text: "Used Spotify API to stop playback",
                    timeToResponse: Date.now() - startTime
                }
            ];
        } else {
            return [{
                type: MessageTypes.assistantResponse,
                text: "Failed to stop playback.",
                canBeCached: true,
                timeToResponse: Date.now() - startTime
            }];
        }
    }

    static async executeInternal(context) {
        try {
            const res = await axios({
                method: 'PUT',
                url: `${spotifyConfig.apiBaseUrl}/me/player/pause`,
                headers: SpotifyApi.getDefaultHeaders(context)
            });
            if (res.status === 204) {
                return true;
            }
        } catch (e) {
            if (e.response.status === 401) {
                delete context.apis.spotify;
            } else {
                CLI.error(e);
            }
            return null;
        }
    }
}