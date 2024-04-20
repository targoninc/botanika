import {GenericSpotifyAction} from "./GenericSpotifyAction.mjs";
import {TextParser} from "../../../parsers/TextParser.mjs";
import axios from "axios";
import {SpotifyApi} from "../SpotifyApi.mjs";
import {CLI} from "../../../CLI.mjs";
import {MessageTypes} from "../../../context/MessageTypes.mjs";

export class PlayNextAction extends GenericSpotifyAction {
    static isIntendedAction(text) {
        const words = [
            "next",
            "skip",
        ];
        return words.some(word => TextParser.includesWord(text, word));
    }

    static async execute(text, context, startTime) {
        if (await PlayNextAction.executeInternal(context)) {
            return [
                {
                    type: MessageTypes.systemResponse,
                    text: "Used Spotify API to play next song",
                    timeToResponse: Date.now() - startTime
                },
                {
                    type: MessageTypes.assistantResponse,
                    text: "Playing next song",
                    canBeCached: true,
                    timeToResponse: Date.now() - startTime
                }
            ];
        } else {
            return [{
                type: MessageTypes.assistantResponse,
                text: "Failed to play next song",
                canBeCached: true,
                timeToResponse: Date.now() - startTime
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
            if (e.response.status === 401) {
                delete context.apis.spotify;
            } else {
                CLI.error(e);
            }
            return false;
        }
    }
}