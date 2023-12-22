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
        return false;
    }

    static async execute(text, context) {
        const db = new DB(process.env.MYSQL_URL);
        await db.connect();
        const dbs = await DatabaseIntent.getExistingDatabaseNames(db);
        const tables = await DatabaseIntent.getExistingTableNames(db);
        const likelyQuery = await DatabaseIntent.getLikelyQuery(text, dbs, tables);
        if (!likelyQuery.startsWith("SELECT")) {
            return [{
                type: "assistant-response",
                text: "Sorry, I could not help with your query. Please try again."
            }];
        }
        const result = await db.query(likelyQuery);
        return [{
            type: "assistant-data",
            text: JSON.stringify(result)
        }];
    }

    static async getLikelyQuery(text, dbs, tables) {
        const openAi = new OpenAI();
        const prompt = `The following is a data query for a database. The database contains the following tables: ${tables.join(", ")}. The database contains the following databases: ${dbs.join(", ")}. Give your best to construct a MariaDB query that returns the requested data. Only return the query, no explanations.`;
        const response = await openAi.chat.completions.create({
            messages: [
                { role: "system", content: prompt },
                { role: "user", content: text }
            ],
            model: "gpt-3.5-turbo",
        });
        return response.choices[0].message.content;
    }

    static async getExistingDatabaseNames(db) {
        const query = "SHOW DATABASES";
        return await db.query(query);
    }

    static async getExistingTableNames(db) {
        const query = "SHOW TABLES";
        return await db.query(query);
    }
}