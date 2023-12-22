import axios from 'axios';

export class Api {
    static async VoiceRecognition(data) {
        return await axios.post('/api/voice-recognition', data, {
            withCredentials: true
        });
    }

    static async SendMessage(text) {
        const res = await axios.post('/api/send-message', {text}, {
            withCredentials: true
        });
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

    static async resetContext() {
        const res = await axios.post(`/api/reset-context`, {}, {
            withCredentials: true
        });
        if (res.status !== 200) {
            throw new Error(`Failed to reset context: ${res.status}`);
        }
        return await res.data;
    }
}