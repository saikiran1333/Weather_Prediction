import { showError } from "../error/error.js";
import { getHourlyForecastData, getWeatherData } from "../weather/api.js";
import { displayHourlyForecastData, showWeatherData as originalShowWeatherData } from "../weather/weather.js";
import { updateTopFiveCitiesWeather } from "../weather/weather-data-5-city.js";
import { showUVIndex } from "../uv-index/UvIndex.js";
import "../header-footer/import-header-footer.js";

var weatherDatatest='';

function displayLifestyleTips(weatherData) {
  // Check if required data is available
  if (!weatherData.temperature || !weatherData.main || !weatherData.weather || weatherData.weather.length === 0) {
    console.error("Incomplete weather data:", weatherData);
    document.getElementById("lifestyle-tips-content").textContent = "Weather data unavailable.";
    return;
  }

  const temp = weatherData.temperature;
  const desc = weatherData.weather[0].main;
  let tips = "";

  // Temperature-based tips
  if (temp > 35) {
    tips = "It's very hot! Avoid outdoor activities during peak hours, stay hydrated, and use sunscreen.";
  } else if (temp > 25 && temp <= 35) {
    tips = "Perfect weather for the beach or other outdoor activities. Don't forget your sunglasses!";
  } else if (temp >= 15 && temp <= 25) {
    tips = "Ideal weather for outdoor sports and activities. Consider a light jacket for the evening.";
  } else if (temp < 15 && temp >= 5) {
    tips = "Chilly weather! Dress in layers and consider indoor activities.";
  } else if (temp < 5) {
    tips = "Very cold! Stay warm, watch out for ice, and consider enjoying the indoors or bundling up well if heading out.";
  }

  // Weather condition-based tips
  if (desc.toLowerCase().includes("rain")) {
    tips += "\nRainy day! Not suitable for car washing. Great day for indoor games. Remember to carry an umbrella.";
  } else if (desc.toLowerCase().includes("snow")) {
    tips += "\nSnowy conditions can be tricky. Avoid unnecessary travel. Enjoy snow sports if safe to do so.";
  } else if (desc.toLowerCase().includes("clear")) {
    tips += "\nClear skies. Great day for outdoor photography and enjoying nature.";
  }

  document.getElementById("lifestyle-tips-content").textContent = tips;
}

function showWeatherData(weatherData) {
  originalShowWeatherData(weatherData);
  displayLifestyleTips(weatherData);
}

document.getElementById("search-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = document.getElementById("search-input").value;
  console.log('city is '+city);
  try {
    const weatherData = await getWeatherData(city);
    weatherDatatest = weatherData;
    console.log('----------');
    console.log(weatherData);
    console.log(weatherData.temperature);
    console.log('------------...');
    //if (!weatherData) throw new Error("Failed to retrieve weather data.");
    showWeatherData(weatherData);
    alert(weatherData);
    displayLifestyleTips(weatherData);

    showUVIndex(city);
    const hourlyForecastData = await getHourlyForecastData(city);
    if (!hourlyForecastData) throw new Error("Failed to retrieve hourly forecast data.");
    displayHourlyForecastData(hourlyForecastData);
  } catch (error) {
    showError(error.message);
  }
});

navigator.geolocation.getCurrentPosition(
  async (position) => {
    try {
      const weatherData = await getWeatherData(null, position.coords.latitude, position.coords.longitude);
      if (!weatherData) throw new Error("Geolocation weather fetch failed.");
      showWeatherData(weatherData);
    } catch (error) {
      showError(error.message);
    }
  },
  (error) => {
    showError("Geolocation error: " + error.message);
  }
);

window.addEventListener("load", updateTopFiveCitiesWeather);

function logout() {
  alert("Logged out successfully");
  window.location.href = "./login/index.html";
}
