import {GenericSpotifyAction} from "./GenericSpotifyAction.mjs";
import {TextParser} from "../../../tooling/TextParser.mjs";
import axios from "axios";
import {SpotifyApi} from "../api/SpotifyApi.mjs";
import {CLI} from "../../../tooling/CLI.mjs";
import {MessageTypes} from "../../../context/MessageTypes.mjs";
import {spotifyConfig} from "../SpotifyConfig.mjs";

export class SetRepeatModeAction extends GenericSpotifyAction {
    static isIntendedAction(text) {
        const words = [
            "repeat",
            "wiederholen",
            "wiederhole",
            "loop",
            "schleife"
        ];
        return words.some(word => TextParser.includesWord(text, word));
    }

    static async execute(text, context, startTime) {
        const parameter = SetRepeatModeAction.getRepeatModeParameter(text);
        const result = await SetRepeatModeAction.executeInternal(context, parameter);
        if (result && parameter) {
            return [
                {
                    type: MessageTypes.systemResponse,
                    text: "Used Spotify API to update repeat mode to " + parameter,
                    timeToResponse: Date.now() - startTime
                },
                {
                    type: MessageTypes.assistantResponse,
                    text: `Updated repeat mode to ${parameter}`,
                    canBeCached: true,
                    timeToResponse: Date.now() - startTime
                }
            ];
        } else {
            return [{
                type: MessageTypes.assistantResponse,
                text: "Failed to update repeat mode.",
                canBeCached: true,
                timeToResponse: Date.now() - startTime
            }];
        }
    }

    static async executeInternal(context, parameter) {
        try {
            const res = await axios({
                method: 'put',
                url: `${spotifyConfig.apiBaseUrl}/me/player/repeat?state=${parameter}`,
                headers: SpotifyApi.getDefaultHeaders(context)
            });
            if (res.status === 200) {
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