import mysql from 'mysql2/promise';
import {CLI} from "../tooling/CLI.mjs";

export class DB {
    constructor(host, user = null, password = null, database = "botanika", port = null) {
        this.host = host;
        this.port = port || 3306;
        this.user = user || process.env.MYSQL_USER;
        this.password = password || process.env.MYSQL_PASSWORD;
        this.database = database;
    }

    async connect() {
        this.connection = await mysql.createConnection({
            host: this.host,
            port: this.port,
            user: this.user,
            password: this.password,
            database: this.database
        });
    }

    async close() {
        await this.connection.end();
    }

    async query(sql, params) {
        try {
            const [rows] = await this.connection.execute(sql, params);
            return rows;
        } catch (e) {
            if (e.toString().includes("connection is in closed state")) {
                CLI.warning("Reconnecting to database...");
                await this.connect();
                const [rows] = await this.connection.execute(sql, params);
                return rows;
            } else {
                throw e;
            }
        }
    }

    async getUserByUsername(username) {
        const rows = await this.query("SELECT * FROM accounts.users WHERE username = ?", [username]);
        return rows ? rows[0] : null;
    }

    async getUserById(id) {
        const rows = await this.query("SELECT * FROM accounts.users WHERE id = ?", [id]);
        return rows ? rows[0] : null;
    }

    async insertUser(username, hashedPassword, ip) {
        await this.query("INSERT INTO accounts.users (username, password_hash, ip) VALUES (?, ?, ?)", [username, hashedPassword, ip]);
    }

    async updateUserIp(id, ip) {
        await this.query("UPDATE accounts.users SET ip = ? WHERE id = ?", [ip, id]);
    }

    async getContext(id) {
        const rows = await this.query("SELECT * FROM context WHERE user_id = ?", [id]);
        return rows ? rows[0] : null;
    }

    async updateContext(id, s) {
        await this.query("INSERT INTO context (user_id, object) VALUES (?, ?) ON DUPLICATE KEY UPDATE object = ?", [id, s, s]);
    }

    async getAvailableSubscriptionByProductId(id) {
        return await this.query("SELECT * FROM finance.available_subscriptions WHERE product_id = ?", [id]);
    }

    async getUserSubscriptions(id, subscriptionIds) {
        return await this.query("SELECT * FROM finance.subscriptions WHERE user_id = ? AND subscription_id IN (?)", [id, subscriptionIds.join(",")]);
    }

    async getPendingMessagesForUser(userId) {
        return await this.query("SELECT * FROM pending_messages WHERE user_id = ?", [userId]);
    }

    async deletePendingMessage(id) {
        await this.query("DELETE FROM pending_messages WHERE id = ?", [id]);
    }

    async deletePendingMessages(idsArray) {
        const ids = idsArray.join(",");
        await this.query(`DELETE FROM pending_messages WHERE id IN (?)`, [ids]);
    }

    async insertPendingMessage(userId, type, text, timeToResponse) {
        await this.query("INSERT INTO pending_messages (user_id, type, text, timeToResponse) VALUES (?, ?, ?, ?)", [userId, type, text, timeToResponse]);
    }
}