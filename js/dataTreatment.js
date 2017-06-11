//calculate colume max value
function getMax(geojson, propname) {
    var max = -10000000000;
    geojson.features.map(function (feature) {
        if (parseFloat(feature.properties[propname].replace(/[&\|\\\*^%$#@\-/]/g, "")) > max) {
            max = parseFloat(feature.properties[propname].replace(/[&\|\\\*^%$#@\-/]/g, ""));
        };
    });
    return max;
};

function getMin(geojson, propname) {
    var min = 100000000000;
    geojson.features.map(function (feature) {
        if (parseFloat(feature.properties[propname].replace(/[&\|\\\*^%$#@\-/]/g, "")) < min) {
            min = parseFloat(feature.properties[propname].replace(/[&\|\\\*^%$#@\-/]/g, ""));
        };
    });
    return min;
};

function getAverage(geojson, propname) {
    var sum = 0;
    var count = 0;
    geojson.features.map(function (feature) {
        if (feature.properties[propname] != null) {
            sum += parseInt(feature.properties[propname]);
            count++;
        };
    });
    return sum / count;
};

function getStd(geojson, propname) {
    var avg = getAverage(geojson, propname);
    var sum = 0;
    var count = 0;
    geojson.features.map(function (feature) {
        if (feature.properties[propname] != null) {
            var diff = avg - parseFloat(feature.properties[propname]);
            sum += diff * diff;
            count++;
        };
    });
    return Math.sqrt(sum / count);
};

function setColor(value) {
    return value
};

//Grading method
//1.Equal interval
function intervalE(data, column, classic_num) {
    var max = getMax(data, column);
    var min = getMin(data, column);
    var interval = (max - min) / classic_num;
    return interval;
};

//2.Natural interval
function intervalN(data, column, classic_num) {
    var max = getMax(data, column);
    var min = getMin(data, column);
};

//3.Quantile
function intervalQ(data, column, classic_num) {

};

//4.Standard deviation
function intervalSD(data, column, classic_num) {
    var max = getMax(data, column);
    var min = getMin(data, column);
};


function setColor(each_data, interval, color) {
    var level = each_data / interval;
    return color[parseInt(level)];
};

function geoJson2heat(geojson, value, denominator) {
    return geojson.features.map(function (feature) {
        if (denominator >= 0) {
            return [feature.geometry.coordinates[1], feature.geometry.coordinates[0], feature.properties[value] / denominator]
        } else {
            return [feature.geometry.coordinates[1], feature.geometry.coordinates[0]]
        };
    });
};

function findFilter(json, value) {
    var expected_result = json.features.map(function (el) {
        return el.properties[value];
    });
    var unique = {};
    for (var i = 0; i < expected_result.length; i++) {
        unique[expected_result[i]] = 1;
    };
    var uniqueArray = ['all'];
    for (n in unique) uniqueArray.push(n);
    return uniqueArray;
};