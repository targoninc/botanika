import {GenericSpotifyAction} from "./GenericSpotifyAction.mjs";
import {TextParser} from "../../../parsers/TextParser.mjs";
import axios from "axios";
import {SpotifyApi} from "../SpotifyApi.mjs";
import {CLI} from "../../../CLI.mjs";
import {MessageTypes} from "../../../context/MessageTypes.mjs";

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

    static async execute(text, context, startTime) {
        const result = await GetPlayingAction.executeInternal(context);
        if (result) {
            return [
                {
                    type: MessageTypes.systemResponse,
                    text: "Used Spotify API to get currently playing track",
                    timeToResponse: Date.now() - startTime
                },
                {
                    type: MessageTypes.assistantResponse,
                    text: `Currently playing: ${result.item.name} by ${result.item.artists.map(a => a.name).join(", ")}`,
                    canBeCached: false,
                    timeToResponse: Date.now() - startTime
                }
            ];
        } else {
            return [{
                type: MessageTypes.assistantResponse,
                text: "Failed to get currently playing track.",
                canBeCached: true,
                timeToResponse: Date.now() - startTime
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
            } else {
                CLI.error(e);
            }
            return null;
        }
    }
}