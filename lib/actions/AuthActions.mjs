import {IP} from "../tooling/IP.mjs";
import bcrypt from "bcryptjs";
import passport from "passport";
import {Context} from "../features/context/Context.mjs";
import {CLI} from "../tooling/CLI.mjs";

export class AuthActions {
    static authorizeUser(db, contextMap) {
        return async (req, res, next) => {
            const cleanUsername = req.body.username.toLowerCase();
            if (cleanUsername.length < 3) {
                return res.send({error: "Username must be at least 3 characters long"});
            }
            const existing = await db.getUserByUsername(cleanUsername);
            if (!existing) {
                if (process.env.REGISTER_USERS_ON_MISSING === "true") {
                    await AuthActions.registerUser(req, db, cleanUsername);
                } else {
                    res.send({error: "Invalid username or password"});
                    return;
                }
            }
            if (existing && !existing.ip) {
                const ip = IP.get(req);
                await db.updateUserIp(existing.id, ip);
            }

            passport.authenticate("local", async (err, user) => {
                if (err) {
                    CLI.error(err);
                    return next(err);
                }
                if (!user) {
                    return res.send({error: "Invalid username or password"});
                }
                req.logIn(user, AuthActions.requestLogin(next, db, contextMap, req, res, existing, user));
            })(req, res, next);
        }
    }

    static requestLogin(next, db, contextMap, req, res, existing, user) {
        return async (err) => {
            if (err) {
                return next(err);
            }

            if (process.env.VERIFY_SUBSCRIPTIONS === "true") {
                const userSubscriptions = await AuthActions.getUserSubscriptions(db, user);
                if (userSubscriptions.length === 0) {
                    req.logout(function (err) {
                        if (err) {
                            CLI.error(err);
                            return next(err);
                        }
                        return res.send({error: "You are not subscribed to botanika."});
                    });
                    return;
                }
            }

            const outUser = {
                id: user.id,
                username: user.username,
            };
            if (!existing) {
                outUser.justRegistered = true;
            }

            const dbContext = await db.getContext(user.id);
            if (dbContext) {
                await AuthActions.verifySavedDbContext(contextMap, req, dbContext, db, user);
            } else {
                contextMap[req.sessionID] = Context.generate(user, req.sessionID);
            }

            return res.send({
                user: outUser
            });
        }
    }

    static async verifySavedDbContext(contextMap, req, dbContext, db, user) {
        contextMap[req.sessionID] = JSON.parse(dbContext.object);
        contextMap[req.sessionID] = Context.updateGeneral(contextMap[req.sessionID]);
        contextMap[req.sessionID] = await Context.checkApiTokens(contextMap[req.sessionID]);
        await db.updateContext(user.id, JSON.stringify(contextMap[req.sessionID]));
    }

    static async getUserSubscriptions(db, user) {
        const availableSubscriptions = await db.getAvailableSubscriptionByProductId(process.env.PRODUCT_ID);
        return await db.getUserSubscriptions(user.id, availableSubscriptions.map(s => s.id));
    }

    static async registerUser(req, db, cleanUsername) {
        const ip = IP.get(req);
        const hashedPassword = bcrypt.hashSync(req.body.password, 10);
        await db.insertUser(cleanUsername, hashedPassword, ip);
    }

    static logout(contextMap) {
        return (req, res) => {
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
        }
    }

    static isAuthorized(contextMap) {
        return (req, res) => {
            if (req.isAuthenticated()) {
                res.send({user: req.user, context: contextMap[req.sessionID]});
                return;
            }
            res.send({});
        };
    }

    static checkAuthenticated = (req, res, next) => {
        if (req.isAuthenticated()) {
            req.requestId = Math.random().toString(36).substring(7);
            return next();
        }
        res.send({error: "Not authenticated"});
    }
}