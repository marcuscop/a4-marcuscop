var http = require('http')
  , fs   = require('fs')
  , url  = require('url')
  , port = 5432;


  const {Pool, Client} = require('pg');
  const connectionString = 'postgres://dqnazyotbfgvxt:485af557f315bf8f783a9e1ec8a006e70a30e25d2f6216ee6a4743bf61c91e0c@ec2-54-225-68-133.compute-1.amazonaws.com:5432/du78o8s03fo04';

  const pool = new Pool({
    connectionString: connectionString,
  });

  const client = new Client({
    connectionString: connectionString,
  });


/*

const {Pool, Client} = require('pg');

const pool = new Pool({
    user: 'dqnazyotbfgvxt',
    host: 'ec2-54-225-68-133.compute-1.amazonaws.com',
    database: 'du78o8s03fo04',
    password: '485af557f315bf8f783a9e1ec8a006e70a30e25d2f6216ee6a4743bf61c91e0c',
    port: 5432
});

const client = new Client({
    user: 'dqnazyotbfgvxt',
    host: 'ec2-54-225-68-133.compute-1.amazonaws.com',
    database: 'du78o8s03fo04',
    password: '485af557f315bf8f783a9e1ec8a006e70a30e25d2f6216ee6a4743bf61c91e0c',
    port: 5432
});
*/
var server = http.createServer (function (req, res) {

  var uri = url.parse(req.url)

  switch( uri.pathname ) {
    case '/':
      sendFile(res, 'public/index.html')
      break
    case '/index.html':
      sendFile(res, 'public/index.html')
      break
    case '/js/index.js':
      sendFile(res, 'public/js/index.js')
      break
    case '/css/style.css':
      sendFile(res, 'public/css/style.css')
      break
    case '/clear':
      if(req.method == "POST"){
        clear(req, res);
      }
      break
    case '/gpx':
      if(req.method == "GET"){
        get_gpx(req, res);
      }
    case '/csv':
      if(req.method == "GET"){
        get_csv(req, res);
      }
    case '/uploadcsv':
    if(req.method == "POST"){
      var body = '';
      req.on('data', function(data) {
        body += data;
      });
      req.on('end', function(){
        handle_csv(res, body);
        console.log('end');
      });
    }
    case '/uploadgpx':
      if(req.method == "POST"){
        var body = '';
        req.on('data', function(data) {
          body += data;
        }).on('end', function(){
          handle_gpx(res, body);
          console.log('end');
        });
      }
      break
    default:
      res.end('404 not found')
  }
})

server.listen(process.env.PORT || port);
console.log('listening on 8080')

// subroutines
// NOTE: this is an ideal place to add your data functionality

function sendFile(res, filename, contentType) {
  contentType = contentType || 'text/html';

  fs.readFile(filename, function(error, content) {
    res.writeHead(200, {'Content-type': contentType})
    res.end(content, 'utf-8')
  })

}

function clear(req, res){
  var query_string = "delete from gpx; delete from csv;";
  pool.connect(function(err, client, done){
    if(err){
      return console.error('error fetching client from pool', err);
    }
    client.query(query_string, function(err, result){
      done();

      if(err){
        return console.error('error running query', err);
      }
    });
  });
}


function get_gpx(req, res){
  var query_string = "select * from gpx";
  pool.connect(function(err, client, done){
    if(err){
      return console.error('error fetching client from pool', err);
    }
    client.query(query_string, function(err, result){
      done();

      if(err){
        return console.error('error running query', err);
      }
      res.writeHead(200, {"Content-Type": "application/json"});
      console.log(JSON.stringify(result.rows));
      res.end(JSON.stringify(result.rows));
    });
  });

}

function get_csv(req, res){
  var query_string = "select * from csv";
  pool.connect(function(err, client, done){
    if(err){
      return console.error('error fetching client from pool', err);
    }
    client.query(query_string, function(err, result){
      done();

      if(err){
        return console.error('error running query', err);
      }
      res.writeHead(200, {"Content-Type": "application/json"});
      res.end(JSON.stringify(result.rows));
    });
  });

}

function handle_csv(res, CSVstring){
  var data = CSVstring.split("\r");

  var statPoint = {
    distance: "sample",
    time: "sample",
    strcount: "sample",
    rate: "sample",
    check: "sample",
    splspeed: "sample",
    speed: "sample",
    dispstr: "sample",
  };

  var i, j;
  var dataPoint = [];
  var query_string = "";
  for(i=3;i<data.length-1;i++){
    dataPoint = data[i].split(",");
    statPoint.distance = dataPoint[0];
    statPoint.time = dataPoint[1];
    statPoint.strcount = dataPoint[2];
    statPoint.rate = dataPoint[3];
    statPoint.check = dataPoint[4];
    statPoint.splspeed = dataPoint[5];
    statPoint.speed = dataPoint[6];
    statPoint.dispstr = dataPoint[7];

    // DB the stats
    query_string +="INSERT INTO csv (distance, elapsed, strcount, rate, checkf, splspeed, speed, dispstr) values ('"
    + statPoint.distance + "','"
    + statPoint.time + "','"
    + statPoint.strcount + "','"
    + statPoint.rate + "','"
    + statPoint.check + "','"
    + statPoint.splspeed + "','"
    + statPoint.speed + "','"
    + statPoint.dispstr + "');";

  } // for

  pool.connect(function(err, client, done){
    if(err){
      return console.error('error fetching client from pool', err);
    }
    client.query(query_string, function(err, result){
      done();

      if(err){
        return console.error('error running query', err);
      }
    });
  });

  res.end();

}

function handle_gpx(res, GPXstring){
  var trackPoints = GPXstring.split("</trkpt>");
  var regex = /[0-9 +-]/;
  var i;
  var offset;
  var query_string = "";
  var GPSpoint = {
    time: "sample",
    lon: "sample",
    lat: "sample"
  };

  for(i=0;i<trackPoints.length-1; i++){
    var string = trackPoints[i];

    // Get the time
    var index = string.indexOf("T");
    offset = string.substring(index).search(regex);
    GPSpoint.time = string.substring(index+offset, index+offset+8);

    // Get the Longitude
    var index = string.indexOf("lon");
    offset = string.substring(index).search(regex);
    GPSpoint.lon = string.substring(index+offset, index+offset+10);

    // Get the Latitude
    var index = string.indexOf("lat");
    offset = string.substring(index).search(regex);
    GPSpoint.lat = string.substring(index+offset, index+offset+9);

    // DB the stats

    query_string+=("INSERT INTO gpx (lon, lat, timeOfDay) values ('"
    + GPSpoint.lon + "','"
    + GPSpoint.lat + "','"
    + GPSpoint.time + "'); ");

  }//for


  pool.connect(function(err, client, done){
    if(err){
      return console.error('error fetching client from pool', err);
    }
    client.query(query_string, function(err, result){
      done();

      if(err){
        return console.error('error running query', err);
      }
    });
  });

  res.end();
}
