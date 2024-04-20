import {GenericIntent} from "./GenericIntent.mjs";
import {TextParser} from "../parsers/TextParser.mjs";
import {DB} from "../db/DB.mjs";
import OpenAI from "openai";
import {ResponseAction} from "../actions/ResponseAction.mjs";
import {CLI} from "../CLI.mjs";

export class DatabaseIntent extends GenericIntent {
    static name = 'database';

    static isIntended(text, context) {
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
            'wissen wie man',
            'search for',
            'suche nach',
            'find',
            'get me',
            'inform me',
            'informieren',
            'info',
            'was ist',
            'what is',
            'list me',
            'list all',
            'zeig mir',
            'show me',
        ];
        const exclusionWords = [
            'you',
            'du',
            'wir'
        ];
        return words.some(word => TextParser.includesWord(text, word)) && !exclusionWords.some(word => TextParser.includesWord(text, word));
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
        const startTime = Date.now();
        const db = new DB(process.env.DB_INTENT_URL, process.env.DB_INTENT_USER, process.env.DB_INTENT_PASSWORD);
        await db.connect();
        const tablesWithDBs = await DatabaseIntent.getExistingTableNamesWithDBs(db);
        const likelyQuery = await DatabaseIntent.getLikelyQuery(text, tablesWithDBs);
        let query = likelyQuery;
        if (query.startsWith("ALTER")) {
            query = query.replace(/ALTER TABLE `.*` /, "").trim();
        }
        if (likelyQuery.includes("LIKE")) {
            query = await DatabaseIntent.improveQuery(likelyQuery, db);
        }
        let result;
        for (let i = 0; i < 3; i++) {
            try {
                result = await DatabaseIntent.executeQuery(query, db);
                if (result.length === 0) {
                    throw new Error("No data returned");
                }
            } catch (e) {
                CLI.info(e);
                const newQuery = await DatabaseIntent.improveQuery(query, db, e);
                if (newQuery === query) {
                    break;
                }
                continue;
            }
            break;
        }
        if (!result || result.length === 0) {
            return [{
                type: "assistant-response",
                text: "I'm sorry, I couldn't find any data for your query.",
                timeToResponse: Date.now() - startTime
            }];
        }
        await db.close();
        return [{
            type: "assistant-data",
            text: JSON.stringify(result),
            timeToResponse: Date.now() - startTime
        }];
    }

    static async executeQuery(query, db) {
        CLI.debug(`Executing query: ${query}`);
        const start = Date.now();
        const result = await db.query(query);
        const diff = Date.now() - start;
        if (diff < 1000) {
            CLI.debug(`Query finished after ${diff}ms`);
        } else {
            CLI.warning(`Query finished after ${diff}ms`);
        }
        return result;
    }

    static async improveQuery(query, db, e) {
        CLI.debug(`Improving query: ${query}`);
        const tableWithFromClause = query.split("FROM");
        if (!tableWithFromClause[1]) {
            return query;
        }
        const table = tableWithFromClause[1].split(" ")[1] ?? null;
        if (!table) {
            return query;
        }
        const columnInfoQuery = `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = '${table.split(".")[0]}' AND table_name = '${table.split(".")[1]}'`;
        const columnInfo = await db.query(columnInfoQuery);
        const indexInfoQuery = `SELECT index_name, column_name FROM information_schema.statistics WHERE table_schema = '${table.split(".")[0]}' AND table_name = '${table.split(".")[1]}'`;
        const indexInfo = await db.query(indexInfoQuery);
        const columnInfoMap = {};
        columnInfo.forEach(row => {
            columnInfoMap[row.column_name] = row.data_type;
        });

        const completionProvider = ResponseAction.getCompletionProvider();
        const response = await completionProvider.api.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Improve the following query to make it more performant. Especially pay attention to indexes. When working with indexes, make sure they're used correctly. Only return the query string within markdown blocks, leaving out comments. Don't explain your thoughts. The query should return the same data. If there is nothing to improve, just return the original query. Whatever you do, only return query text."
                },
                {role: "system", content: "Column info: " + JSON.stringify(columnInfoMap)},
                {role: "system", content: "Index info: " + JSON.stringify(indexInfo)},
                ...e ? [{role: "system", content: "You need to fix the query, because the last run resulted in the following error: " + e.message}] : [],
                {role: "user", content: query}
            ],
            model: completionProvider.models.good,
        });
        const raw = response.choices[0].message.content;
        return raw.replace("```sql\n", "").replace("```", "");
    }

    static async getLikelyQuery(text, tablesWithDBs) {
        const prompt = `The following is a data query for a database. Give your best to construct a MariaDB query that returns the requested data based on the existing tables. Only return the query, no explanations.`;

        const completionProvider = ResponseAction.getCompletionProvider();
        const response = await completionProvider.api.chat.completions.create({
            messages: [
                {role: "system", content: prompt},
                {role: "system", content: "Available tables: " + tablesWithDBs.join(", ")},
                {role: "system", content: "If no table seems to match, try to find a table that looks like it contains general information. If previous queries didn't seem to work, try changing search criteria."},
                {role: "user", content: text}
            ],
            model: completionProvider.models.good,
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