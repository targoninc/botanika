export class Api {
    static POST(url, body = {}, headers = {}) {
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body: JSON.stringify(body)
        });
    }

    static POSTraw(url, body, headers = {}) {
        return fetch(url, {
            method: 'POST',
            headers: {
                ...headers
            },
            body: body
        });
    }

    static GET(url, headers = {}) {
        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        });
    }

    /**
     *
     * @param res {Response}
     * @returns {*}
     * @constructor
     */
    static async ParseResponse(res) {
        if (res.status !== 200) {
            throw new Error(`Response status code: ${res.status}`);
        }
        const text = await res.text();
        try {
            return JSON.parse(text);
        } catch (e) {
            return text;
        }
    }

    static async VoiceRecognition(data) {
        return await Api.ParseResponse(await Api.POSTraw('/voice-recognition', data));
    }

    static async SendMessage(text) {
        return await Api.ParseResponse(await Api.POST('/send-message', {text}));
    }
}