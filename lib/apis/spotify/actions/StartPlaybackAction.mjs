import {GenericSpotifyAction} from "./GenericSpotifyAction.mjs";
import {TextParser} from "../../../parsers/TextParser.mjs";
import axios from "axios";
import {SpotifyApi} from "../SpotifyApi.mjs";

export class StartPlaybackAction extends GenericSpotifyAction {
    static isIntendedAction(text) {
        const words = [
            "start",
            "play",
            "weiter",
            "weitermachen",
            "weiter machen",
            "resume"
        ];
        return words.some(word => TextParser.includesWord(text, word));
    }

    static async execute(text, context) {
        const result = await StartPlaybackAction.executeInternal(context);
        if (result) {
            return [
                {
                    type: "system-response",
                    text: "Used Spotify API to start playback"
                },
                {
                    type: "assistant-response",
                    text: `Started playback`,
                    canBeCached: true
                }
            ];
        } else {
            return [{
                type: "assistant-response",
                text: "Failed to start playback.",
                canBeCached: true
            }];
        }
    }

    static async executeInternal(context) {
        try {
            const res = await axios({
                method: 'put',
                url: `https://api.spotify.com/v1/me/player/play`,
                headers: SpotifyApi.getDefaultHeaders(context)
            });
            if (res.status === 204) {
                return res.data;
            }
        } catch (e) {
            console.log(e);
            return null;
        }
    }
}