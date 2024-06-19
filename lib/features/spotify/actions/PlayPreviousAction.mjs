import {GenericSpotifyAction} from "./GenericSpotifyAction.mjs";
import {TextParser} from "../../../tooling/TextParser.mjs";
import axios from "axios";
import {SpotifyApi} from "../api/SpotifyApi.mjs";
import {CLI} from "../../../tooling/CLI.mjs";
import {MessageTypes} from "../../../context/MessageTypes.mjs";
import {spotifyConfig} from "../SpotifyConfig.mjs";

export class PlayPreviousAction extends GenericSpotifyAction {
    static name = "playPrevious";

    static async execute(text, context, startTime) {
        if (await PlayPreviousAction.executeInternal(context)) {
            return [
                {
                    type: MessageTypes.systemResponse,
                    text: "Used Spotify API to play previous song",
                    timeToResponse: Date.now() - startTime
                },
                {
                    type: MessageTypes.assistantResponse,
                    text: "Playing previous song",
                    canBeCached: true,
                    timeToResponse: Date.now() - startTime
                }
            ];
        } else {
            return [{
                type: MessageTypes.assistantResponse,
                text: "Failed to play previous song",
                canBeCached: true,
                timeToResponse: Date.now() - startTime
            }];
        }
    }

    static async executeInternal(context) {
        try {
            const res = await axios({
                method: 'post',
                url: `${spotifyConfig.apiBaseUrl}/me/player/previous`,
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
            return false;
        }
    }
}