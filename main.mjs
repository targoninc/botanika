import express from 'express';
import {VoiceRecognitionEndpoint} from "./lib/endpoints/VoiceRecognitionEndpoint.mjs";
import {fileURLToPath} from "url";
import path from "path";
import {SendMessageEndpoint} from "./lib/endpoints/SendMessageEndpoint.mjs";
import {GetHistoryEndpoint} from "./lib/endpoints/GetHistoryEndpoint.mjs";
import dotenv from "dotenv";
import multer from "multer";
import passport from "passport";
import session from "express-session";
import bcrypt from "bcryptjs";
import passportLocal from "passport-local";
import {DB} from "./lib/db/DB.mjs";
import {IP} from "./lib/context/IP.mjs";
import {Context} from "./lib/context/Context.mjs";

const upload = multer({ storage: multer.memoryStorage() });

dotenv.config();
const contextMap = {};

/**
 *
 * @param app {Express}
 * @param endpoint {method, path, handler}
 */
function addEndpoint(app, endpoint) {
    const { path, handler } = endpoint;
    app.post('/api' + path, checkAuthenticated, (req, res) => {
        handler(req, res, contextMap[req.sessionID]);
    });
}

export function addEndpoints(app, endpoints) {
    endpoints.forEach(endpoint => addEndpoint(app, endpoint));
}

const endpoints = [
    SendMessageEndpoint,
    GetHistoryEndpoint
];

const app = express();
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session({}));
app.post('/api' + VoiceRecognitionEndpoint.path, checkAuthenticated, upload.single('file'), (req, res) => {
    VoiceRecognitionEndpoint.handler(req, res, contextMap[req.sessionID]);
});
app.use(express.json());
addEndpoints(app, endpoints);

const db_url = process.env.MYSQL_URL.toString();
console.log(`Connecting to database at url ${db_url}...`);
const db = new DB(process.env.MYSQL_URL);
await db.connect();

const LocalStrategy = passportLocal.Strategy;
passport.use(new LocalStrategy(
    async (username, password, done) => {
        const user = await db.getUserByUsername(username);
        if (!user) {
            return done(null, false, {message: "Incorrect username."});
        }
        if (!bcrypt.compareSync(password, user.password_hash)) {
            return done(null, false, {message: "Incorrect password."});
        }
        return done(null, user);
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await db.getUserById(id);
    delete user.password_hash;
    done(null, user);
});

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.send({error: "Not authenticated"});
}

app.post("/api/authorize", async (req, res, next) => {
    const cleanUsername = req.body.username.toLowerCase();
    if (cleanUsername.length < 3) {
        return res.send({error: "Username must be at least 3 characters long"});
    }
    const existing = await db.getUserByUsername(cleanUsername);
    if (!existing) {
        if (process.env.REGISTER_USERS_ON_MISSING === "true") {
            const ip = IP.get(req);
            const hashedPassword = bcrypt.hashSync(req.body.password, 10);
            await db.insertUser(cleanUsername, hashedPassword, ip);
        } else {
            res.send({error: "Invalid username or password"});
            return;
        }
    }
    if (existing && !existing.ip) {
        const ip = IP.get(req);
        await db.updateUserIp(existing.id, ip);
    }

    passport.authenticate("local", (err, user) => {
        if (err) {
            console.log(err);
            return next(err);
        }
        if (!user) {
            return res.send({error: "Invalid username or password"});
        }
        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
            const outUser = {
                id: user.id,
                username: user.username,
            };
            if (!existing) {
                outUser.justRegistered = true;
            }
            contextMap[req.sessionID] = Context.generate(user);
            return res.send({
                user: outUser
            });
        });
    })(req, res, next);
});

app.post("/api/logout", (req, res) => {
    req.logout(() => {
        const isHttps = req.headers['x-forwarded-proto'] === 'https';

        res.clearCookie('connect.sid', {
            path: '/',
            httpOnly: true,
            secure: isHttps,
            sameSite: 'none'
        });

        delete contextMap[req.sessionID];

        res.send({message: "User has been successfully logged out."});
    });
});

app.get("/api/isAuthorized", (req, res) => {
    if (req.isAuthenticated()) {
        res.send({user: req.user, context: contextMap[req.sessionID]});
        return;
    }
    res.send({});
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/", express.static(path.join(__dirname, "dist")));
app.use(express.static(path.join(__dirname, "ui")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(3000, () => console.log('Listening on port 3000'));
