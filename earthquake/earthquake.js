// Global variables for UI elements and the map
const earthquakeTab = document.querySelector('.tablinks[href="#earthquake"]');
const earthquakeSection = document.querySelector('#earthquake-page');
const weatherSection = document.querySelector('#weather-page');
const airQualitySection = document.querySelector('#air-quality-page');
const weatherTab = document.querySelector('.tablinks[href="#weather"]');
const airQualityTab = document.querySelector('.tablinks[href="#air-quality"]');
const earthquakeSearchInput = document.querySelector('#earthquake-input');
const earthquakeSearchBtn = document.querySelector('#search-button');
const earthquakeDetails = document.querySelector('#earthquake-details');
const earthquakePrediction = document.querySelector('#earthquake-prediction');
var map; // Variable for the map

// Function to initialize the map
function initializeMap() {
    console.log("Initializing map...");
    map = L.map('map').setView([51.505, -0.09], 13); // Set a default location
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);
    console.log("Map should be visible now if no errors occurred.");
}

// Function to set up event listeners
function setupEventListeners() {
    earthquakeTab.addEventListener('click', () => {
        earthquakeSection.style.display = 'block';
        weatherSection.style.display = 'none';
        airQualitySection.style.display = 'none';

        earthquakeTab.classList.add('active');
        weatherTab.classList.remove('active');
        airQualityTab.classList.remove('active');
    });

    earthquakeSearchBtn.addEventListener('click', () => {
        const location = earthquakeSearchInput.value.trim();
        if (location) {
            getEarthquakeDetails(location);
        } else {
            earthquakeDetails.innerHTML = '<p>Please enter a location.</p>';
        }
    });
}

// Function to fetch and display earthquake details
async function getEarthquakeDetails(location) {
    try {
        const locationResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`);
        const locationData = await locationResponse.json();
        
        if (!locationData || locationData.length === 0) {
            earthquakeDetails.innerHTML = '<p>Location not found.</p>';
            return;
        }

        const { lat, lon } = locationData[0];
        updateMap(lat, lon); // Update the map with new coordinates

        const earthquakeResponse = await fetch(
            `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&limit=1&orderby=time&starttime=1900-01-01&endtime=${new Date().toISOString()}&latitude=${lat}&longitude=${lon}&maxradiuskm=200`);
        const earthquakeData = await earthquakeResponse.json();

        if (!earthquakeData || earthquakeData.features.length === 0) {
            earthquakeDetails.innerHTML = '<p>No recent earthquake found for the given location.</p>';
            return;
        }

        displayEarthquakeDetails(earthquakeData.features[0]);
    } catch (error) {
        earthquakeDetails.innerHTML = '<p>Error retrieving earthquake data.</p>';
        console.error('Error:', error);
    }
}

// Function to update map location
function updateMap(latitude, longitude) {
    map.setView([latitude, longitude], 13); // Adjust zoom level as needed
    L.marker([latitude, longitude]).addTo(map)
        .bindPopup('Current Location').openPopup();
}

// Function to display earthquake details
function displayEarthquakeDetails(earthquake) {
    const magnitude = earthquake.properties.mag;
    const magnitudeType = getMagnitudeType(magnitude);
    earthquakeDetails.innerHTML = `
      <h2>Most Recent Earthquake Details</h2>
      <p>Location: ${earthquake.properties.place}</p>
      <p>Date and Time: ${new Date(earthquake.properties.time).toLocaleString()}</p>
      <p>Magnitude: ${magnitude} (${magnitudeType})</p>
      <p>Depth: ${earthquake.geometry.coordinates[2]} km</p>
    `;
}

// Function to determine the magnitude type
function getMagnitudeType(magnitude) {
    if (magnitude < 2.5) return 'Micro';
    if (magnitude < 4.5) return 'Minor';
    if (magnitude < 6.0) return 'Light';
    if (magnitude < 6.9) return 'Moderate';
    if (magnitude < 7.9) return 'Strong';
    return 'Major';
}

// Add Event Listeners when DOM content is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeMap(); // Initialize the map
    setupEventListeners(); // Setup UI event listeners
});
