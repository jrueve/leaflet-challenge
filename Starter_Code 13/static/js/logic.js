//json data link
const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

//backround layer
let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

//define basemaps as the streetmap
let baseMaps = {
    "streets": streetmap
};

// Create the map object with options.
var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 4,
    layers: [streetmap]
});

// define earthquake and tectonic layer group
let earthquake = new L.LayerGroup();
let tectonics = new L.LayerGroup();

let overlays = {
    "Earthquakes": earthquake,
    "Tectonic Plates": tectonics
};

L.control.layers(baseMaps, overlays).addTo(myMap);

function chooseColor(depth) {
    var color = "";
    if (depth >= -10 && depth <= 10) {
        return color = "#98ee00";
    }
    else if (depth > 10 && depth <= 30) {
        return color = "#d4ee00";
    }
    else if (depth > 30 && depth <= 50) {
        return color = "#eecc00";
    }
    else if (depth > 50 && depth <= 70) {
        return color = "#ee9c00";
    }
    else if (depth > 70 && depth <= 90) {
        return color = "#ea822c";
    }
    else if (90 < depth) {
        return color = "#ea2c2c";
    }
    else {
        return color = "black";
    }
}

function chooseRadius(magnitude) {
    return magnitude * 5;
};

function style(feature) {
    return {
        color: chooseColor(feature.geometry.coordinates[2]),
        radius: chooseRadius(feature.properties.mag),
        fillColor: chooseColor(feature.geometry.coordinates[2])
    }
};

function formatCircleMarker(feature) {
    let format = {
        radius: chooseSize(feature.properties.mag),
        fillColor: chooseColor(feature.geometry.coordinates[2]),
        color: chooseColor(feature.geometry.coordinates[2]),
        opacity: 0.5
    }
    return format
};

d3.json(url).then(function (data) {

    L.geoJSON(data, {
        pointToLayer: function (feature, latlon) {
            return L.circleMarker(latlon).bindPopup(feature.id);
        },
        onEachFeature: onEachFeature,
        style: style,
    }).addTo(earthquake);
    earthquake.addTo(myMap);

    let plateQueryUrl = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json'

    d3.json(plateQueryUrl).then(function (data) {
        L.geoJson(data, {
            color: "#66b3ff",
            weight: 3
        }).addTo(tectonics);
        tectonics.addTo(myMap);
    });

    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><hr><p>Magnitude: ${feature.properties.mag}</p><hr><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
    }
});

var legend = L.control({ position: "bottomright" });
legend.onAdd = function(myMap) {
    let div = L.DomUtil.create("div", "info legend");
  
    let colors = ["#98ee00", "#d4ee00", "#eecc00", "#ee9c00", "#ea822c", "#ea2c2c"]
    let depthRange = [-10, 10, 30, 50, 70, 90];
  
    for (let i = 0; i < depthRange.length; i++) {
      div.innerHTML += 
      "<i style='background: " + colors[i] + " '></i>"  + 
      depthRange[i] + (depthRange[i + 1] ? "&ndash;" + depthRange[i + 1] + "<br>" : "+");
    }
      return div;
  };

  legend.addTo(myMap);