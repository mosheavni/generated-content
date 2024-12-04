// Weather emoji mapping
const weatherEmojis = {
  sunny: "☀️",
  clear: "☀️",
  cloudy: "☁️",
  overcast: "☁️",
  rain: "🌧️",
  drizzle: "🌦️",
  thunder: "⛈️",
  snow: "🌨️",
  mist: "🌫️",
  fog: "🌫️",
  partly: "⛅",
};

function getWeatherEmoji(condition) {
  const lowercaseCondition = condition.toLowerCase();
  return (
    Object.entries(weatherEmojis).find(([key]) =>
      lowercaseCondition.includes(key),
    )?.[1] || "🌡️"
  );
}
async function getWeatherData(latitude, longitude) {
  try {
    // Fetch weather data
    const weatherResponse = await fetch(`/weather/${latitude}/${longitude}`);
    const weatherData = await weatherResponse.json();

    // Update weather information
    document.getElementById("location").textContent = weatherData.location.name;
    document.getElementById("temperature").textContent =
      `${Math.round(weatherData.current.temp_c)}°C`;
    document.getElementById("description").textContent =
      `${getWeatherEmoji(weatherData.current.condition.text)} ${weatherData.current.condition.text}`;
    document.getElementById("humidity").textContent =
      `Humidity: ${weatherData.current.humidity}%`;
    document.getElementById("wind").textContent =
      `Wind: ${weatherData.current.wind_kph} km/h`;

    // Fetch city info
    const cityInfoResponse = await fetch(`/city-info/${latitude}/${longitude}`);
    const cityInfo = await cityInfoResponse.json();

    // Update city information
    document.getElementById("local-time").textContent =
      `Local Time: ${cityInfo.localtime}`;
    document.getElementById("region").textContent =
      `Region: ${cityInfo.region}`;
    document.getElementById("country").textContent =
      `Country: ${cityInfo.country}`;
    document.getElementById("city-name").textContent = cityInfo.name;

    // Fetch city images
    const imagesResponse = await fetch(`/city-images/${cityInfo.name}`);
    const images = await imagesResponse.json();

    // Create image grid
    const imageGrid = document.getElementById("image-grid");
    imageGrid.innerHTML = ""; // Clear existing images

    images.forEach((image) => {
      const imageCard = document.createElement("div");
      imageCard.className = "image-card";

      imageCard.innerHTML = `
                <a href="${image.unsplashLink}" target="_blank" class="image-link">
                    <img src="${image.url}" alt="View of ${cityInfo.name}">
                    <div class="photo-credit">
                        Photo by <a href="${image.credit.link}" target="_blank">${image.credit.name}</a>
                    </div>
                </a>`;

      imageGrid.appendChild(imageCard);
    });
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("location").textContent = "Error loading data";
  }
}

if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      getWeatherData(latitude, longitude);
    },
    function (error) {
      console.error("Error getting location:", error);
      document.getElementById("location").textContent =
        "Unable to get location";
    },
  );
} else {
  document.getElementById("location").textContent =
    "Geolocation is not supported";
}
