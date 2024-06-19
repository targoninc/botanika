import {GenericSpotifyAction} from "./GenericSpotifyAction.mjs";
import {TextParser} from "../../../tooling/TextParser.mjs";
import axios from "axios";
import {SpotifyApi} from "../api/SpotifyApi.mjs";
import {CLI} from "../../../tooling/CLI.mjs";
import {Context} from "../../../context/Context.mjs";
import {MessageTypes} from "../../../context/MessageTypes.mjs";
import {spotifyConfig} from "../SpotifyConfig.mjs";

export class StartPlaybackAction extends GenericSpotifyAction {
    static name = "startPlayback";

    static shouldGetUris(text, context) {
        const words = [
            "found",
            "results",
            "result",
            "gefunden",
            "ergebnisse",
            "ergebnis"
        ];
        return words.some(word => TextParser.includesWord(text, word))
            || Context.lastMessageIsType(context, MessageTypes.assistantData);
    }

    static async execute(text, context, startTime) {
        let uris = [];
        if (StartPlaybackAction.shouldGetUris(text, context)) {
            uris = StartPlaybackAction.getUris(text, context);
        }
        const device = await StartPlaybackAction.executeInternal(context, null, uris);
        if (device) {
            return [
                {
                    type: MessageTypes.systemResponse,
                    text: `Used Spotify API to start playback on ${device.name}.`,
                    timeToResponse: Date.now() - startTime
                }
            ];
        } else {
            return [{
                type: MessageTypes.assistantResponse,
                text: "Failed to start playback.",
                canBeCached: true,
                timeToResponse: Date.now() - startTime
            }];
        }
    }

    static async executeInternal(context, device, uris, isRecursive = false) {
        try {
            if (!device) {
                if (isRecursive) {
                    CLI.error("No devices for Spotify playback found.");
                    return null;
                }
                const devices = await SpotifyApi.getDevices(context);
                if (devices.length > 0) {
                    const firstDevice = devices[0];
                    return await StartPlaybackAction.executeInternal(context, firstDevice, uris, true);
                }
            }

            CLI.debug(`Starting playback on ${device.name}`);

            const data = {
                position_ms: 0
            };

            const contextUris = uris.filter(uri => uri.includes("album") || uri.includes("playlist"));
            if (contextUris.length > 0) {
                data.context_uri = contextUris[0];
            } else {
                data.uris = await StartPlaybackAction.getTrackUris(uris, context);
            }

            const res = await axios({
                method: 'PUT',
                url: `${spotifyConfig.apiBaseUrl}/me/player/play`,
                headers: SpotifyApi.getDefaultHeaders(context),
                params: {
                    device_id: device ? device.id : null,
                },
                data
            });
            if (res.status === 204) {
                return device || {name: 'your default device'};
            }
        } catch (e) {
            if (e.response.status === 401) {
                delete context.apis.spotify;
            } else {
                CLI.object(e.response.data);
            }
            return null;
        }
    }

    static async getTrackUris(uris, context) {
        const existing = uris.filter(uri => uri.includes("track"));
        if (existing.length > 0) {
            return existing;
        }

        const contexts = uris.filter(uri => uri.includes("album") || uri.includes("playlist"));
        if (contexts.length === 0) {
            return [];
        }

        const firstContext = contexts[0];
        return await SpotifyApi.getContextTracks(firstContext, context);
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
                    } else if (text.includes("album")) {
                        data = data.filter(d => d.type === "album");
                    } else if (text.includes("artist")) {
                        data = data.filter(d => d.type === "artist");
                    } else if (text.includes("playlist")) {
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