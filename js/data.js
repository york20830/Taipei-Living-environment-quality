//define object
function eachLayer(urlname) {
    //this.layerJson = loadGeoJson(urlname);
    this.json = loadJson(urlname);
    this.layer;
    this.layer2;
    this.legendhtml = '';
    this.legend = L.control({
        position: 'bottomright'
    });
    this.status = "off";
    this.name = '';
    this.unit = '';

    this.value_column = '';
    this.infounit = '';
    this.infovalue = '';
    this.info_column = '';
};

function highlightFeature(data, e) {
    var layer = e.target;
    info.update(layer.feature.properties, data);
};

function resetHighlight(e) {
    info.update();
};

function zoomToFeature(e) {
    leafmap.fitBounds(e.target.getBounds());
};

function onEachFeature(feature, layer, data) {
    layer.on("mouseover", function (event) {
        highlightFeature(data, event);
    });
    layer.on("mouseout", function (event) {
        resetHighlight(event);
    });
    layer.on("click", function (event) {
        zoomToFeature(event);
    });
};

var crime_home = new eachLayer("data/Taipei_homeBurglary.json");
var crime_car = new eachLayer("data/Taipei_carBurglary.json");
var accident = new eachLayer("data/Taipei_accident_lite.json");
var flooding = new eachLayer("data/Taipei_flooded.json");
var soil_liq = new eachLayer();
var pollution = new eachLayer("data/Taipei_pollution.json");
var hospital = new eachLayer("data/Taipei_hospital.json");
var oilgas = new eachLayer("data/Taipei_oil.json");
var school = new eachLayer("data/Taipei_school.json");
var park = new eachLayer();
var population = new eachLayer("data/Taipei_age.json");
var salary = new eachLayer("data/Taipei_salary.json");
var bus_stop = new eachLayer("data/Taipei_busstop.json");
var mrt_stop = new eachLayer("data/Taipei_MRTstation.json");
var mrt_route = new eachLayer("data/Taipei_MRTroute.json");
var youbike = new eachLayer("http://ptx.transportdata.tw/MOTC/v2/Bike/Station/Taipei?$format=json");
var estate = new eachLayer("data/Taipei_estate_Atype_lite.json");
var district = new eachLayer("data/Taipei_district.json");
var town = new eachLayer("data/Taipei_town.json");

soil_liq.layer = new L.LayerGroup();
var url_Low = L.geoJSON(loadJson('data/liquefaction_low.json'), {
    style: {
        weight: 0,
        fillColor: 'green',
        fillOpacity: 0.5
    }
}).addTo(soil_liq.layer);
var url_Medium = L.geoJSON(loadJson('data/liquefaction_mid.json'), {
    style: {
        weight: 0,
        fillColor: 'yellow',
        fillOpacity: 0.5
    }
}).addTo(soil_liq.layer);
var url_High = L.geoJSON(loadJson('data/liquefaction_high.json'), {
    style: {
        weight: 0,
        fillColor: 'red',
        fillOpacity: 0.5
    }
}).addTo(soil_liq.layer);
school.layer = L.tileLayer('https://api.mapbox.com/styles/v1/york20830/cj0ncqovs00162rs0ujvmkhlx/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoieW9yazIwODMwIiwiYSI6ImNpeHZibm04dDAwOGMyd21uaGhwdmxuOTIifQ.3wGIIULGKcpxJYY_p9ihow');
park.layer = L.tileLayer('https://api.mapbox.com/styles/v1/york20830/cj0nh4ybu00472slf6g64zjsa/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoieW9yazIwODMwIiwiYSI6ImNpeHZibm04dDAwOGMyd21uaGhwdmxuOTIifQ.3wGIIULGKcpxJYY_p9ihow');

//layer setting
function myheat(data, column_name, style) {
    //var data_max = getMax(data, column_name);
    var data_heat = geoJson2heat(data.json, column_name);
    var data_map = L.heatLayer(data_heat, style);
    return data_map;
};

//only estate
function mycluster(data, column_name, style) {
    var geojson = L.geoJson(data.json, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                icon: style
            })
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup(parseInt(feature.properties[column_name]) + '元/坪');
            layer.on('mouseover', function (e) {
                this.openPopup();
            });
            layer.on('mouseout', function (e) {
                this.closePopup();
            });
        }
    });
    var avg = getAverage(data.json, column_name);
    var data_std = getStd(data.json, column_name);
    var datalatlong = L.markerClusterGroup({
        iconCreateFunction: function (cluster) {
            var children = cluster.getAllChildMarkers();
            var sum = 0;
            var count = 0;
            for (var i = 0; i < children.length; i++) {
                if (children[i].feature.properties[column_name] != null) {
                    sum += parseFloat(children[i].feature.properties[column_name]);
                    count++;
                }
            };
            var c = "medium";
            if (parseInt(sum / count) > avg + 0.5 * data_std) {
                c = "large";
            };
            if (parseInt(sum / count) < avg - 0.5 * data_std) {
                c = "small";
            };
            return new L.DivIcon({
                html: '<div style="border-radius: 50%;width: 35px;height: 35px"><span>' + parseInt(sum / (count * 10000)) + '萬' + '</span></div>',
                className: 'marker-cluster marker-cluster-' + c,
                iconSize: new L.Point(45, 45)
            });
        }
    });
    datalatlong.addLayer(geojson);
    return datalatlong;
};

