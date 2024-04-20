export class Api {
    static async post(url, data = {}, sendCredentials = true) {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            credentials: sendCredentials ? 'include' : 'omit'
        });
        return await this.basicResponseHandling(res);
    }

    static async get(url, sendCredentials = true) {
        const res = await fetch(url, {
            method: 'GET',
            credentials: sendCredentials ? 'include' : 'omit'
        });
        return await this.basicResponseHandling(res);
    }

    static async basicResponseHandling(res) {
        const text = await res.text();
        try {
            return {
                status: res.status,
                data: JSON.parse(text)
            };
        } catch (e) {
            return {
                status: res.status,
                data: text
            };
        }
    }

    static async VoiceRecognition(data) {
        const res = await this.post('/api/voice-recognition', data);
        return res.data;
    }

    static async SendMessage(text) {
        const res = await this.post('/api/send-message', {
            text
        });
        return res.data;
    }

    static async authorize(username, password) {
        const res = await this.post(`/api/authorize`, {
            username,
            password
        });
        if (res.status !== 200) {
            throw new Error(`Failed to authorize: ${res.status}`);
        }
        return res.data;
    }

    static async isAuthorized() {
        const res = await this.get(`/api/isAuthorized`);
        if (res.status !== 200) {
            throw new Error(`Failed to check authorization: ${res.status}`);
        }
        return res.data;
    }

    static async logout() {
        const res = await this.post(`/api/logout`);
        if (res.status !== 200) {
            throw new Error(`Failed to logout: ${res.status}`);
        }
        return res.data;
    }

    static async resetContext() {
        const res = await this.post(`/api/reset-context`);
        if (res.status !== 200) {
            throw new Error(`Failed to reset context: ${res.status}`);
        }
        return res.data;
    }

    static async resetHistory() {
        const res = await this.post(`/api/reset-history`);
        if (res.status !== 200) {
            throw new Error(`Failed to reset history: ${res.status}`);
        }
        return res.data;
    }

    static async toggleAssistantMute() {
        const res = await this.post(`/api/toggle-assistant-mute`);
        if (res.status !== 200) {
            throw new Error(`Failed to toggle assistant mute: ${res.status}`);
        }
        return res.data;
    }
}