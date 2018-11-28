import clock from "clock";
import document from "document";
import { preferences } from "user-settings";
import { units } from "user-settings";
import * as util from "../common/utils";

// Import the messaging module
import * as messaging from "messaging";
import document from "document";

// Import clock preference (12h or 24h format)
const clockPref = preferences.clockDisplay;

// Import measure units 
const measureUnitsPref = units.distance;

// Set clock granularity (minutes or seconds)
clock.granularity = "minutes";

// Get a handle on the <text> element
const timeHandle = document.getElementById("timeLabel");
const temperatureHandle = document.getElementById("temperatureLabel");
const meteoHandle = document.getElementById("meteoLabel");
const locationHandle = document.getElementById("locationLabel");

// Update the <text> element every tick with the current time
clock.ontick = (evt) => {
  let today = evt.date;
  let hours = today.getHours();
  let hoursSuffix;
  if (hours > 12) {hoursSuffix = " pm"} else {hoursSuffix = " am"};
  if (clockPref === "12h") {
    // 12h format
    hours = hours % 12 || 12;
    console.log(hours);
  } else {
    // 24h format
    hours = util.zeroPad(hours);
    hoursSuffix = "";
  }
  let mins = util.zeroPad(today.getMinutes());
  timeHandle.text = `${hours}:${mins} ${hoursSuffix}`;
}

// Weather module

// Request weather data from the companion
function fetchWeather() {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    // Send a command to the companion
    messaging.peerSocket.send({
      command: 'weather'
    });
  }
}

// Display the weather data received from the companion
function processWeatherData(data) {
  if (measureUnitsPref === "us ") {
    temperatureHandle.text = ((data.temperature * 9 / 5) +32) + " °F";
  }
  else {
    temperatureHandle.text = data.temperature + " °C";
  }
  temperatureHandle.text = data.temperature + " °C";
  meteoHandle.text = data.meteo;
  locationHandle.text = data.location;
}

// Listen for the onopen event
messaging.peerSocket.onopen = function() {
  // Fetch weather when the connection opens
  fetchWeather();
}

// Listen for messages from the companion
messaging.peerSocket.onmessage = function(evt) {
  if (evt.data) {
    processWeatherData(evt.data);
  }
}

// Listen for the onerror event
messaging.peerSocket.onerror = function(err) {
  // Handle any errors
  console.log("Connection error: " + err.code + " - " + err.message);
}

setInterval(fetchWeather, 60 * 1000 * 60); //update weather every hour (60 minutes per hour * 1000 millisecs * 60 seconds per hour)
