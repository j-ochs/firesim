import { Component, OnInit, NgZone } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import * as L from "leaflet";
import 'rxjs';
import { WeatherService } from "./weather/weather.service";
import { ElevationService } from "./elevation/elevation.service";
import '../../node_modules/leaflet.coordinates/dist/Leaflet.Coordinates-0.1.5.src.js';
import * as T from '@turf/turf';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
  // providers: [WeatherService]
})
export class AppComponent {
  title = 'app';
  gridOnMap: boolean = false;
  errorMessage: string;
  weatherForecastData: any;
  elevationData: any;
  staticPixel: any;
  disabledForecastButton: boolean = true;
  cityName: string;

  // bbox: any = [-124,32,-110,49];
  bbox: any = [0, 0, 0, 0];
  cellSide = .5;
  units = { units: 'miles' };
  hexgrid = T.hexGrid(this.bbox, this.cellSide);

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
    center: L.latLng([34.4488, -119.6610]),
  };



  onMapReady(map: L.Map) {
    L.control.scale({ metric: false }).addTo(map);
    L.control.coordinates({ position: "bottomleft" }).addTo(map);
    //console.log('hex: ', this.hexgrid);
    // for (var i=0; i<this.hexgrid.features.length; i++) {
    //   var geojson = L.geoJSON(this.hexgrid.features[i]).addTo(map);
    // }

    map.on('click', (e: any) => {
      //this.getForecastByCoords(e.latlng.lat, e.latlng.lng);
      this._weatherService.getWeatherForecast(e.latlng.lat, e.latlng.lng)
        .subscribe(res => {
          this.weatherForecastData = res;
          console.log('res: ', this.weatherForecastData);
          var afti = this.calculateAfti(this.weatherForecastData.list[0].wind.speed,
            this.weatherForecastData.list[0].main.humidity, this.weatherForecastData.list[0].weather[0].description,
          this.weatherForecastData.list[0].main.temp);

          var popup = L.popup()
            .setLatLng(e.latlng)
            .setContent(this.weatherForecastData.city.name + ' at ' + this.weatherForecastData.list[0].dt_txt + ': '
            + this.weatherForecastData.list[0].weather[0].description + '<br>' + 'Wind speed: ' + this.weatherForecastData.list[0].wind.speed
            + ' , ' + this.weatherForecastData.list[0].wind.deg + ' | Humidity: ' + this.weatherForecastData.list[0].main.humidity
            + '<br> Temp: ' + this.weatherForecastData.list[0].main.temp + ' | Elev: ' + this.elevationData.results[0].elevation/.3048 +  '<br><b> AFTI Score: ' + afti + '</b><br>')
            .openOn(map);
        },
        error => this.errorMessage = <any>error);
      console.log('ELEV: ', this.getElevationByCoords(e.latlng.lat, e.latlng.lng));
      console.log('STATIC: ', this.getStaticPixelByCoords(e.latlng.lat, e.latlng.lng, map.getZoom()));
      console.log('MAPZOOM: ', map.getZoom());

      if (!this.gridOnMap) {
        this.showGrid(map, e.latlng);
        this.gridOnMap = true;
      }
    });
    
  }


  getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
    var dLon = this.deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  }
  deg2rad(deg) {
    return deg * (Math.PI/180)
  }


  showGrid(map: L.Map, coords: any) {
    console.log('showGrid called ');
    //bbox: any = [-124,32,-110,49];
    this.bbox = [coords.lng - .42, coords.lat - .3, coords.lng + .42, coords.lat + .3];
    console.log('drawing new hexgrid')
    this.hexgrid = T.hexGrid(this.bbox, this.cellSide);
    for (var i = 0; i < this.hexgrid.features.length; i++) {
      var geojson = L.geoJSON(this.hexgrid.features[i]).addTo(map);
      //map.removeLayer(geojson)
    }
    this.gridOnMap = true;
  }


  ngOnInit() {}


  getForecastByCoords(lat: any, lng: any) {
    //http://api.openweathermap.org/data/2.5/forecast?lat=35.0845611&lon=137.1706404&units=metric&appid=0b9ae90c37b492b7da3c843ff795f217"
    this._weatherService.getWeatherForecast(lat, lng)
      .subscribe(res => {
        this.weatherForecastData = res;
        console.log('WEATHER res: ', this.weatherForecastData);
      },
      error => this.errorMessage = <any>error);
    return this.weatherForecastData;
  }

  getElevationByCoords(lat: any, lng: any) {
    this._elevationService.getElevation(lat, lng)
      .subscribe(res => {
        this.elevationData = res;
        console.log('ELEVATION res: ', this.elevationData);
      },
      error => this.errorMessage = <any>error);
    return this.elevationData;
  }

  getStaticPixelByCoords(lat: any, lng: any, mapzoom: number) {
    this._elevationService.getStaticPixel(lat, lng, mapzoom)
      .subscribe(res => {
        this.staticPixel = res;
        console.log('STATIC PIXEL res: ', this.staticPixel.type);
      },
      error => this.errorMessage = <any>error);
    return this.staticPixel;
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
    else { t= 4 }
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
