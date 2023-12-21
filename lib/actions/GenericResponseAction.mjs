export class GenericResponseAction {
    static async getResponse(text) {
        if (text.includes("who are you")) {
            return `I am a virtual assistant. I am here to help you with whatever you need.`;
        }
        if (text.includes("what is your name")) {
            return `My name is botanika.`;
        }
        if (text.includes("what is your purpose")) {
            return `I am here to help you with whatever you need.`;
        }

        return await GenericResponseAction.getOpenAiResponse(text);
    }

    static async getOpenAiResponse(text) {
        const systemPrompt = "You are a virtual assistant. If the user says something that you don't understand, you just respond with an empty message. If the user says something that you do understand, you respond with a message that you think is appropriate.";
        const userPrompt = text;
        const maxTokens = 64;
        const temperature = 0.9;
        const topP = 1;
        const presencePenalty = 0;
        const frequencyPenalty = 0;
        const bestOf = 1;
        const n = 1;
        const stream = false;
        const logProbs = null;
        const stop = "\n";
        const echo = false;
        const logitBias = null;
        const response = await axios.post('https://api.openai.com/v1/engines/davinci/completions', {
            prompt: `${systemPrompt}\n${userPrompt}\n${stop}`,
            max_tokens: maxTokens,
            temperature,
            top_p: topP,
            presence_penalty: presencePenalty,
            frequency_penalty: frequencyPenalty,
            best_of: bestOf,
            n,
            stream,
            logprobs: logProbs,
            stop,
            echo,
            logit_bias: logitBias
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_KEY}`
            },
            validateStatus: () => true
        });
        if (response.status !== 200) {
            console.log(response.data);
            throw new Error(`Response status code: ${response.status}`);
        }
        const data = await response.data;
        return data.choices[0].text;
    }
}