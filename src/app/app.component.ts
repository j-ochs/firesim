import { Component, OnInit, NgZone } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import * as L from "leaflet";
import 'rxjs';
import { WeatherService } from "./weather/weather.service";
import { ElevationService } from "./elevation/elevation.service";
import '../../node_modules/leaflet.coordinates/dist/Leaflet.Coordinates-0.1.5.src.js';
import * as T from '@turf/turf';
import * as TC from "turf-inside";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
  // providers: [WeatherService]
})
export class AppComponent {
  title = 'app';
  centerlat: number = 34.4488;
  centerlng: number = -119.6610;
  gridOnMap: boolean = false;
  errorMessage: string;
  weatherForecastData: any;
  elevationData: any;
  onwater: any;
  staticPixel: any;
  afti: number;

  // bbox: any = [-124,32,-110,49];

  bbox: any = [-118.7, 33.7, -117.8, 34.4];
  cellSide = .5;
  units = { units: 'miles' };
  hexgrid = T.hexGrid(this.bbox, this.cellSide);

  //create some GeoJSON points to be sampled (function below)
  dotcount = 10000;
  dots = this.make_dots(this.dotcount);

  //parameters for hex grid
  //this.bbox = [-118.7,33.7,-117.8,34.4];
  cellWidth = 2;
  //units = 'miles';


constructor(private zone: NgZone, private http: Http, private _weatherService: WeatherService,
  private _elevationService: ElevationService) {

}




// Define our base layers so we can reference them multiple times
googleMaps = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
  maxZoom: 20,
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
  detectRetina: true
});
googleHybrid = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
  maxZoom: 20,
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
  detectRetina: true
});
openTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  maxZoom: 17,
  attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});
Stamen_Toner = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.{ext}', {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 20,
  ext: 'png'
});
openWeatherMap_Wind = L.tileLayer('http://{s}.tile.openweathermap.org/map/wind/{z}/{x}/{y}.png?appid={apiKey}', {
  maxZoom: 19,
  attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
  apiKey: '0b9ae90c37b492b7da3c843ff795f217',
  opacity: 0.5,
  showLegend: true
});
openWeatherMap_Clouds = L.tileLayer('http://{s}.tile.openweathermap.org/map/clouds/{z}/{x}/{y}.png?appid={apiKey}', {
  maxZoom: 19,
  attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
  apiKey: '0b9ae90c37b492b7da3c843ff795f217',
  opacity: 0.7
});
openWeatherMap_Precipitation = L.tileLayer('http://{s}.tile.openweathermap.org/map/precipitation/{z}/{x}/{y}.png?appid={apiKey}', {
  maxZoom: 19,
  attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
  apiKey: '0b9ae90c37b492b7da3c843ff795f217',
  opacity: 0.5,
  showLegend: true
});
openWeatherMap_Temperature = L.tileLayer('http://{s}.tile.openweathermap.org/map/temp/{z}/{x}/{y}.png?appid={apiKey}', {
  maxZoom: 19,
  attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
  apiKey: '0b9ae90c37b492b7da3c843ff795f217',
  opacity: 0.4,
  showLegend: true
});

// Marker for Westmont College
// westmont = L.marker([34.4488, -119.6610], {
//   icon: L.icon({
//     iconSize: [25, 41],
//     iconAnchor: [13, 41],
//     iconUrl: 'leaflet/marker-icon.png',
//     shadowUrl: 'leaflet/marker-shadow.png'
//   })
// });

// Layers control object with our two base layers and the three overlay layers
layersControl = {
  baseLayers: {
    'Google Maps': this.googleMaps,
    'Google Hybrid': this.googleHybrid,
    'Open Topo Map': this.openTopoMap,
    'B&W Contrast Map': this.Stamen_Toner
  },
  overlays: {
    //'Westmont College': this.westmont,
    'Wind': this.openWeatherMap_Wind,
    'Clouds': this.openWeatherMap_Clouds,
    'Precipitation': this.openWeatherMap_Precipitation,
    'Temperature': this.openWeatherMap_Temperature,
    //'grids': this.hexgrid.features
  }
};


