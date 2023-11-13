var map;

function createMap() {
    map = L.map('map', {
        center: [37.5, -96],
        zoom: 4
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    L.tileLayer('https://api.mapbox.com/styles/v1/kennabobena/clop0pg28004m01rbel2gez2f/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia2VubmFib2JlbmEiLCJhIjoiY2xvaXlvMnlzMDF5bTJqbXJkODA1b29mZCJ9.WUKNMHEkzOQmCPTzfmgd_g', {
        maxZoom: 17,
    }).addTo(map);

    new L.Control.geocoder().addTo(map);
}

function addDataToMap(geojsonData) {
    const geojsonLayer = L.geoJSON(geojsonData).addTo(map);
    map.fitBounds(geojsonLayer.getBounds());  
}

function fetchAndMapData() {
    let centerEclipseLayer;
    let tribalLayer;
    let highlightedFeature; 

    fetch("https://raw.githubusercontent.com/KCBEE21/Lab4_Data/main/CenterEclipse24.geojson")
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(function (centerEclipseJson) {
            console.log(centerEclipseJson);

            centerEclipseLayer = L.geoJSON(centerEclipseJson, {
                style: {
                    fillColor: 'black',
                    color: 'black',
                    weight: 2,
                    opacity: 1,
                    dashArray: '0',
                    fillOpacity: 0.7
                }
            }).addTo(map);
        })
        .catch(function (error) {
            console.error("Error fetching CenterEclipse24.geojson: " + error);
        });

    fetch("https://raw.githubusercontent.com/KCBEE21/Lab4_Data/main/TribalLands.geojson")
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(function (tribesJson) {
            console.log(tribesJson);

            tribalLayer = L.geoJSON(tribesJson, {
                style: {
                    fillColor: 'orange',
                    color: 'white',
                    weight: 1,
                    opacity: 0.4,
                    dashArray: '0',
                    fillOpacity: 0.5
                },
                onEachFeature: function (tribeFeature, tribeLayer) {
                    tribeLayer.on({
                        mouseover: function (e) {
                            highlightFeature(e, tribeFeature);
                        },
                        mouseout: function (e) {
                            resetHighlight(e, tribeFeature);
                        },
                    });
                }
            }).addTo(map);

            function highlightFeature(e, tribeFeature) {
                var layer = e.target;
                highlightedFeature = layer; 
                info.update(layer.feature.properties);

                layer.setStyle({
                    weight: 5,
                    color: '#666',
                    dashArray: '',
                    fillOpacity: 0.7
                });

                layer.bringToFront();
            }

            function resetHighlight(e, tribeFeature) {
                tribalLayer.resetStyle(e.target);
                info.update();
                highlightedFeature = null;
            }

           
            var info = L.control();

            info.onAdd = function (map) {
                this._div = L.DomUtil.create('div', 'info');
                this.update();
                return this._div;
            };

            info.update = function (props) {
          
                if (highlightedFeature) {
                
                    const intersecting = areFeaturesIntersecting(centerEclipseLayer.toGeoJSON(), highlightedFeature.toGeoJSON());

                    this._div.innerHTML = '<h4>US Tribal Lands</h4>' + (props ?
                        '<b>' + props.NAMELSAD + '</b><br />' +
                        (intersecting ? 'Features are intersecting!' : 'Features are not intersecting.')
                        : 'Hover over featured area');
                } else {
                    this._div.innerHTML = '<h4>US Tribal Lands</h4>' + (props ?
                        '<b>' + props.NAMELSAD + '</b><br />Hover over featured area'
                        : 'Hover over featured area');
                }
            }

            info.addTo(map);

            function areFeaturesIntersecting(feature1, feature2) {
                const isIntersecting = turf.booleanOverlap(feature1, feature2);
                return isIntersecting;
            }
        })
        .catch(function (error) {
            console.error("Error fetching TribalLands.geojson: " + error);
        });
}

fetchAndMapData();
createMap();
