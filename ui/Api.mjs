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

    static GET(url, headers = {}) {
        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        });
    }

    static ParseResponse(res) {
        if (res.status !== 200) {
            throw new Error(`Response status code: ${res.status}`);
        }
        const text = res.text();
        try {
            return JSON.parse(text);
        } catch (e) {
            return text;
        }
    }

    static VoiceRecognition(body) {
        return Api.ParseResponse(Api.POST('/voice-recognition', body));
    }

    static AddContext(body) {
        return Api.ParseResponse(Api.POST('/add-context', body));
    }
}