import {GenericIntent} from "./GenericIntent.mjs";
import {TextParser} from "../parsers/TextParser.mjs";
import {DB} from "../db/DB.mjs";
import OpenAI from "openai";

export class DatabaseIntent extends GenericIntent {
    static name = 'database';
    static isIntended(text, language) {
        const words = [
            'database',
            'query',
            'datenbank'
        ];
        return words.some(word => TextParser.includesWord(text, word));
    }

    static isDisabled() {
        const neededEnvVars = [
            "DB_INTENT_URL",
            "DB_INTENT_USER",
            "DB_INTENT_PASSWORD"
        ];
        return neededEnvVars.some(envVar => !process.env[envVar]);
    }

    static async execute(text, context) {
        const db = new DB(process.env.DB_INTENT_URL, process.env.DB_INTENT_USER, process.env.DB_INTENT_PASSWORD);
        await db.connect();
        const tablesWithDBs = await DatabaseIntent.getExistingTableNamesWithDBs(db);
        const likelyQuery = await DatabaseIntent.getLikelyQuery(text, tablesWithDBs);
        if (!likelyQuery.startsWith("SELECT")) {
            console.log(likelyQuery);
            return null;
        }
        const result = await db.query(likelyQuery);
        return [{
            type: "assistant-data",
            text: JSON.stringify(result)
        }];
    }

    static async getLikelyQuery(text, tablesWithDBs) {
        const openAi = new OpenAI();
        const prompt = `The following is a data query for a database. Give your best to construct a MariaDB query that returns the requested data based on the existing tables. Only return the query, no explanations. Explicitly leave out columns that seem like they contain personal information (like email, password, etc.).`;
        const response = await openAi.chat.completions.create({
            messages: [
                { role: "system", content: prompt },
                { role: "system", content: "Available tables: " + tablesWithDBs.join(", ") },
                { role: "user", content: text }
            ],
            model: "gpt-4-1106-preview",
        });
        const raw = response.choices[0].message.content;
        return raw.replace("```sql\n", "").replace("```", "");
    }

    static async getExistingTableNamesWithDBs(db) {
        const query = "SELECT table_name, table_schema FROM information_schema.tables WHERE table_schema NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')";
        const result = await db.query(query);
        if (result.length > 100) {
            return result.map(row => {
                return row.table_schema + "." + row.table_name;
            });
        }
        return await Promise.all(result.map(async row => {
            const tableColumnQuery = `SELECT column_name FROM information_schema.columns WHERE table_schema = '${row.table_schema}' AND table_name = '${row.table_name}'`;
            const tableColumns = await db.query(tableColumnQuery);
            const columnNames = tableColumns.map(row => row.column_name);
            return row.table_schema + "." + row.table_name + " (" + columnNames.join(", ") + ")";
        }));
    }
}