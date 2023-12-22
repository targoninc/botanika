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
            'datenbank',
            'abfrage',
            'sql',
            'mariadb',
            'mysql',
            'know how to',
            'wissen wie ich',
            'wissen wie man'
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
        let query = likelyQuery;
        if (likelyQuery.includes("LIKE")) {
            query = await DatabaseIntent.improveQuery(likelyQuery, db);
        }
        console.log(`Executing query: ${query}`);
        const start = new Date().getTime();
        const result = await db.query(query);
        await db.close();
        const end = new Date().getTime();
        console.log(`Query finished after ${end - start}ms`);
        return [{
            type: "assistant-data",
            text: JSON.stringify(result)
        }];
    }

    static async improveQuery(query, db) {
        console.log(`Improving query: ${query}`);
        const table = query.split("FROM")[1].split(" ")[1];
        const columnInfoQuery = `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = '${table.split(".")[0]}' AND table_name = '${table.split(".")[1]}'`;
        const columnInfo = await db.query(columnInfoQuery);
        const indexInfoQuery = `SELECT index_name, column_name FROM information_schema.statistics WHERE table_schema = '${table.split(".")[0]}' AND table_name = '${table.split(".")[1]}'`;
        const indexInfo = await db.query(indexInfoQuery);
        const columnInfoMap = {};
        columnInfo.forEach(row => {
            columnInfoMap[row.column_name] = row.data_type;
        });
        const openAi = new OpenAI();
        const response = await openAi.chat.completions.create({
            messages: [
                { role: "system", content: "Improve the following query to make it more performant. Especially pay attention to indexes. When working with indexes, make sure they're used correctly. Only return the query string within markdown blocks, leaving out comments. Don't explain your thoughts. The query should return the same data. If there is nothing to improve, just return the original query. Whatever you do, only return query text." },
                { role: "system", content: "Column info: " + JSON.stringify(columnInfoMap) },
                { role: "system", content: "Index info: " + JSON.stringify(indexInfo) },
                { role: "user", content: query }
            ],
            model: "gpt-4-1106-preview",
        });
        const raw = response.choices[0].message.content;
        return raw.replace("```sql\n", "").replace("```", "");
    }

    static async getLikelyQuery(text, tablesWithDBs) {
        const openAi = new OpenAI();
        const prompt = `The following is a data query for a database. Give your best to construct a MariaDB query that returns the requested data based on the existing tables. Only return the query, no explanations.`;
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
        const ownTables = ["context"];
        const query = "SELECT table_name, table_schema FROM information_schema.tables WHERE table_schema NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys') AND table_name NOT IN ('" + ownTables.join("', '") + "')";
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