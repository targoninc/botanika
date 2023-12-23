import {GenericSpotifyAction} from "./GenericSpotifyAction.mjs";
import {TextParser} from "../../../parsers/TextParser.mjs";
import axios from "axios";
import {SpotifyApi} from "../SpotifyApi.mjs";

export class PlayPreviousAction extends GenericSpotifyAction {
    static isIntendedAction(text) {
        const words = [
            "previous",
            "back",
        ];
        return words.some(word => TextParser.includesWord(text, word));
    }

    static async execute(text, context) {
        if (await PlayPreviousAction.executeInternal(context)) {
            return [
                {
                    type: "system-response",
                    text: "Used Spotify API to play previous song"
                },
                {
                    type: "assistant-response",
                    text: "Playing previous song",
                    canBeCached: true
                }
            ];
        } else {
            return [{
                type: "assistant-response",
                text: "Failed to play previous song",
                canBeCached: true
            }];
        }
    }

    static async executeInternal(context) {
        try {
            const res = await axios({
                method: 'post',
                url: `https://api.spotify.com/v1/me/player/previous`,
                headers: SpotifyApi.getDefaultHeaders(context)
            });
            if (res.status === 204) {
                return true;
            }
        } catch (e) {
            if (e.response.status === 401) {
                delete context.apis.spotify;
            }
            return false;
        }
    }
}