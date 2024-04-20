import {GenericSpotifyAction} from "./GenericSpotifyAction.mjs";
import {TextParser} from "../../../parsers/TextParser.mjs";
import axios from "axios";
import {SpotifyApi} from "../SpotifyApi.mjs";

export class SearchAction extends GenericSpotifyAction {
    static isIntendedAction(text) {
        const words = [
            "search",
            "suche",
            "such",
            "finde",
            "find",
            "finden",
            "suchen",
            "suche",
            "finde",
        ];
        return words.some(word => TextParser.includesWord(text, word));
    }

    static async execute(text, context, startTime) {
        const parameter = SearchAction.getParameter(text, context);
        const result = await SearchAction.executeInternal(context, parameter);
        if (result) {
            return [
                {
                    type: "system-response",
                    text: "Used Spotify API to search for results",
                    timeToResponse: Date.now() - startTime
                },
                {
                    type: "assistant-response",
                    text: `I found the following results for "${parameter}":`,
                    canBeCached: false,
                    timeToResponse: Date.now() - startTime
                },
                {
                    type: "assistant-data",
                    text: JSON.stringify(SearchAction.buildResultData(result)),
                    timeToResponse: Date.now() - startTime
                }
            ];
        } else {
            return [{
                type: "assistant-response",
                text: "Failed to search for results.",
                canBeCached: true,
                timeToResponse: Date.now() - startTime
            }];
        }
    }

    static buildResultData(result) {
        const resultData = [];
        if (result.tracks.items.length > 0) {
            resultData.push({
                type: "track",
                name: result.tracks.items[0].name,
                artist: result.tracks.items[0].artists.map(a => a.name).join(", "),
                uri: result.tracks.items[0].uri
            });
        }
        if (result.albums.items.length > 0) {
            resultData.push({
                type: "album",
                name: result.albums.items[0].name,
                artist: result.albums.items[0].artists.map(a => a.name).join(", "),
                uri: result.albums.items[0].uri
            });
        }
        if (result.artists.items.length > 0) {
            resultData.push({
                type: "artist",
                name: result.artists.items[0].name,
                uri: result.artists.items[0].uri
            });
        }
        if (result.playlists.items.length > 0) {
            resultData.push({
                type: "playlist",
                name: result.playlists.items[0].name,
                uri: result.playlists.items[0].uri
            });
        }
        return resultData;
    }

    static getParameter(text, context) {
        const words = [
            "for",
            "nach",
        ];
        const result = TextParser.getTextAfterWords(text, words);
        if (result) {
            return result;
        } else {
            return TextParser.getTextAfter(text, ":");
        }
    }

    static async executeInternal(context, parameter) {
        try {
            const res = await axios({
                method: 'GET',
                url: `https://api.spotify.com/v1/search`,
                headers: SpotifyApi.getDefaultHeaders(context),
                params: {
                    q: parameter,
                    type: "track,album,artist,playlist"
                }
            });
            if (res.status === 200) {
                return res.data;
            }
        } catch (e) {
            if (e.response.status === 401) {
                delete context.apis.spotify;
            } else {
                console.log(e);
            }
            return null;
        }
    }
}