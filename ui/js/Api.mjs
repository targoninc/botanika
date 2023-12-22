import axios from 'axios';

export class Api {
    static POSTraw(url, body, headers = {}) {
        return fetch(url, {
            method: 'POST',
            headers: {
                ...headers
            },
            body: body
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
        return await Api.ParseResponse(await Api.POSTraw('/api/voice-recognition', data));
    }

    static async SendMessage(text) {
        const res = await axios.post('/api/send-message', {text});
        return res.data;
    }

    static async authorize(username, password) {
        const res = await axios.post(`/api/authorize`, {
            username,
            password
        });
        if (res.status !== 200) {
            throw new Error(`Failed to authorize: ${res.status}`);
        }
        return await res.data;
    }

    static async isAuthorized() {
        const res = await axios.get(`/api/isAuthorized`, {
            withCredentials: true
        });
        if (res.status !== 200) {
            throw new Error(`Failed to check authorization: ${res.status}`);
        }
        return await res.data;
    }

    static async logout() {
        const res = await axios.post(`/api/logout`, {}, {
            withCredentials: true
        });
        if (res.status !== 200) {
            throw new Error(`Failed to logout: ${res.status}`);
        }
        return await res.data;
    }
}