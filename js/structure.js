//affix to auto fixed outerheight
$(document).ready(function () {
    /* affix the navbar after scroll below header */
    $(".navbar").affix({
        offset: {
            top: $("header").outerHeight(true)
        }
    });
    if ($(window).scrollTop() > document.getElementById("section1").offsetHeight) {
        document.getElementById("bannerMap").style.zIndex = -10000;

    };
});
//map controler
var xsp;
var ysp;
var xep;
var yep;
var xcn;
var ycn;

function mouseControlDown() {
    xsp = parseFloat(event.clientX);
    ysp = parseFloat(event.clientY);
};

function mouseControlUp() {
    xep = parseFloat(event.clientX);
    yep = parseFloat(event.clientY);
    var panspeed = 10;

    //set new map center
    //use google map
    /*google.maps.event.addDomListener(document.getElementById('firstlayer'), 'click', function () {
        map.panBy(xcn / panspeed, ycn / panspeed);
    });*/
    //use leaflet map
    L.DomEvent.addListener(document.getElementById('firstlayer'), 'click', function () {
        leafmap.panBy([xcn, ycn]);
        bannermap.panBy([xcn, ycn]);
    });


    //calculate movement issue
    xcn = xsp - xep;
    ycn = ysp - yep;
    //document.getElementById('nav_name').innerHTML = xcn;

    //convert coordinate point
};

//mousewheel need to cancel subsection
$(document).ready(function () {
    var num_section = $("#firstlayer section").length;
    var n = 0;
    var moving = 0;
    var header = 0;
    $('#home').click(function () {
        n = 0;
    });
    var keycode;
    $(document).on("keyup", function (e) {
        if ($("#set_control_map").is(":checked")) {

        } else {
            var code = e.which;
            if (code == 40) {
                keycode = -1;
            } else if (code == 38) {
                keycode = 1;
            }
            $("html, body").stop();
            if (moving == 0) {
                moving = 1;
                if (keycode == -1) {
                    if (n < num_section) {
                        n++;
                    }
                } else {
                    if (n > 0) {
                        n--;
                    } else {
                        header = 1;
                    }
                }
            }
            console.log(n);

            if (n > 0 && header == 0) {
                $("html, body").animate({
                    "scrollTop": $("#section" + n).offset().top
                }, function () {
                    moving = 0;
                    header = 0;
                    navDestroy(leafmap, n);
                });
            } else {
                $("html, body").animate({

                }, function () {
                    moving = 0;
                    header = 0;
                })
            }
        };
    });

    $(window).mousewheel(function (e) {
        $("html, body").stop();
        if ($("#set_control_map").is(":checked")) {

        } else {
            if (moving == 0) {
                moving = 1;
                if (e.deltaY == -1) {
                    if (n < num_section) {
                        n++;
                    }
                } else {
                    if (n > 0) {
                        n--;
                    } else {
                        header = 1;
                    }
                }
            }

            console.log(n);

            if (n > 0 && header == 0) {
                $("html, body").animate({
                    "scrollTop": $("#section" + n).offset().top
                }, function () {
                    moving = 0;
                    header = 0;
                    navDestroy(leafmap, n);
                });
            } else {
                $("html, body").animate({

                }, function () {
                    moving = 0;
                    header = 0;
                })
            }
        };
    });
    for (var i = 0; i <= num_section; i++) {
        $("#linkbar li:eq(" + i + ")").click({
            id: i
        }, function (e) {
            var page = e.data.id;
            $("html,body").animate({
                "scrollTop": $("#section" + page).offset().top
            })
            n = e.data.id
        })
    }
});