drawnItems = new L.FeatureGroup();


//map initialization variables
options = {
  layers: [
    L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      detectRetina: true
    }),
    this.googleMaps, this.drawnItems
  ],
  zoom: 7,
  center: L.latLng([this.centerlat, this.centerlng]),
};

//highlight style
hexStyleHighlight = {
  color: "#336",
  weight: 2,
  opacity: 1,
};

pointStyle = {
  pointToLayer: function (feature, latlng) {
    return L.circle(latlng);
  },
  style: {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
  }
}
crimeGridStyle = {
  style: function style(feature) {
    return {
      fillColor: this.getColor(feature.properties.count),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    };
  }
}

getColor(d: any) {
  return d > 50 ? '#800026' :
    d > 30 ? '#BD0026' :
      d > 25 ? '#E31A1C' :
        d > 20 ? '#FC4E2A' :
          d > 15 ? '#FD8D3C' :
            d > 10 ? '#FEB24C' :
              d > 5 ? '#FED976' :
                '#FFEDA0';
}

mystyle(feature: any) {
  return {
    fillColor: this.getColor(feature.properties.count),
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7
  };
}

//attach styles and popups to the hex layer
highlightHex(e) {
  var layer = e.target;
  layer.setStyle(this.hexStyleHighlight);
}

resetHexHighlight(e) {
  var layer = e.target;
  var hexStyleDefault = this.mystyle(layer.feature);
  layer.setStyle(hexStyleDefault);
}

onEachHex(feature, layer) {
  console.log('ON EACH HEX: ', feature);

  var color = "";
  if (feature.properties.count > 50) { color = '#800026' } else
  if (feature.properties.count > 30) { color = '#BD0026' } else
  if (feature.properties.count > 25) { color = '#E31A1C' } else
  if (feature.properties.count > 20) { color = '#FC4E2A' } else
  if (feature.properties.count > 15) { color = '#FD8D3C' } else
  if (feature.properties.count > 10) { color = '#FEB24C' } else
  if (feature.properties.count > 5) { color = '#FED976' } else { color = '#FFEDA0'};
  // layer.on({
  //   mouseover: this.highlightHex,
  //   mouseout: this.resetHexHighlight
  // });
  layer.on('mouseover', (e: any) => {
    var layer = e.target;
    layer.setStyle(this.hexStyleHighlight);
  });
  layer.on('mouseout', (e: any) => {
    var layer = e.target;
    var hexStyleDefault = {
      fillColor: color,
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.4
    }
    //this.mystyle(layer.feature);
    layer.setStyle(hexStyleDefault);
  });
  //var hexStyleDefault = this.mystyle(layer.feature);
  var hexStyleDefault = {
    fillColor: color,
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.4
  };
  
  layer.setStyle(hexStyleDefault);
  //for the sake of grammar
  if (feature.properties.count == 1) {
    var be_verb = "There is";
    var point_s = "point";
  } else {
    var be_verb = "There are";
    var point_s = "points";
  }
  layer.bindPopup(be_verb + ' <b>' + feature.properties.count + '</b> ' + point_s + ' in this cell.');
}

normish(mean, range) {
  var num_out = ((Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random() - 4) / 4) * range + mean;
  return num_out;
}

//create geojson data with random ~normal distribution
make_dots(dotcount) {

  var dots = {
    type: "FeatureCollection",
    features: []
  };

  for (var i = 0; i < dotcount; ++i) {

    //set up random variables
    var x = this.normish(0, 4);
    var y = this.normish(0, 4);

    //create points randomly distributed about center coordinates
    var g = {
      "type": "Point",
      "coordinates": [((x * 0.11) + -118.25), ((y * 0.1) + 34.05)]
    };

    //create feature properties, roughly proportional to distance from center coordinates
    var p = {
      "id": i,
      "popup": "Dot_" + i,
      "year": Math.sqrt(x * x + y * y) * 60 * (1 - Math.random() / 1.5) + 1900,
      //"size": Math.round((parseFloat(Math.abs((this.normish(y*y, 2) + this.normish(x*x, 2)) * 50) + 10)) * 100) / 100
    };

    //create features with proper geojson structure        
    dots.features.push({
      "geometry": g,
      "type": "Feature",
      "properties": p
    });
  }
  return dots;
}





