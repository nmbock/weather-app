// Create the map and set the view to France
var map = L.map('map').setView([46.4, 1.5], 4);

// Initialize an empty array to store markers
var markers = [];

// Initialize a counter to keep track of the number of markers on the map
var count = 0;

// Add the OpenStreetMap tile layer to the map
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Function to fetch a user's data from the Random User API
function getUsers() {
  fetch("https://randomuser.me/api/?nat=FR")
    .then((response) => response.json())
    .then((data) => {
      // Extract the first name, last name, age, and city from the data
      const firstName = data.results[0].name.first;
      const lastName = data.results[0].name.last;
      const age = data.results[0].dob.age;
      const city = data.results[0].location.city;

      // Display the user's information in the HTML
      const nameElement = document.getElementById("user-name");
      nameElement.textContent = `Name: ${firstName} ${lastName}`;
      const ageElement = document.getElementById("user-age");
      ageElement.textContent = `Age: ${age}`;
      const cityElement = document.getElementById("user-city");
      cityElement.textContent = `City: ${city}`;

      // Get data about the city (latitude, longitude) using the Open Meteo Geocoding API
      getCityData(city);

      // Add 1 to the counter and remove the oldest marker if there are more than 10 markers on the map
      count++;
      if (count > 10) {
        const marker = markers.shift();
        map.removeLayer(marker);
        count--;
      }
    })
    .catch((error) => {
      console.error("Error fetching data: ", error);
    });
}

// Function to add a marker to the map and display information about it
function printMarker(latitude, longitude, temperature) {
  var marker = L.marker([latitude, longitude])
    .addTo(map)
    .bindPopup(`Temperature: ${temperature} °C <br>Lat: ${latitude}<br>Lon: ${longitude}`)
    .openPopup();
  markers.push(marker);
}

// Function to get the latitude and longitude of a city using the Open Meteo Geocoding API
function getCityData(cityName) {
  fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cityName}`)
    .then((response) => response.json())
    .then((data) => {
      const latitude = data.results[0].latitude;
      const longitude = data.results[0].longitude;
      // Get the weather data for the city using the latitude and longitude
      getWeatherData(latitude, longitude);
    })
    .catch((error) => {
      console.error("Error fetching data: ", error);
    });
}

// Function to get the weather data for a city using the Open Meteo Weather API
function getWeatherData(latitude, longitude) {
  // Make a GET request to the Open-Meteo API to retrieve weather data for a specific location
  fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=weathercode,temperature_2m`)
    .then((response) => response.json()) // Convert the response to JSON format
    .then((data) => {
      // Extract the temperature and weather code from the data
      const temperature = data.current_weather.temperature;
      const weatherCode = data.current_weather.weathercode;

      // Display the temperature and weather code in the HTML
      const temperatureElement = document.getElementById("temperature");
      const weatherCodeElement = document.getElementById("weather-code");
      temperatureElement.textContent = `Temperature: ${temperature} °C`;
      weatherCodeElement.innerHTML = `<a href="https://www.jodc.go.jp/data_format/weather-code.html">Weather code</a>: ${weatherCode}`;

      // Print a marker on the map with the temperature and location information
      printMarker(latitude, longitude, temperature);
    })
    .catch((error) => {
      console.error("Error fetching data: ", error);
    });
}

setInterval(getUsers, 1000);
