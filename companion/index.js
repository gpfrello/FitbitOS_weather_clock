// Import the messaging module
import * as messaging from "messaging";
import { geolocation } from "geolocation";

var API_KEY = "YOUR APIKEY here";

// Fetch the weather from OpenWeather
function queryOpenWeather() {
  geolocation.getCurrentPosition(locationSuccess, locationError);
  function locationSuccess(position) {
    var lat = position.coords.latitude;
    var long = position.coords.longitude;
    console.log("latitude: " + lat);
    console.log("langitude: " + long);
    var linkApi = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon="  + long + "&units=metric" + "&APPID=" + API_KEY;
  fetch(linkApi)
  .then(function (response) {
      response.json()
      .then(function(data) {
        // We just want some data
        var weather = {
          temperature: data.main.temp, meteo: data.weather[0].main, location: data["name"]
        }
        // Send the weather data to the device
        returnWeatherData(weather);
      });
  })
  .catch(function (err) {
    console.log("Error fetching weather: " + err);
  });
 };
 function locationError(error) {
  console.log("Error: " + error.code,
              "Message: " + error.message);
}
}

// Send the weather data to the device
function returnWeatherData(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    // Send a command to the device
    messaging.peerSocket.send(data);
  } else {
    console.log("Error: Connection is not open");
  }
}

// Listen for messages from the device
messaging.peerSocket.onmessage = function(evt) {
  if (evt.data && evt.data.command == "weather") {
    // The device requested weather data
    queryOpenWeather();
  }
}

// Listen for the onerror event
messaging.peerSocket.onerror = function(err) {
  // Handle any errors
  console.log("Connection error: " + err.code + " - " + err.message);
}
