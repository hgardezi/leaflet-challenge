// Create the 'basemap' tile layer that will be the default background of our map.
let basemap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
});

// OPTIONAL: Create the 'street' tile layer as a second background of the map.
let street = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenTopoMap contributors"
});

// Create the map object with center and zoom options.
let myMap = L.map("map", {
  center: [20, 0],
  zoom: 2,
  layers: [basemap] // Default layer
});

// Create layer groups for earthquakes and tectonic plates.
let earthquakeLayer = new L.LayerGroup();
let tectonicPlatesLayer = new L.LayerGroup();

// Define base maps (user can switch between them)
let baseMaps = {
  "Street Map": basemap,
  "Topographic Map": street
};

// Define overlays (user can toggle these on/off)
let overlayMaps = {
  "Earthquakes": earthquakeLayer,
  "Tectonic Plates": tectonicPlatesLayer
};

// Add a control to the map that allows the user to change visible layers.
L.control.layers(baseMaps, overlayMaps).addTo(myMap);

// Fetch earthquake GeoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  // Function to determine marker size based on magnitude.
  function getRadius(magnitude) {
      return magnitude * 4;
  }

  // Function to determine marker color based on depth.
  function getColor(depth) {
      return depth > 90 ? "#ff0000" :
             depth > 70 ? "#ff6600" :
             depth > 50 ? "#ffcc00" :
             depth > 30 ? "#ccff33" :
             depth > 10 ? "#66ff66" :
                          "#00ff00";
  }

  // Function to define style for each earthquake marker.
  function styleInfo(feature) {
      return {
          radius: getRadius(feature.properties.mag),
          fillColor: getColor(feature.geometry.coordinates[2]),
          color: "#000",
          weight: 0.5,
          opacity: 1,
          fillOpacity: 0.8
      };
  }

  // Add earthquake data as GeoJSON layer.
  L.geoJson(data, {
      pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng);
      },
      style: styleInfo,
      onEachFeature: function (feature, layer) {
          layer.bindPopup(`<h3>${feature.properties.place}</h3><hr>
                           <p>Magnitude: ${feature.properties.mag}</p>
                           <p>Depth: ${feature.geometry.coordinates[2]} km</p>`);
      }
  }).addTo(earthquakeLayer);

  // Add earthquake layer to the map.
  earthquakeLayer.addTo(myMap);

  // Create a legend.
  let legend = L.control({ position: "bottomright" });

  legend.onAdd = function () {
      let div = L.DomUtil.create("div", "info legend");
      let depths = [-10, 10, 30, 50, 70, 90];
      let colors = ["#00ff00", "#66ff66", "#ccff33", "#ffcc00", "#ff6600", "#ff0000"];

      for (let i = 0; i < depths.length; i++) {
          div.innerHTML += `<i style="background: ${colors[i]}"></i> 
                            ${depths[i]}${depths[i + 1] ? "&ndash;" + depths[i + 1] + " km<br>" : "+ km"}`;
      }
      return div;
  };

  legend.addTo(myMap);
});

// OPTIONAL: Load tectonic plate GeoJSON data.
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plate_data) {
  L.geoJson(plate_data, {
      color: "orange",
      weight: 2
  }).addTo(tectonicPlatesLayer);

  // Add tectonic plates layer to the map.
  tectonicPlatesLayer.addTo(myMap);
});