onMapReady(map: L.Map) {
  L.control.scale({ metric: false }).addTo(map);
  L.control.coordinates({ position: "bottomleft" }).addTo(map);

    //create hex grid and count points within each cell
    //var hexcounts = T.collect(this.hexgrid, this.dots, 'd', 'd');
    //L.geoJSON(hexcounts, { onEachFeature: this.onEachHex }).addTo(map);

  map.on('click', (e: any) => {
    this.getForecastByCoords(e.latlng.lat, e.latlng.lng);
    this._weatherService.getWeatherForecast(e.latlng.lat, e.latlng.lng)
      .subscribe(res => {
        this.weatherForecastData = res;
        this.afti = this.calculateAfti(this.weatherForecastData.list[0].wind.speed,
          this.weatherForecastData.list[0].main.humidity, this.weatherForecastData.list[0].weather[0].description,
          this.weatherForecastData.list[0].main.temp);

        console.log('ONWATER: ', this.getOnWaterByCoords(e.latlng.lat, e.latlng.lng));
        var popup = L.popup()
          .setLatLng(e.latlng)
          .setContent(this.weatherForecastData.city.name + ' at ' + this.weatherForecastData.list[0].dt_txt + ': '
          + this.weatherForecastData.list[0].weather[0].description + '<br>' + 'Wind speed: ' + this.weatherForecastData.list[0].wind.speed
          + ' , ' + this.weatherForecastData.list[0].wind.deg + ' | Humidity: ' + this.weatherForecastData.list[0].main.humidity
          + '<br> Temp: ' + this.weatherForecastData.list[0].main.temp + ' | Elev: ' + this.elevationData.results[0].elevation / .3048 + '<br><b> AFTI Score: ' + this.afti + '</b><br>')
          .openOn(map);
      },
      error => this.errorMessage = <any>error);
    console.log('ELEV: ', this.getElevationByCoords(e.latlng.lat, e.latlng.lng));
    //console.log('STATIC: ', this.getStaticPixelByCoords(e.latlng.lat, e.latlng.lng, map.getZoom()));


    if (!this.gridOnMap) {
      this.showGrid(map, e.latlng);
      this.gridOnMap = true;
    }
  });

}


getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = this.deg2rad(lat2 - lat1);  // deg2rad below
  var dLon = this.deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}
deg2rad(deg) {
  return deg * (Math.PI / 180)
}


showGrid(map: L.Map, coords: any) {
  console.log('showGrid called ');
  //bbox: any = [-124,32,-110,49];
  this.bbox = [coords.lng - .2, coords.lat - .14, coords.lng + .2, coords.lat + .14];
  this.hexgrid = T.hexGrid(this.bbox, this.cellSide);


  for (var i=0; i<Object.keys(this.hexgrid.features).length; i++) {

    var randNum = Math.floor(Math.random() * (50 - 1) + 1);
    this.hexgrid.features[i].properties['count'] = randNum;
    //var geojson = L.geoJSON(this.hexgrid.features[i]).addTo(map);
    var gj = L.geoJSON(this.hexgrid.features[i], { onEachFeature: this.onEachHex }).addTo(map);
  }

  console.log("FEATURES: ", this.hexgrid.features);

  // -- START OF COLORIZATION ATTEMPT --
  //var points = T.randomPoint(100, { bbox: [coords.lng - .14, coords.lat - .2, coords.lng + .14, coords.lat + .2] });

  // create a "z" value for each point up to 50
  // points.features.forEach(function (d) {
  //   d.properties.z = ~~(Math.random() * 50);
  // });

  // show the points on the map
  //var pts = L.geoJSON(points, this.pointStyle).addTo(map);
  //var count = T.collect(this.hexgrid, points, "z", "z")
  //for (var i=0; i<count.features.length; i++) {
  //var pts = L.geoJSON(points.features[i], this.pointStyle[i]).addTo(map);
  //console.log('ASDFASDFASDF', points,count);
  //L.geoJSON(this.hexgrid.features[i], this.crimeGridStyle).addTo(map);
  //}

}


