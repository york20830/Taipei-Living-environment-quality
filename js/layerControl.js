//leaflet layer add
function addLayer(map, layername) {
    map.addLayer(layername);
};

//leaflet layer remove
function removeLayer(map, layername) {
    map.removeLayer(layername);
};

function removeDataLayer(map, data) {
    if (map.hasLayer(data.layer)) removeLayer(map, data.layer);
    if (map.hasLayer(data.layer2)) removeLayer(map, data.layer2);
    map.removeControl(data.legend);
    data.legend = L.control({
        position: 'bottomright'
    });
};

function updateChoropleth(id, map, data, value) {
    if (map != undefined) {
        if (map.hasLayer(data.layer)) {
            data.status = 'off';
            removeLayer(map, data.layer);
            map.removeControl(data.legend);
        };
    };
    var classic = parseInt(document.getElementById(id + '_choropleth_classic').value);
    var mode = document.getElementById(id + '_choropleth_mode').value;
    var opacity = document.getElementById(id + '_choropleth_opacity').value / 100;
    var colors = [document.getElementById(id + '_choropleth_color1').value, document.getElementById(id + '_choropleth_color2').value];
    var style = {
        color: '#fff', // border color
        weight: 2,
        fillOpacity: opacity,
        opacity: opacity
    };
    data.layer = mychoropleth(data, value, classic, mode, colors, style);

    data.legend.onAdd = function (map) {
        var leg_limits = data.layer.options.limits;
        var leg_colors = data.layer.options.colors;
        var div = L.DomUtil.create('div', 'info legend');
        data.status = 'on';
        data.legendhtml = "";
        data.legendhtml += '<div class="labels"><div class="legend">圖層名稱：' + data.name + '<br>(單位:' + data.unit + ')</div>';

        for (var i = 0; i < leg_limits.length; i++) {
            data.legendhtml += '<i style="background:' + leg_colors[i] + '"></i>' + parseInt(leg_limits[i]) + (parseInt(leg_limits[i + 1]) ? '&ndash;' + parseInt(leg_limits[i + 1]) + '<br>' : '+');
        };
        div.innerHTML = data.legendhtml;
        return div;
    };
    data.legend.addTo(map);
    if (map != undefined) addLayer(map, data.layer);
};

function updateBuffer(id, map, data, icon) {
    if (map != undefined) {
        if (map.hasLayer(data.layer)) {
            removeLayer(map, data.layer);
            removeLayer(map, data.layer2);
        };
    };
    var color = document.getElementById(id + '_buffer_color').value;
    var range = document.getElementById(id + '_buffer_range').value;
    var opacity = document.getElementById(id + '_buffer_opacity').value / 100;
    var style = {
        color: "transparent",
        fillColor: color,
        fillOpacity: opacity
    };
    var marker;
    if (icon != undefined) {
        var marker = L.icon({
            iconUrl: icon,
            iconSize: [15, 15],
            iconAnchor: [10, 10]
        });
        data.layer2 = L.geoJson(data.json, {
            pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {
                    icon: marker
                })
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup(feature.properties[data.infovalue]);
                layer.on('mouseover', function (e) {
                    this.openPopup();
                });
                layer.on('mouseout', function (e) {
                    this.closePopup();
                });
            }
        });
        addLayer(map, data.layer2);
    };
    data.legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend');
        data.status = 'on';
        data.legendhtml = '<div class="labels"><div class="legend">圖層名稱：' + data.name + '</div>';
        data.legendhtml += '<i class="legend" style=" content: url(' + icon + ')"></i>' + data.unit;
        div.innerHTML = data.legendhtml;
        return div;
    };
    data.legend.addTo(map);
    data.layer = mybuffer(data, range, style, marker);
    if (map != undefined) addLayer(map, data.layer);
};

function updateHeat(id, map, data, value) {
    if (map != undefined) {
        if (map.hasLayer(data.layer)) {
            removeLayer(map, data.layer);
        };
    };
    var radius = parseInt(document.getElementById(id + '_heat_radius').value);
    var style = {
        radius: radius,
        blur: 10,
        maxZoom: 5,
        max: 10,
    };
    data.layer = myheat(data, value, style);
    if (map != undefined) addLayer(map, data.layer);
};

function updateSoil(id, map, data) {
    if (map != undefined) {
        if (map.hasLayer(data.layer)) {
            removeLayer(map, data.layer);
        };
    };

    var opacity = document.getElementById(id + '_soil_opacity').value / 100;
    var color = ['green', 'yellow', 'red'];
    var unit = ['低潛勢', '中潛勢', '高潛勢'];
    data.layer.eachLayer(function (layer) {
        layer.setStyle({
            fillOpacity: opacity
        })
    });
    data.legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend');
        data.status = 'on';
        data.legendhtml = "";
        data.legendhtml += '<div class="labels"><div class="legend">圖層名稱：' + data.name + '</div>';
        for (var i = 0; i < color.length; i++) {
            data.legendhtml += '<i style="background:' + color[i] + '"></i>' + unit[i] + '<br>';
        };
        div.innerHTML = data.legendhtml;
        return div;
    };
    data.legend.addTo(map);
    if (map != undefined) addLayer(map, data.layer);
};

