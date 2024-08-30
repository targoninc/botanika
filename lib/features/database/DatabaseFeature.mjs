import {CLI} from "../../tooling/CLI.mjs";
import {DB} from "../../db/DB.mjs";
import {BotanikaFeature} from "../BotanikaFeature.mjs";
import {DatabaseIntent} from "./DatabaseIntent.mjs";

export class DatabaseFeature extends BotanikaFeature {
    /**
     *
     * @returns {Promise<DB>}
     */
    static async enable() {
        const db_url = process.env.MYSQL_URL.toString();
        CLI.debug(`Connecting to database at url ${db_url}...`);
        const db = new DB(process.env.MYSQL_URL);
        await db.connect();
        CLI.success('Connected to database!');

        return db;
    }

    static isEnabled() {
        return process.env.MYSQL_URL && process.env.MYSQL_USER && process.env.MYSQL_PASSWORD;
    }

    static getIntents() {
        return [
            DatabaseIntent
        ];
    }
}