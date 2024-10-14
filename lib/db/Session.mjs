import {ConnectSessionKnexStore} from "connect-session-knex";
import knexConstructor from "knex";
import session from "express-session";
import passport from "passport";
import {env} from "../tooling/Environment.mjs";
import {PassportDeserializeUser, PassportSerializeUser, PassportStrategy} from "../tooling/PassportStrategy.mjs";

export async function ensureSessionStore(db) {
    try {
        await db.query("CREATE SCHEMA sessions");
    } catch (e) {
        // Ignore error if schema already exists
    }
}

export function getSessionStore() {
    if (!env('MYSQL_URL') || !env('MYSQL_USER') || !env('MYSQL_PASSWORD') || !env('MYSQL_SESSION_DB') || !env('MYSQL_PORT')) {
        throw new Error("Missing MySQL environment variables. Please set MYSQL_URL, MYSQL_USER, MYSQL_PASSWORD, MYSQL_SESSION_DB, MYSQL_PORT");
    }

    return new ConnectSessionKnexStore({
        knex: knexConstructor({
            client: 'mysql2',
            connection: {
                host: process.env.MYSQL_URL.toString(),
                user: process.env.MYSQL_USER,
                password: process.env.MYSQL_PASSWORD,
                database: process.env.MYSQL_SESSION_DB,
                port: 3306,
                charset: "utf8mb4",
                supportBigNumbers: true,
            },
        }),
        cleanupInterval: 0, // disable session cleanup
    });
}

export async function setupPassport(app, db) {
    app.use(session({
        secret: env('SESSION_SECRET', ""),
        store: getSessionStore(),
        resave: false,
        saveUninitialized: false,
        cookie: {
            domain: process.env.COOKIE_DOMAIN
        },
    }));
    passport.use(PassportStrategy(db));
    passport.serializeUser(PassportSerializeUser());
    passport.deserializeUser(PassportDeserializeUser(db));
}