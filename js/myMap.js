  function pointerGenerate() {
      var image = new Image();
      image.onload = function () {
          var w = this.width,
              h = this.height;

          for (var key in testYoubike.retVal) {
              var canvas = document.createElement('canvas');
              var context = canvas.getContext('2d');

              canvas.width = w;
              canvas.height = h;
              context.drawImage(this, 0, 0, w, h);
              context.textAlign = 'center';
              context.fillText(testYoubike.retVal[key].sna, w / 2, h / 2);

              new google.maps.Marker({
                  icon: canvas.toDataURL(),
                  map: map,
                  position: new google.maps.LatLng(testYoubike.retVal[key].lat, testYoubike.retVal[key].lng)
              });
          }

      };
      image.src = 'images/pointer.png';
  };