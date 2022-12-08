const express = require('express');
const app = express();
const { convertionPolygonToPostgis } = require('./tools');

app.use(express.static('public'));
app.use(express.json());

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
* Recebe um polígono e busca no anco postgress os pontos outorgados dentro daquele polígono.
* @param polygon {array} String de um polígono no formato postgres SQL, ex: let polygon = 'SRID=4674;POLYGON((1 2, 2 3, 4 5))'
*/
app.post('/findPointsInsidePolygon', async function(req, res) {

  let polygon = convertionPolygonToPostgis(req.body);
  const { data, error } = await supabase
    .rpc('findpointsinsidepolygon', { polygon: polygon })
  if (error) {
    console.log(error)
  } else {
    res.send(JSON.stringify(data))
  }
});
/**
* Buscar pontos em um retângulo
* @param nex {float} Noroeste longitude
* @param ney {float} Noroeste latitude
* @param swx {float} Sudoeste longitude
* @param swy {float} Sudoeste longitude
* @returns {array[]} Interferencias outorgadas.
*/
app.post('/findPointsInsideRectangle', async function(req, res) {

  let { nex, ney, swx, swy } = req.body;

  const { data, error } = await supabase
    .rpc('findpointsinsiderectangle', { nex: nex, ney: ney, swx: swx, swy: swy })
  if (error) {
    console.log(error)
  } else {
    res.send(JSON.stringify(data))
  }
});

app.post('/findPointsInsideCircle', async function(req, res) {
  let { center, radius } = req.body;

  const { data, error } = await supabase
    .rpc(
      'findpointsinsidecircle',
      { center: `POINT(${center.lng} ${center.lat})`, radius: parseInt(radius) }
    );

  if (error) {
    console.log(error)
  } else {
    res.send(JSON.stringify(data))
  }
});

const port = 3000;
app.listen(port, function() {
  console.log(`porta ${port}`)
})