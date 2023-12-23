import {GenericSpotifyAction} from "./GenericSpotifyAction.mjs";
import {TextParser} from "../../../parsers/TextParser.mjs";
import axios from "axios";
import {SpotifyApi} from "../SpotifyApi.mjs";

export class PlayNextAction extends GenericSpotifyAction {
    static isIntendedAction(text) {
        const words = [
            "next",
            "skip",
        ];
        return words.some(word => TextParser.includesWord(text, word));
    }

    static async execute(text, context) {
        if (await PlayNextAction.executeInternal(context)) {
            return [
                {
                    type: "system-response",
                    text: "Used Spotify API to play next song"
                },
                {
                    type: "assistant-response",
                    text: "Playing next song",
                    canBeCached: true
                }
            ];
        } else {
            return [{
                type: "assistant-response",
                text: "Failed to play next song",
                canBeCached: true
            }];
        }
    }

    static async executeInternal(context) {
        try {
            const res = await axios({
                method: 'post',
                url: `https://api.spotify.com/v1/me/player/next`,
                headers: SpotifyApi.getDefaultHeaders(context)
            });
            if (res.status === 204) {
                return true;
            }
        } catch (e) {
            console.log(e);
            return false;
        }
    }
}