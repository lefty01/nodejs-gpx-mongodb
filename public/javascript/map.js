

var map = L.map('map').setView([#{lat},#{lng}], 14);
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

$.getJSON('/maplayers',function(result){
    $.each(result, function(i, mlayer){
        $.getJSON('/mapjson/' + mlayer.name, function(data) { addLayer(data, mlayer.name ) });
    });
});

function addLayer(layer, name) {
    var leaf_layer;
    if (layer.type == "MultiPoint") {
        leaf_layer = L.geoJson(layer, { pointToLayer: function (feature, latlng) {return L.circleMarker(latlng, layer.style); }})
        leaf_layer.bindPopup(layer.type);
    } else if (layer.type == "MultiLineString") {
        leaf_layer = L.geoJson(layer, {style: layer.style });
        leaf_layer.bindPopup(layer.type);
    } else  {
        leaf_layer = L.geoJson(layer, {
            style: function(feature) {
                switch (feature.properties.style) {
                case 'Orange': return {
                    fillColor: "#e9bc3b",
                    color: "#ac8613",
                    opacity: 1,
                    fillOpacity: 0.8
                };
                case 'Blue': return {
                    fillColor: "#0099ff",
                    color: "#005f9d",
                    opacity: 1,
                    fillOpacity: 0.8
                };
                }
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup(feature.properties.name);
            }
        });
    }
    leaf_layer.addTo(map);
    
    $('#' + name).click(function(e) {
	if (map.hasLayer(leaf_layer)) {
            map.removeLayer(leaf_layer);
        } else {
            map.addLayer(leaf_layer);
        }
    });
}

