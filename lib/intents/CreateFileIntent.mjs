import {TextParser} from "../parsers/TextParser.mjs";
import {GenericIntent} from "./GenericIntent.mjs";
import {MessageTypes} from "../context/MessageTypes.mjs";
import {Completion} from "../Completion.mjs";

export class CreateFileIntent extends GenericIntent {
    static name = "createFile";

    static isIntended(text, context) {
        const words = [
            'create',
            'make',
            'erstelle',
            'schreibe',
            'write',
            'file',
            'datei',
            'csv',
            'excel',
        ];
        return words.some(word => TextParser.includesWord(text, word));
    }

    static async execute(text, context) {
        const startTime = Date.now();
        try {
            const data = await CreateFileIntent.getDataToWrite(text);
            return [
                {
                    type: MessageTypes.assistantData,
                    text: data,
                    timeToResponse: Date.now() - startTime
                }
            ];
        } catch (e) {
            console.error(e);
        }

        return [
            {
                type: MessageTypes.assistantResponse,
                text: "I couldn't figure out what kind of file you want to create and what data you want to write to it.",
                timeToResponse: Date.now() - startTime
            }
        ]
    }

    static async getDataToWrite(text) {
        const example = {
            text: "create a csv file with headers 'name' and 'age'. Add the rows 'Alice', 25 and 'Bob', 30",
            result: "name,age\nAlice,25\nBob,30"
        };
        const systemPrompt = `Take the best guess at what kind of file the user wants to create and what data they want to write to it.
        E.g. if the user says '${example.text}', then return '${example.result}'. Only return the file data and nothing else.`;
        const messages = [
            {role: "system", content: systemPrompt},
            {role: "user", content: text},
        ];

        const completionProvider = Completion.getProvider();
        const completion = await Completion.complete(completionProvider, messages, "quick");

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