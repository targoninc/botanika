import {GenericIntent} from "../../intents/GenericIntent.mjs";
import {MessageTypes} from "../../MessageTypes.mjs";
import {Completion} from "../../tooling/Completion.mjs";
import {ToolBuilder} from "../../actions/ToolBuilder.mjs";
import {ToolParameter} from "../../actions/ToolParameter.mjs";

export class CreateFileIntent extends GenericIntent {
    static name = "createFile";

    static getTool() {
        return {
            tool: ToolBuilder.function("createFile")
                .description("Create a file. Only use this if explicitely asked to create a file, table or list.")
                .parameters(ToolParameter.object()
                    .property("content", "string", "The content of the file.")
                    .required("content")
                    .parameter
                ).tool,
            toolFunction: async (text, context, parameters) => {
                return await CreateFileIntent.execute(text, context, parameters.content);
            }
        }
    }

    static async execute(text, context, content) {
        const startTime = Date.now();
        try {
            return [
                {
                    type: MessageTypes.assistantData,
                    text: content,
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