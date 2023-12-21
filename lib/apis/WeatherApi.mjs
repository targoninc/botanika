import axios from "axios";

export class WeatherApi {
    static api_key = process.env.WEATHER_API_KEY;
    static api_url = "https://api.openweathermap.org/data/2.5";

    static async current(city) {
        return await axios.get(`${this.api_url}/weather?q=${city}&appid=${WeatherApi.api_key}&units=metric`);
    }

    static dayOffset(city, dayOffset) {
        const date = new Date();
        date.setDate(date.getDate() + dayOffset);
        const timestamp = Math.floor(date.getTime() / 1000);
        return axios.get(`${this.api_url}/forecast?q=${city}&appid=${WeatherApi.api_key}&units=metric&dt=${timestamp}`);
    }
}