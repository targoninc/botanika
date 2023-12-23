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
        const device = await StartPlaybackAction.executeInternal(context, null);
        if (device) {
            return [
                {
                    type: "system-response",
                    text: "Used Spotify API to start playback"
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

    static async executeInternal(context, device) {
        console.log(device);
        try {
            const res = await axios({
                method: 'PUT',
                url: `https://api.spotify.com/v1/me/player/play${device ? `?device_id=${device.id}` : ''}`,
                headers: SpotifyApi.getDefaultHeaders(context)
            });
            if (res.status === 204) {
                return device || { name: 'your default device' };
            }
        } catch (e) {
            if (e.response.status === 404 && !device) {
                const devices = await SpotifyApi.getDevices(context);
                if (devices.length > 0) {
                    const firstDevice = devices[0];
                    return await StartPlaybackAction.executeInternal(context, firstDevice);
                }
            }
            if (e.response.status === 401) {
                delete context.apis.spotify;
            } else {
                console.log(e);
            }
            return null;
        }
    }
}