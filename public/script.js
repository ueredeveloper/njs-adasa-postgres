let map;
let polygon = [];
let markers = [];

function initMap() {
  const center_df = { lat: -15.7454878, lng: -47.5670129 };
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 9,
    center: center_df,
  });

  const drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.RECTANGLE,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: [
        google.maps.drawing.OverlayType.MARKER,
        google.maps.drawing.OverlayType.CIRCLE,
        google.maps.drawing.OverlayType.POLYGON,
        google.maps.drawing.OverlayType.RECTANGLE,
      ],
    },
    markerOptions: {
      icon: "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png",
    },
    circleOptions: {
      fillColor: "#ffff00",
      fillOpacity: 0.2,
      strokeWeight: 1,
      clickable: false,
      editable: true,
      zIndex: 1,
    },
  });

  function setIcon(value){
    if(value==2) {
      return `https://www.google.com/intl/en_us/mapfiles/ms/micons/green-dot.png`
    } else {
      return `https://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png`
    }
  }


  google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
    if (event.type == 'polygon') {
      // colocar uma variável que puxa os polígos para limpar com setMap(null);
      polygon = [];
      event.overlay.getPath().getArray().forEach(p => {
        polygon.push([p.lng(), p.lat()])
      });

      polygon = [...polygon, polygon[0]]
      findPointsInsidePolygon(polygon).then(points => {
        console.log(points.length, points)
        
        points.forEach(p => {
          let _p = p.int_shape.coordinates;
          new google.maps.Marker({
            position: { lat: _p[1], lng: _p[0] },
            title: "Hello World!",
            icon: setIcon(p.tp_id),
            map
          });
        })
      });
    }
    if (event.type == 'circle') {
      let { center, radius } = event.overlay;
      
      findPointsInsideCircle(
        {
          center: { lng: center.lng(), lat: center.lat() },
          radius: parseInt(radius)
        }
      )
        .then((points) => {
          points.forEach(p => {
            let _p = p.int_shape.coordinates;
            new google.maps.Marker({
              position: { lat: _p[1], lng: _p[0] },
              title: "Hello World!",
              icon: setIcon(p.tp_id),
              map
            });
          });
        });
    }
    if (event.type == 'marker') {
     /* let point = event.overlay.position;
      console.log(`${point.lng()},${point.lat()}`)
      insertPoint({ lat: point.lat(), lng: point.lng() })*/
    }
    if (event.type == 'rectangle') {
      let bounds = event.overlay.getBounds();
      let NE = bounds.getNorthEast();
      let SW = bounds.getSouthWest();
      /** SUPABASE
       * Buscar pontos em um retângulo
       * @param nex {float} Noroeste longitude
       * @param ney {float} Noroeste latitude
       * @param swx {float} Sudoeste longitude
       * @param swy {float} Sudoeste longitude
       * @returns {array[]} Interferencias outorgadas.
     */
      let rectangle = { nex: NE.lng(), ney: NE.lat(), swx: SW.lng(), swy: SW.lat() }

      findPointsInsideRectangle(rectangle).then(points => {

        points.forEach(p => {
          let _p = p.int_shape.coordinates;
          new google.maps.Marker({
            position: { lat: _p[1], lng: _p[0] },
            title: "Hello World!",
            icon: setIcon(p.tp_id),
            map
          });
        })
      });
    }
  });

  drawingManager.setMap(map);
}

window.initMap = initMap;

let url = 'https://adasa-postgres.ueredeveloper.repl.co';

async function findPointsInsidePolygon(polygon) {
  console.log(polygon)
  let points = await fetch(url + '/findPointsInsidePolygon', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(polygon)
  }).then(response => {
    return response.json();
  })

  return points;
}
async function findPointsInsideCircle(circle) {

  let points = await fetch(url + '/findPointsInsideCircle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(circle)
  }).then(response => {
    return response.json();
  })

  return points;
}
async function findPointsInsideRectangle(rectangle) {
  let points = await fetch(url + '/findPointsInsideRectangle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rectangle)
  }).then(response => {
    return response.json();
  })

  return points;
}

async function insertPoint(point) {
  console.log(point)
  await fetch(url + `/insertPoint?lat=${point.lat}&lng=${point.lng}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }).then(response => {
    console.log(response)
  })

}