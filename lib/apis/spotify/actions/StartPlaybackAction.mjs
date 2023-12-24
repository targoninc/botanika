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

    static shouldGetUris(text) {
        const words = [
            "found",
            "results",
            "result",
            "gefunden",
            "ergebnisse",
            "ergebnis"
        ];
        return words.some(word => TextParser.includesWord(text, word));
    }

    static async execute(text, context) {
        let uris = [];
        if (StartPlaybackAction.shouldGetUris(text)) {
            console.log("Getting URIs from data");
            uris = StartPlaybackAction.getUris(text, context);
            console.log("Found URIs: " + uris.join(", "));
        }
        const device = await StartPlaybackAction.executeInternal(context, null, uris);
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

    static async executeInternal(context, device, uris) {
        try {
            const res = await axios({
                method: 'PUT',
                url: `https://api.spotify.com/v1/me/player/play`,
                headers: SpotifyApi.getDefaultHeaders(context),
                params: {
                    device_id: device ? device.id : null,
                },
                data: {
                    uris: uris
                }
            });
            if (res.status === 204) {
                return device || { name: 'your default device' };
            }
        } catch (e) {
            if (e.response.status === 404 && !device) {
                const devices = await SpotifyApi.getDevices(context);
                if (devices.length > 0) {
                    const firstDevice = devices[0];
                    return await StartPlaybackAction.executeInternal(context, firstDevice, uris);
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

    static getUris(text, context) {
        const regex = /spotify:(track|album|artist|playlist):[a-zA-Z0-9]+/g;
        const uris = [];
        let match;
        while ((match = regex.exec(text)) !== null) {
            uris.push(match[0]);
        }
        if (uris.length === 0 && context) {
            const dataHistory = [...context.history].filter(h => h.type === "assistant-data");
            if (dataHistory.length > 0) {
                for (let i = dataHistory.length - 1; i >= 0; i--) {
                    const message = dataHistory[i];
                    let data = JSON.parse(message.text);
                    if (text.includes("track")) {
                        data = data.filter(d => d.type === "track");
                    }
                    if (text.includes("album")) {
                        data = data.filter(d => d.type === "album");
                    }
                    if (text.includes("artist")) {
                        data = data.filter(d => d.type === "artist");
                    }
                    if (text.includes("playlist")) {
                        data = data.filter(d => d.type === "playlist");
                    }
                    const uris = StartPlaybackAction.getUris(JSON.stringify(data));
                    if (uris.length > 0) {
                        return uris;
                    }
                }
            }
            const userHistory = [...context.history].filter(h => h.type === "user-message");
            if (userHistory.length > 0) {
                for (let i = userHistory.length - 1; i >= 0; i--) {
                    const message = userHistory[i];
                    const uris = StartPlaybackAction.getUris(message.text);
                    if (uris.length > 0) {
                        return uris;
                    }
                }
            }
        }
        return uris;
    }
}