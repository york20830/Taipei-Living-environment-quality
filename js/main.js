//banner use
function bannerAct(bannermap) {
    var bannermain = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png32?access_token=pk.eyJ1IjoieW9yazIwODMwIiwiYSI6ImNqMWIwejI5djAwN2wyd3BmZHh1d3R1dHkifQ.vkuBPUFGDUAEqAZD4LbvHg', {
        maxZoom: 12,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'mapbox.light'
    }).addTo(bannermap);

    var banner = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png32?access_token=pk.eyJ1IjoieW9yazIwODMwIiwiYSI6ImNqMWF6bGR2bjAwNTgyd3BwaGo1anU3MmEifQ.NVjHZS5kA0fp-K5StKmU7A', {
        maxZoom: 12,
        id: 'mapbox.pencil'
    }).addTo(bannermap);
    var bannerbar = document.getElementById("bannerswipe");
    var vtstyle = {
        rendererFactory: L.canvas.tile,
        vectorTileLayerStyles: {
            sliced: function (properties, zoom) {
                var p = properties['薪資所'] % 5;
                return {
                    fillColor: p === 0 ? '#800026' : p === 1 ? '#E31A1C' : p === 2 ? '#FEB24C' : p === 3 ? '#B2FE4C' : '#FFEDA0',
                    fillOpacity: 0.5,
                    stroke: true,
                    fill: true,
                    color: 'black',
                    weight: 0,
                }
            }
        }
    };
    var vtstyle2 = {
        rendererFactory: L.canvas.tile,
        vectorTileLayerStyles: {
            sliced: {
                color: 'black',
                stroke: true,
                opacity: 0.7,
                weight: 3,
                dashArray: '2, 4'
            }
        }
    };

    var uplay = L.vectorGrid.slicer(salary.json, vtstyle).addTo(bannermap);
    var downlay = L.vectorGrid.slicer(population.json, vtstyle2).addTo(bannermap);

    $(document).ready(function () {
        bannerScroll();
        $(window).on('scroll', function () {
            if ($(window).scrollTop() >= $(window).height()) {
                document.getElementById("bannerMap").style.zIndex = -10000;
            } else {
                document.getElementById("bannerMap").style.zIndex = 1;
            };
        });
        $(window).scroll(function () {
            bannerScroll();

        });
    });

    function bannerScroll() {
        var range = ((bannerbar.offsetTop - $(window).scrollTop() + 40) / $(window).height());

        function clip() {
            var nw = bannermap.containerPointToLayerPoint([0, 0]),
                se = bannermap.containerPointToLayerPoint(bannermap.getSize()),
                clipX = nw.y + (se.y - nw.y) * range;

            banner.getContainer().style.clip = 'rect(' + [nw.y, se.x, clipX, nw.x].join('px,') + 'px)';
            uplay.getContainer().style.clip = 'rect(' + [nw.y, se.x, clipX, nw.x].join('px,') + 'px)';
            downlay.getContainer().style.clip = 'rect(' + [clipX, se.x, se.y, nw.x].join('px,') + 'px)';
        }
        bannermap.on('move', clip);
        clip();
    };
};

function switchMapControl() {
    var num_section = $("#firstlayer .mywrapper").length;
    if ($("#set_control_map").is(":checked")) {
        for (var i = 0; i < num_section; i++) {
            var temp = i + 2;
            document.getElementById("se" + temp + "_wp").style.pointerEvents = "none";
            document.getElementById("se" + temp + "_wp_sl").style.pointerEvents = "auto";
        };
        document.getElementById("banner").style.pointerEvents = "none";
        document.getElementById("section1").style.pointerEvents = "none";
        $("body").attr('style', 'overflow: hidden');
    } else {
        for (var i = 0; i < num_section; i++) {
            var temp = i + 2;
            document.getElementById("se" + temp + "_wp").style.pointerEvents = "auto";
        };
        document.getElementById("banner").style.pointerEvents = "auto";
        document.getElementById("section1").style.pointerEvents = "auto";
        $("body").attr('style', 'overflow: auto');
    };
};

function switchDomLayer(map, data) {
    if ($("#set_house_map").is(":checked")) {
        initialize(37, map, data, 'estate');
    } else {
        removeDataLayer(map, data);
    };
};

function navDestroy(map, num) {
    destroyed(map);
    $('.layer-btn:checkbox').prop('checked', false).change();
    $('.setting-btn:checkbox').prop('checked', false).change();
    $('.nav,.collapse').collapse('hide');
    //alert(document.getElementById("section1").offsetTop);
    if (num > 1) {
        $('#nav_icon').attr('src', 'images/layer_yellow.png');
        $('#nav_name').css({
            "-webkit-animation": "twinkling 3s infinite ease-in-out"
        });
        $('#set_house_li').attr('style', 'display: block');
        $('#set_base_map').attr('style', 'visibility: visible');
    } else {
        $('#nav_icon').attr('src', 'images/layer.png');
        $('#nav_name').css({
            "-webkit-animation": ""
        });
        $('#set_house_li').attr('style', 'display: none');
        $('#set_base_map').attr('style', 'visibility: hidden');
    };
};

var ad_map_style = {
    fillColor: "white",
    weight: 2,
    opacity: 1,
    color: '#4D4D4D',
    dashArray: '3',
    fillOpacity: 0
};

function changeAMStyle(color) {
    ad_map_style = {
        fillColor: "white",
        weight: 2,
        opacity: 1,
        color: color,
        dashArray: '3',
        fillOpacity: 0
    };
    if ($('#set_ad_map_district').is(":checked")) {
        $('#set_ad_map_district').change();
    };
    if ($('#set_ad_map_town').is(":checked")) {
        $('#set_ad_map_town').change();
    };
};

function AuxiliaryMapControl(id, map, data) {
    if (map != undefined) {
        if (map.hasLayer(data.layer)) {
            data.status = 'off';
            removeLayer(map, data.layer);
            map.removeControl(data.legend);
        };
    };
    if ($('#' + id).is(":checked")) {
        data.layer = L.geoJson(data.json, ad_map_style);
        data.layer.addTo(map);
    };
};