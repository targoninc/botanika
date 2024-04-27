import axios from "axios";

export class WeatherApi {
    static get api_key() {
        return process.env.OPENWEATHER_API_KEY;
    }
    static api_url = "https://api.openweathermap.org";

    static async coordinates(city) {
        const res = await axios.get(`${this.api_url}/geo/1.0/direct?q=${city}&appid=${WeatherApi.api_key}`);
        return res.data;
    }

    static getDataFromWeatherInfo(city, weatherInfo) {
        const weather = weatherInfo.weather[0];
        return {
            city,
            temp: weatherInfo.main.temp,
            description: weather.description,
            icon: weather.icon,
            wind: weatherInfo.wind.speed,
            clouds: weatherInfo.clouds.all,
            humidity: weatherInfo.main.humidity,
        }
    }

    static async current(cityName) {
        const coordinates = await this.coordinates(cityName);
        const city = coordinates[0];
        const res = await axios.get(`${this.api_url}/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${WeatherApi.api_key}&units=metric`);
        return this.getDataFromWeatherInfo(city, res.data);
    }

    static async forecast(cityName, dayOffset) {
        const date = new Date();
        date.setDate(date.getDate() + dayOffset);
        const timestamp = Math.floor(date.getTime() / 1000);
        const coordinates = await this.coordinates(cityName);
        const city = coordinates[0];
        const res = await axios.get(`${this.api_url}/data/2.5/forecast?lat=${city.lat}&lon=${city.lon}&appid=${WeatherApi.api_key}&units=metric`);
        const closestWeather = res.data.list.reduce((prev, curr) => {
            return (Math.abs(curr.dt - timestamp) < Math.abs(prev.dt - timestamp) ? curr : prev);
        });
        return this.getDataFromWeatherInfo(city, closestWeather);
    }
}