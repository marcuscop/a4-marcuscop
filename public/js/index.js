var map;
var gpxdata = [];
var csvdata = [];

function initMap(){

  var options = {
    zoom:8,
    center:{lat:42.3601, lng:-71.0589}
  }

  map = new google.maps.Map(document.getElementById("map"), options);

}

function prep(){
  get_gpx(); // populate local array with data
  get_csv();

  document.getElementById("display").innerHTML = "<p>Loading...</p>";

  setTimeout(function(){
    document.getElementById("display").innerHTML = "<p>Rendered!</p> <button onclick='displayPath()'>Display The Map</button>";
  }, 4000);

  //document.getElementById("display").innerHTML = "<button onclick='displayPath()'>Display The Map</button>";
}

function polish_csvdata(){
  //console.log(csvdata[0]);
  var i;
  var newdata;
  for(i=0;i<csvdata.length;i++){
    newdata = csvdata[i].elapsed.slice(0,7);
    csvdata[i].elapsed = newdata;
  }

  //console.log(csvdata[5].elapsed);
  var date2;
  var date_string2;
  var hours;
  var minutes;
  var seconds;
  for(i=0;i<csvdata.length;i++){
    hours = csvdata[i].elapsed.slice(0, 1);
    //console.log(hours);
    minutes = csvdata[i].elapsed.slice(2, 4);
    //console.log(minutes);
    seconds = csvdata[i].elapsed.slice(5, 7);
    //console.log(seconds);
    date_string2 = "August 19, 2018 " + hours + ":" + minutes + ":" + seconds;
    date2 = new Date(date_string2);

    /*console.log(date2.getHours());
    console.log(date2.getMinutes());
    console.log(date2.getSeconds());*/

    csvdata[i].elapsed = date2.getHours().toString()
    + ":" + date2.getMinutes().toString()
    + ":" + date2.getSeconds().toString();

    //console.log(csvdata[i].elapsed);

  }

  //console.log(csvdata[0].elapsed);
}

function polish_gpxdata(){
  var i;
  var date, date2;
  var date_string, date_string2;

  var base_hours = parseFloat(gpxdata[0].timeofday.slice(0, 2));
  var base_minutes = parseFloat(gpxdata[0].timeofday.slice(3, 5));
  var base_seconds = parseFloat(gpxdata[0].timeofday.slice(6, 8));


  var hours;
  var minutes;
  var seconds;
  for(i=0;i<gpxdata.length;i++){
    hours = gpxdata[i].timeofday.slice(0, 2);
    minutes = gpxdata[i].timeofday.slice(3, 5);
    seconds = gpxdata[i].timeofday.slice(6, 8);
    date_string2 = "August 19, 2018 " + hours + ":" + minutes + ":" + seconds;
    date2 = new Date(date_string2);

    date2.setHours(date2.getHours() - base_hours);
    date2.setMinutes(date2.getMinutes() - base_minutes);
    date2.setSeconds(date2.getSeconds() - base_seconds);

    /*console.log(date2.getHours().toString());
    console.log(date2.getMinutes().toString());
    console.log(date2.getSeconds().toString());*/

    gpxdata[i].timeofday = date2.getHours().toString()
    + ":" + date2.getMinutes().toString()
    + ":" + date2.getSeconds().toString();

    //console.log(gpxdata[i].timeofday);

  }

}

function displayPath(){

  //console.log(gpxdata);
  polish_csvdata(); // cut out the decimals

  polish_gpxdata(); // adjust the gpx time to be elapsed time

  var lilyPath = new google.maps.Polyline({
    //geodesic: true,
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 5,
  });

  var i, j;
  var path = lilyPath.getPath();
  var myLatLng;
  var infowindow;
  var split;

  for(i=0;i<gpxdata.length;i++){
    myLatLng = new google.maps.LatLng({lat: parseFloat(gpxdata[i].lat), lng: parseFloat(gpxdata[i].lon)});
    path.push(myLatLng);
    if(i==0){map.setCenter(myLatLng); map.setZoom(13);}

    for(j=0;j<csvdata.length;j++){
      if(csvdata[j].elapsed == gpxdata[i].timeofday){
        split = csvdata[j].splspeed;
        infowindow = new google.maps.InfoWindow({
            content: split,
            position: myLatLng,
            map: map
            //visible: false
        });

        //console.log(infowindow.content);

      }// if
    }// csv


  }// gpx

  lilyPath.setMap(map);

  clearAll();
}

function gpx(){
  var data = [];
  var input = document.getElementById("gpx");
  var file = input.files[0];
  fr = new FileReader();
  fr.onload = function(){
      var text = fr.result;
      data.push(fr.result);
    };
  fr.readAsText(file);

  fr.onloadend = function () {
    console.log("sending post request");
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = handle_res
    xhr.open("POST", "/uploadgpx");
    xhr.send(data);
    console.log(data);

    function handle_res(){
      if(this.readyState != 4) return;
      if(this.status != 200){
        console.log("ERROR: State 4 of request");
      }
    }
  };

  document.getElementById("gpxsubmit").innerHTML = "Uploaded!";

}

function csv(){
  var data = [];
  var input = document.getElementById("csv");
  var file = input.files[0];
  fr = new FileReader();
  fr.onload = function(){
      var text = fr.result;
      data.push(fr.result);
    };
  fr.readAsText(file);

  fr.onloadend = function () {
    console.log("sending post request");
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = handle_res
    xhr.open("POST", "/uploadcsv");
    xhr.send(data);
    console.log(data);

    function handle_res(){
      if(this.readyState != 4) return;
      if(this.status != 200){
        console.log("ERROR: State 4 of request");
      }
    }
  };

    document.getElementById("csvsubmit").innerHTML = "Uploaded!";
}

function get_gpx(){

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function(){
    if(this.readyState != 4){ console.log(this.readyState); return;}
    gpxdata = JSON.parse(this.responseText);
    console.log(this.responseText);

    if(this.status != 200){
      console.log("ERROR: State 4 of request");
    }
  };
  xhr.open("GET", "/gpx", true);
  xhr.send();


}

function get_csv(){

  xhr = new XMLHttpRequest();
  xhr.onreadystatechange = handle_res
  xhr.open("GET", "/csv", true);
  xhr.send();

  function handle_res(){
    if(this.readyState != 4) return;
    csvdata = JSON.parse(this.responseText);
    console.log(this.responseText);

    if(this.status != 200){
      console.log("ERROR: State 4 of request");
    }
  }

}


function clearDB(){
  console.log("sending post request");
  xhr = new XMLHttpRequest();
  xhr.onreadystatechange = handle_res
  xhr.open("POST", "/clear", true);
  xhr.send("delete");

  function handle_res(){
    if(this.readyState != 4) return;
    if(this.status != 200){
      console.log("ERROR: State 4 of request");
    }
  }
}

function clearAll(){
  console.log("clearing db");
  gpxdata = [];
  csvdata = [];
  clearDB(); // clear the DB
}
