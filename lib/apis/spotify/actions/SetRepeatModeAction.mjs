import {GenericSpotifyAction} from "./GenericSpotifyAction.mjs";
import {TextParser} from "../../../parsers/TextParser.mjs";
import axios from "axios";
import {SpotifyApi} from "../SpotifyApi.mjs";

export class SetRepeatModeAction extends GenericSpotifyAction {
    static isIntendedAction(text) {
        const words = [
            "repeat",
            "wiederholen",
            "loop",
            "schleife"
        ];
        return words.some(word => TextParser.includesWord(text, word));
    }

    static async execute(text, context) {
        const parameter = SetRepeatModeAction.getRepeatModeParameter(text);
        const result = await SetRepeatModeAction.executeInternal(context, parameter);
        if (result && parameter) {
            return [
                {
                    type: "system-response",
                    text: "Used Spotify API to update repeat mode"
                },
                {
                    type: "assistant-response",
                    text: ``
                }
            ];
        } else {
            return [{
                type: "assistant-response",
                text: "Failed to get currently playing track."
            }];
        }
    }

    static async executeInternal(context, parameter) {
        try {
            const res = await axios({
                method: 'get',
                url: `https://api.spotify.com/v1/me/player/repeat?state=${parameter}`,
                headers: SpotifyApi.getDefaultHeaders(context)
            });
            if (res.status === 200) {
                return res.data;
            }
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    static getRepeatModeParameter(text) {
        const paramWordMap = {
            "track": ["track", "song", "lied"],
            "context": ["context", "playlist", "album", "artist"],
            "off": ["off", "aus", "ausgeschaltet", "ausmachen", "ausmachen", "ausstellen", "deaktivieren"]
        };
        for (const [param, words] of Object.entries(paramWordMap)) {
            if (words.some(word => TextParser.includesWord(text, word))) {
                return param;
            }
        }
        return null;
    }
}