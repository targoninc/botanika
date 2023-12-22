import {TextParser} from "../parsers/TextParser.mjs";
import OpenAI from "openai";
import {GenericIntent} from "./GenericIntent.mjs";

export class OpenIntent extends GenericIntent {
    static name = "generic";

    static isIntended(text) {
        const words = [
            'open',
            'öffne',
            'öffnen',
            'start',
            'starte',
            'starten',
            'ausführen',
            'ausführe',
            'run'
        ];
        return words.some(word => TextParser.includesWord(text, word));
    }

    static async execute(text, context) {
        const url = await OpenIntent.getUrlFromMessage(text);
        if (url) {
            return [
                {
                    type: "assistant-response",
                    text: "Opening " + url
                },
                {
                    type: "open-command",
                    text: "Opening " + url,
                    url: url
                }
            ]
        } else {
            return [
                {
                    type: "assistant-response",
                    text: "I couldn't figure out which URL you want to open."
                }
            ]
        }
    }

    static async getUrlFromMessage(text) {
        const systemPrompt = "Take a good guess at which URL the user wants to open. E.g. if the user says 'open netflix', then return 'https://www.netflix.com'. Only return the URL and nothing else. If you can't figure out the URL, return an empty message.";
        const openai = new OpenAI();

        const completion = await openai.chat.completions.create({
            messages: [
                {role: "system", content: systemPrompt},
                {role: "user", content: text},
            ],
            model: "gpt-3.5-turbo-1106",
        });

        const out = completion.choices[0].message.content;
        if (out && out.trim().length > 0) {
            return out;
        } else {
            return null;
        }
    }

    static isDisabled() {
        return false;
    }
}