import {CLI} from "../tooling/CLI.mjs";

export class BotanikaFeature {
    static name = 'botanika';

    static isEnabled() {
        return true;
    }

    static enable(app, context, db) {
        CLI.info('Enabling Botanika features...');
    }

    static getEndpoints() {
        return [];
    }
}