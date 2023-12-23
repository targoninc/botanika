import {GenericSpotifyAction} from "./GenericSpotifyAction.mjs";
import {TextParser} from "../../../parsers/TextParser.mjs";
import axios from "axios";
import {SpotifyApi} from "../SpotifyApi.mjs";

export class GetPlayingAction extends GenericSpotifyAction {
    static isIntendedAction(text) {
        const words = [
            'playing',
            'spielt',
            'spielen',
            'spielt gerade',
            'läuft gerade',
            'läuft',
        ];
        return words.some(word => TextParser.includesWord(text, word));
    }

    static async execute(text, context) {
        const result = await GetPlayingAction.executeInternal(context);
        if (result) {
            return [
                {
                    type: "system-response",
                    text: "Used Spotify API to get currently playing track"
                },
                {
                    type: "assistant-response",
                    text: `Currently playing: ${result.item.name} by ${result.item.artists.map(a => a.name).join(", ")}`,
                    canBeCached: false
                }
            ];
        } else {
            return [{
                type: "assistant-response",
                text: "Failed to get currently playing track.",
                canBeCached: true
            }];
        }
    }

    static async executeInternal(context) {
        try {
            const res = await axios({
                method: 'get',
                url: `https://api.spotify.com/v1/me/player/currently-playing`,
                headers: SpotifyApi.getDefaultHeaders(context)
            });
            if (res.status === 200) {
                return res.data;
            }
        } catch (e) {
            if (e.response.status === 401) {
                delete context.apis.spotify;
            }
            return null;
        }
    }
}