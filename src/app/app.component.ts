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
  allAftiScores: any[] = [];

  // bbox: any = [-124,32,-110,49];

  bbox: any = [-118.7, 33.7, -117.8, 34.4];
  cellSide: number = 1;
  units = { units: 'miles' };
  hexgrid = T.hexGrid(this.bbox, this.cellSide);

  //parameters for hex grid
  //this.bbox = [-118.7,33.7,-117.8,34.4];
  //cellWidth: number = 2;
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


  

  // Layers control object with our two base layers and the three overlay layers
  layersControl = {
    baseLayers: {
      'Google Maps': this.googleMaps,
      'Google Hybrid': this.googleHybrid,
      'Open Topo Map': this.openTopoMap,
      'B&W Contrast Map': this.Stamen_Toner
    },
    
    overlays: {
      'Wind': this.openWeatherMap_Wind,
      'Clouds': this.openWeatherMap_Clouds,
      'Precipitation': this.openWeatherMap_Precipitation,
      'Temperature': this.openWeatherMap_Temperature
    }

  };
  
  
  


  //map initialization variables
  options = {
    layers: [
      L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        detectRetina: true
      }),
      this.googleMaps
    ],
    zoom: 7,
    center: L.latLng([this.centerlat, this.centerlng]),
  };


  onEachHex(feature, layer) {

    var color = "";
    // if (feature.properties.afti > 60) { color = '#42f459' } else
    //   if (feature.properties.afti > 26) { color = '#800026' } else
    //     if (feature.properties.afti > 22) { color = '#BD0026' } else
    //       if (feature.properties.afti > 19) { color = '#E31A1C' } else
    //         if (feature.properties.afti > 16) { color = '#FC4E2A' } else
    //           if (feature.properties.afti > 14.5) { color = '#FD8D3C' } else
    //             if (feature.properties.afti > 13) { color = '#FEB24C' } else
    //               if (feature.properties.afti > 11) { color = '#FED976' } else { color = '#42f459' };
    //assign appropriate color to grid by afti score
    if (feature.properties.afti > 60) { color = '#42f459' } else
      if (feature.properties.afti > 50) { color = '#800026' } else
        if (feature.properties.afti > 30) { color = '#BD0026' } else
          if (feature.properties.afti > 25) { color = '#E31A1C' } else
            if (feature.properties.afti > 20) { color = '#FC4E2A' } else
              if (feature.properties.afti > 15) { color = '#FD8D3C' } else
                if (feature.properties.afti > 10) { color = '#FEB24C' } else
                  if (feature.properties.afti > 5) { color = '#FED976' } else { color = '#FFEDA0' };

    var hexStyleDefault = {
      fillColor: color,
      weight: 0.5,
      opacity: 1,
      color: '#888888',
      fillOpacity: 0.5
    }
    var hexStyleHighlight = {
      fillColor: color,
      color: "black",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.5
    }

    layer.on('mouseover', (e: any) => {
      var layer = e.target;
      layer.setStyle(hexStyleHighlight);
    });
    layer.on('mouseout', (e: any) => {
      var layer = e.target;
      layer.setStyle(hexStyleDefault);
    });
    // layer.on('click', (e: any) => {
    //   layer.bindPopup('AFTI Score: ' + feature.properties.afti);
    //   console.log('feature: ', feature)
    // });
    layer.setStyle(hexStyleDefault);
  }

  iterateOverHex(feature, layer) {
    var popupcontent = [];
    for (var afti in feature.properties) {
      popupcontent.push(afti += ": " + feature.properties[afti]);
    }
    layer.bindPopup(popupcontent.join("<br />"));
    //if(feature.properties.properties.afti > 30) {
    console.log('HI there: ', feature);
    //}
  }




  onMapReady(map: L.Map) {
    L.control.scale({ metric: false }).addTo(map);
    L.control.coordinates({ position: "bottomleft" }).addTo(map);    

    map.on('click', (e: any) => {

      //AFTI DATA API CALLS -------------------------------------------------------------
      this.bbox = [e.latlng.lng - .2, e.latlng.lat - .14, e.latlng.lng + .2, e.latlng.lat + .14];
      this._weatherService.getWeatherForecast(e.latlng.lat, e.latlng.lng)
        .subscribe(res => {
          this.weatherForecastData = res;
          this.afti = this.calculateAfti(this.weatherForecastData.list[0].wind.speed,
            this.weatherForecastData.list[0].main.humidity, this.weatherForecastData.list[0].weather[0].description,
            this.weatherForecastData.list[0].main.temp);
            this._elevationService.getOnWater(e.latlng.lat, e.latlng.lng)
            .subscribe(res => {
              this.onwater = res;
              if (this.onwater.water) {
                this.afti = 0
                var popup = L.popup().setLatLng(e.latlng)
                .setContent('No fire here, this is water!').openOn(map);
              }
              console.log('ONWATER res: ', this.onwater, this.afti);
            },
            error => this.errorMessage = <any>error);

          //console.log('ONWATER: ', this.getOnWaterByCoords(e.latlng.lat, e.latlng.lng));
          //      WEATHER POPUP DATA -------------------------------------------------------------------
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

      var pt = T.point([e.latlng.lng, e.latlng.lat]);
      var bbpoly = T.bboxPolygon(this.bbox);
      var unioned;

      if (T.booleanWithin(pt, bbpoly)) {
        console.log('WITHIN GRID');




        //this.recursiveConsume(unioned, pt, e, map);

        //WARNING - API OVERFLOW:
        //this.hexgrid.features[i].properties['afti'] = this.getAftiData(this.hexgrid.features[i].geometry.coordinates[0][1]); 
        //var gj = L.geoJSON(this.hexgrid.features[i], { onEachFeature: this.onEachHex }).addTo(map);
      }

      if (!this.gridOnMap) {
        this.showGrid(map, e.latlng);
        this.gridOnMap = true;
      }
    });

  }//END OF onMapReady

  getAftiData(coords: any) { //coords: [lng, lat]
    console.log('GETTING AFTI DATA FOR ', coords);
    var loc;

    this._weatherService.getWeatherForecast(coords[1], coords[0])
      .subscribe(res => {
        this.weatherForecastData = res;
        loc = this.calculateAfti(this.weatherForecastData.list[0].wind.speed,
          this.weatherForecastData.list[0].main.humidity, this.weatherForecastData.list[0].weather[0].description,
          this.weatherForecastData.list[0].main.temp);
        var locAfti = {
          coords: coords,
          afti: loc,
          index: 0
        };

        this.allAftiScores.push(locAfti);
        console.log('ALL AFTI: ', this.allAftiScores);
      });
    return loc
  }



  showGrid(map: L.Map, coords: any) {
    console.log('showGrid called ');
    //this.bbox = [coords.lng - .1, coords.lat - .07, coords.lng + .1, coords.lat + .07]; //smaller bbox
    //this.bbox = [coords.lng - .1, coords.lat - .07, coords.lng + .1, coords.lat + .07]; //small bbox
    this.bbox = [coords.lng - .4, coords.lat - .28, coords.lng + .4, coords.lat + .28];
    this.hexgrid = T.hexGrid(this.bbox, this.cellSide);


    // RANDOM HEXGRID COLORIZATION
    for (var i = 0; i < Object.keys(this.hexgrid.features).length; i++) {
      var randNum = Math.floor(Math.random() * (50 - 1) + 1);
      this.hexgrid.features[i].properties['afti'] = randNum;
      this.hexgrid.features[i].properties['index'] = i;
      //var geojson = L.geoJSON(this.hexgrid.features[i]).addTo(map);
      //this.hexgrid.features[1].properties['afti'] = 65;
      var gj = L.geoJSON(this.hexgrid.features[i], { onEachFeature: this.onEachHex }).addTo(map);
    }
  }

  recursiveConsume(unioned: any, pt: any, e: any, map: L.Map) {
    var bbpoly = T.bboxPolygon(this.bbox);
    for (var i = 0; i < Object.keys(this.hexgrid.features).length; i++) {

      //GET HEXGRID INDEX
      if (T.booleanPointInPolygon(pt, this.hexgrid.features[i])) {
        console.log('I: ', i);
        var locAfti = {
          coords: e.latlng,
          afti: this.hexgrid.features[i].properties.afti,
          index: i
        };

        this.allAftiScores.push(locAfti);
        console.log('ALL AFTI: ', this.allAftiScores);
        for (var j = 0; j < Object.keys(this.hexgrid.features).length; j++) {
          if (T.intersect(this.hexgrid.features[i], this.hexgrid.features[j])) {
            //console.log('i j: ', i,j);
            //if (this.hexgrid.features[i].properties.afti > 30) {
            unioned = T.union(this.hexgrid.features[i], this.hexgrid.features[j]);
            this.hexgrid.features[i].properties.afti = -1;
            var un = L.geoJSON(unioned).addTo(map);
            //var gj = L.geoJSON(this.hexgrid.features[i], { onEachFeature: this.iterateOverHex }).addTo(map);
            //}
          }
        }
        
      }
    }
  }

  // incrementGrid(hg: T.FeatureCollection) {
  //   var t = 30;
  //   var a = this.allAftiScores;
  //   while (a) {
  //     for (var i=0; i<a.length; i+=1) {
  //       if (a.afti < t) {
  //         a.afti += .2;
  //       }
  //       else {
  //         a.splice(i, 1);
  //         getAdjacent(a.index).addTo(a);
  //       }
  //     }
  //   }

  // }


  ngOnInit() { }


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
