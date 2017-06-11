function soilLiq(map) {
     //loadGeoJson
     var url_Low = 'http://www.geologycloud.tw/data/zh-tw/liquefaction?area=%E8%87%BA%E5%8C%97&classify=%E4%BD%8E%E6%BD%9B%E5%8B%A2&all=true';
     var url_Medium = 'http://www.geologycloud.tw/data/zh-tw/liquefaction?area=%E8%87%BA%E5%8C%97&classify=%E4%B8%AD%E6%BD%9B%E5%8B%A2&all=true';
     var url_High = 'http://www.geologycloud.tw/data/zh-tw/liquefaction?area=%E8%87%BA%E5%8C%97&classify=%E9%AB%98%E6%BD%9B%E5%8B%A2&all=true';
     //Print_Data
     /*google map use
     map.data.loadGeoJson(url_Low);
     map.data.loadGeoJson(url_Medium);
     map.data.loadGeoJson(url_High);
     */

     $.getJSON(url_Low, function (data) {
         L.geoJSON(data, {
             style: {
                 weight: 0,
                 fillColor: 'green',
                 fillOpacity: 0.5
             }
         }).addTo(map)
     });
     $.getJSON(url_Medium, function (data) {
         L.geoJSON(data, {
             style: {
                 weight: 0,
                 fillColor: 'yellow',
                 fillOpacity: 0.5
             }
         }).addTo(map)
     });
     $.getJSON(url_High, function (data) {
         L.geoJSON(data, {
             style: {
                 weight: 0,
                 fillColor: 'red',
                 fillOpacity: 0.5
             }
         }).addTo(map)
     });
    

     /*
     //google map use
     map.data.setStyle(function (feature) {
         var rate = feature.getProperty('分級');
         if (rate == '低潛勢') {
             return {
                 strokeWeight: 0,
                 fillColor: 'green'
             };
         } else if (rate == '中潛勢') {
             return {
                 strokeWeight: 0,
                 fillColor: 'yellow'
             };
         } else if (rate == '高潛勢') {
             return {
                 strokeWeight: 0,
                 fillColor: 'red'
             };
         };
     });*/
 };