function mybuffer(data, num, style) {
    var buffer = turf.buffer(data.json, num, 'meters');
    return L.geoJson(buffer, {
        style: style
    });
};

function mychoropleth(data, column_name, classic, mode, colorrange, style) {
    var cho = L.choropleth(data.json, {
        valueProperty: column_name,
        scale: colorrange,
        steps: parseInt(classic),
        mode: mode,
        style: style,
        onEachFeature: function (feature, layer) {
            onEachFeature(feature, layer, data);
        }
    });
    return cho;
};



function mycategory(data, column_name, key, catearr, colorarr) {
    var layer;

    function getColorScale(d) {
        for (var i = 0; i < catearr.length; i++) {
            if (d == catearr[i]) {
                return colorarr[i];
            };
        };
    };
    if (!key || !column_name) {
        layer = L.geoJson(data.json);
    } else {
        layer = L.geoJson(data.json, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, {
                    radius: 4,
                    fillColor: getColorScale(feature.properties[column_name]),
                    color: getColorScale(feature.properties[column_name]),
                    weight: 0,
                    opacity: 1,
                    fillOpacity: 0.8
                });
            },
            filter: key == 'all' ? function (feature) {
                return feature.properties[column_name]
            } : function (feature) {
                if (feature.properties[column_name] === key) {
                    return feature.properties[column_name];
                };
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
    };
    return layer;
};

function myflooded(data, column_name, column_filter, key, unit, color, classic) {
    var floodmap = L.choropleth(data.json, {
        valueProperty: column_name,
        scale: color,
        steps: classic,
        mode: 'e',
        style: {
            color: "transparent",
            weight: 2,
            opacity: 0.6,
            fillOpacity: 0.6
        },
        filter: key != undefined ? function (feature) {
            var test = parseInt(feature.properties[column_filter].replace(/[&\|\\\*^%$#@\-/]/g, ""));
            if (test >= key[0] && test <= key[1]) return feature.properties;
        } : function (feature) {
            return feature.properties;
        },
        onEachFeature: function (feature, layer) {
            onEachFeature(feature, layer, data);
        }
    });
    return floodmap;
};

function mycircle(data, column_name, style) {
    var temp = L.geoJson(data.json, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, style);
        }
    });
    return temp;
};

//only MRTroute
function mycolor(data, column_name, style) {
    function setMRTcolor(d) {
        return d == "淡水線" ? '#d12a2f' :
            d == '蘆洲線' ? '#ffa400' :
            d == '中和線' ? '#ffa400' :
            d == '新店線' ? '#007549' :
            d == '碧潭支線' ? '#cfdb00' :
            d == '新莊線' ? '#ffa400' :
            d == '木柵線' ? '#a1662c' :
            d == '南港線' ? '#005cb9' :
            d == '信義線' ? '#007549' :
            d == '松山線' ? '#007549' :
            d == '小南門線' ? '#007549' :
            d == '內湖線' ? '#a1662c' :
            '#005cb9';
    };

    function style(feature) {
        return {
            weight: 2,
            color: setMRTcolor(feature.properties[column_name]),
            dashArray: '3',
        };
    };
    var route = L.geoJson(data.json, {
        style: style,
        onEachFeature: function (feature, layer) {
            onEachFeature(feature, layer, data);
        }
    });
    return route;
};

//only youbike
function myyoubike(data, column_name, style) {
    var location = L.layerGroup();
    var real = loadJson("http://ptx.transportdata.tw/MOTC/v2/Bike/Availability/Taipei?$format=json");
    console.log(real);
    var icon = L.icon({
        iconUrl: 'images/bike.png',
        iconSize: [15, 15],
        iconAnchor: [10, 10]
    });

    for (var i = 0; i < data.length; i++) {
        var match = 0;
        var match2 = 0;
        var match3 = "";
        for (var j = 0; j < real.length; j++) {
            if (data[i].StationUID == real[j].StationUID) {
                match = real[j].AvailableRentBikes;
                match2 = real[j].AvailableReturnBikes;
                match3 = real[j].UpdateTime;
            };
        };
        var m = L.marker([parseFloat(data[i][column_name].PositionLat), parseFloat(data[i][column_name].PositionLon)], {
            title: data[i].StationName.Zh_tw,
            icon: icon
        }).bindPopup('站名:' + data[i].StationName.Zh_tw + '<br>剩餘車數:' + match + '<br>可還車位:' + match2 + '<br>更新時間:' + match3 + '');
        m.on('mouseover', function (e) {
            this.openPopup();
        });
        m.on('mouseout', function (e) {
            this.closePopup();
        });
        location.addLayer(m);
    };
    return location;
};
