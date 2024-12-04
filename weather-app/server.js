import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;

app.use(express.static("public"));

app.get("/weather/:lat/:lon", async (req, res) => {
  try {
    const { lat, lon } = req.params;
    const weatherResponse = await fetch(
      `http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHERAPI_KEY}&q=${lat},${lon}&aqi=no`,
    );
    const weatherData = await weatherResponse.json();
    res.json(weatherData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

app.get("/city-info/:lat/:lon", async (req, res) => {
  try {
    const { lat, lon } = req.params;
    const response = await fetch(
      `http://api.weatherapi.com/v1/search.json?key=${process.env.WEATHERAPI_KEY}&q=${lat},${lon}`,
    );
    const cityData = await response.json();

    if (cityData && cityData.length > 0) {
      const detailResponse = await fetch(
        `http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHERAPI_KEY}&q=${cityData[0].name}`,
      );
      const detailData = await detailResponse.json();
      res.json(detailData.location);
    } else {
      res.status(404).json({ error: "City not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch city data" });
  }
});

app.get("/city-images/:city", async (req, res) => {
  try {
    const { city } = req.params;
    const unsplashResponse = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(city)}&per_page=6&orientation=landscape&client_id=${process.env.UNSPLASH_ACCESS_KEY}`,
    );

    if (!unsplashResponse.ok) {
      throw new Error(
        `Unsplash API responded with status: ${unsplashResponse.status}`,
      );
    }

    const unsplashData = await unsplashResponse.json();

    if (!unsplashData.results || !Array.isArray(unsplashData.results)) {
      throw new Error("Invalid response format from Unsplash API");
    }

    const images = unsplashData.results.map((img) => ({
      url: img.urls.regular,
      unsplashLink: img.links.html,
      credit: {
        name: img.user.name,
        link: img.user.links.html,
      },
    }));
    res.json(images);
  } catch (error) {
    console.error("City images error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch city images", details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