function updateCategory(id, map, data, column_name) {
    if (map != undefined) {
        if (map.hasLayer(data.layer)) {
            removeLayer(map, data.layer);
        };
    };
    var key = document.getElementById(id + '_category_key').value;
    var catearr = findFilter(data.json, column_name);
    var colorarr = [];
    for (var i = 0; i < catearr.length; i++) {
        colorarr.push('#' + Math.random().toString(16).substr(4, 6));
    };

    data.layer = mycategory(data, column_name, key, catearr, colorarr);

    data.legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend');
        data.status = 'on';
        data.legendhtml = '<div class="labels"><div class="legend">圖層名稱：' + data.name + '</div>';
        for (var i = 1; i < catearr.length; i++) {
            data.legendhtml += '<i class="legend" style="height: 10px;width: 10px;border-radius:50%;background:' + colorarr[i] + '"></i>' + catearr[i] + '<br>';
        };
        div.innerHTML = data.legendhtml;
        return div;
    };
    data.legend.addTo(map);
    if (map != undefined) addLayer(map, data.layer);
};

function updateFlooded(id, map, data, value1, value2, key, unit) {
    if (map != undefined) {
        if (map.hasLayer(data.layer)) {
            removeLayer(map, data.layer);
        };
    };
    //document.getElementById(id + '_flooded_time').value;
    var classic = 5;
    var color = ['#2EFFF1', '#110C6E'];
    data.layer = myflooded(data, value1, value2, key, unit, color, classic);

    data.legend.onAdd = function (map) {
        var leg_limits = data.layer.options.limits;
        var leg_colors = data.layer.options.colors;
        var div = L.DomUtil.create('div', 'info legend');
        data.status = 'on';
        data.legendhtml = "";
        data.legendhtml += '<div class="labels"><div class="legend">圖層名稱：' + data.name + '<br>(單位:' + data.unit + ')</div>';

        for (var i = 0; i < leg_limits.length; i++) {
            data.legendhtml += '<i style="background:' + leg_colors[i] + '"></i>' + parseInt(leg_limits[i]) + (parseInt(leg_limits[i + 1]) ? '&ndash;' + parseInt(leg_limits[i + 1]) + '<br>' : '+');
        };
        div.innerHTML = data.legendhtml;
        return div;
    };
    data.legend.addTo(map);
    if (map != undefined) addLayer(map, data.layer);
};

//only estate
function updateCluster(id, map, data, column_name) {
    if (map != undefined) {
        if (map.hasLayer(data.layer)) {
            removeLayer(map, data.layer);
        };
    };
    var houseicon = L.icon({
        iconUrl: 'images/home.svg',
        iconSize: [15, 15],
        iconAnchor: [10, 10]
    });
    data.layer = mycluster(data, column_name, houseicon);
    if (map != undefined) addLayer(map, data.layer);
};

function updateCircle(id, map, data, column_name) {
    if (map != undefined) {
        if (map.hasLayer(data.layer)) {
            removeLayer(map, data.layer);
        };
    };
    var color = document.getElementById(id + '_circle_color').value;
    var markerOptions = {
        radius: 4,
        fillColor: color,
        color: "#000",
        weight: 0,
        opacity: 1,
        fillOpacity: 0.6
    };
    data.layer = mycircle(data, column_name, markerOptions);
    if (map != undefined) addLayer(map, data.layer);
};

function updateColor(id, map, data, column_name) {
    if (map != undefined) {
        removeDataLayer(map, data);
    };
    var icon = L.icon({
        iconUrl: 'images/MRTStation.png',
        iconSize: [15, 15],
        iconAnchor: [10, 10]
    });
    data.layer = mycolor(data, column_name);
    data.layer2 = L.geoJson(mrt_stop.json, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                icon: icon
            })
        }
    });

    data.legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend');
        data.status = 'on';
        data.legendhtml = '<div class="labels"><div class="legend">圖層名稱：' + data.name + '</div>';
        data.legendhtml += '<i class="legend" style=" content: url(' + "'" + 'images/MRTStation.png' + "'" + ')"></i>捷運站<br>';
        data.legendhtml += '<i class="legend" style="height:2px;border-top:2px dashed;margin-top: 7px;width:13%"></i>' + data.unit;
        div.innerHTML = data.legendhtml;
        return div;
    };
    data.legend.addTo(map);

    if (map != undefined) {
        addLayer(map, data.layer);
        addLayer(map, data.layer2);
    };
};

function updateYoubike(id, map, data, column_name) {
    if (map != undefined) {
        removeDataLayer(map, data);
    };
    data.legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend');
        data.status = 'on';
        data.legendhtml = '<div class="labels"><div class="legend">圖層名稱：' + data.name + '</div>';
        data.legendhtml += '<i class="legend" style=" content: url(' + 'images/bike.png' + ')"></i>' + data.unit;
        div.innerHTML = data.legendhtml;
        return div;
    };
    data.legend.addTo(map);
    data.layer = myyoubike(data.json, column_name);
    if (map != undefined) {
        addLayer(map, data.layer);
    };
};