ngOnInit() {}


getForecastByCoords(lat: any, lng: any) {
  //http://api.openweathermap.org/data/2.5/forecast?lat=35.0845611&lon=137.1706404&units=metric&appid=0b9ae90c37b492b7da3c843ff795f217"
  this._weatherService.getWeatherForecast(lat, lng)
    .subscribe(res => {
      this.weatherForecastData = res;
    },
    error => this.errorMessage = <any>error);
  return this.weatherForecastData;
}

getElevationByCoords(lat: any, lng: any) {
  this._elevationService.getElevation(lat, lng)
    .subscribe(res => {
      this.elevationData = res;
    },
    error => this.errorMessage = <any>error);
  return this.elevationData;
}

getStaticPixelByCoords(lat: any, lng: any, mapzoom: number) {
  this._elevationService.getStaticPixel(lat, lng, mapzoom)
    .subscribe(res => {
      this.staticPixel = res;
      var canvas = document.createElement("canvas");
      var context = canvas.getContext('2d');
      var drawing = new Image();
      drawing.src = this.staticPixel;
      drawing.onload = function () {
        context.drawImage(drawing, 0, 0);
      };
      var dataURL = canvas.toDataURL("image/png");
      console.log('ASDFASDF: ', dataURL)
      console.log('STATIC PIXEL res: ', this.staticPixel.getImageData(0, 0, 0, 0));
    },
    error => this.errorMessage = <any>error);
  return this.staticPixel;
}
getOnWaterByCoords(lat: any, lng: any) {
  this._elevationService.getOnWater(lat, lng)
    .subscribe(res => {
      this.onwater = res;
      if (this.onwater.water) { this.afti = 0 }
      console.log('ONWATER res: ', this.onwater, this.afti);
    },
    error => this.errorMessage = <any>error);
  return this.onwater;
}

calculateAfti(wind: number, hum: number, precip: String, temp: number) {
  //WIND
  var w, h, p, t;
  if (wind >= 0 && wind < 6) { w = 1 }
  else if (wind >= 6 && wind < 12) { w = 2 }
  else if (wind >= 12 && wind < 19) { w = 3 }
  else { w = 4 }
  //HUMIDITY
  if (hum >= 76 && hum < 101) { h = 1 }
  else if (hum <= 75 && hum > 51) { h = 2 }
  else if (hum <= 50 && hum > 26) { h = 3 }
  else { h = 4 }
  //PRECIPITATION
  if (precip.includes('clear')) { p = 4 }
  else if (precip.includes('light')) { p = 2.5 }
  else if (precip.includes('moderate')) { p = 2 }
  else if (precip.includes('light') || precip.includes('moderate') && w > 2) { p = 1; w = 1 }
  else { p = 1 }
  //TEMPERATURE
  if (temp >= -50 && temp <= 40) { t = 1 }
  else if (temp > 40 && temp < 64) { t = 2 }
  else if (temp > 65 && temp < 84) { t = 3 }
  else { t = 4 }
  //FUEL
  // if fuel >= 0 and fuel < 12:
  //     f = 1
  // elif fuel >= 13 and fuel < 25:
  //     f = 2
  // elif fuel >= 26 and fuel < 38:
  //     f = 3
  // elif fuel >= 39:
  //     f = 4
  // //SLOPE
  // if slope >= 0 and slope < 5:
  //     s = 1
  // elif slope >= 6 and slope < 15:
  //     s = 2
  // elif slope >= 16 and slope < 30:
  //     s = 3
  // elif slope >= 31:
  //     s = 4
  var afti = (2 * w) + h + (1.8 * p) + (1.2 * t);
  console.log("Input values -- Wind: " + wind + " Humidity: " + hum + " Precip: " + precip + " Temp: " + temp);
  console.log("Risk Table Results -- Wind: " + w + " Humidity: " + h + " Precip: " + p + " Temp: " + t);
  console.log("AFTI Score: ", afti);
  return afti;
}

}
