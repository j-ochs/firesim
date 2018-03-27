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
  disabledForecastButton: boolean = true;
  cityName: string;

  // bbox: any = [-124,32,-110,49];
  bbox: any = [0,0,0,0];
  cellSide = 2;
  units = {units: 'miles'};
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
  westmont = L.marker([34.4488, -119.6610], {
    icon: L.icon({
      iconSize: [25, 41],
      iconAnchor: [13, 41],
      iconUrl: 'leaflet/marker-icon.png',
      shadowUrl: 'leaflet/marker-shadow.png'
    })
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
      'Westmont College': this.westmont,
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
      this.googleMaps, this.westmont, this.drawnItems
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

        var popup = L.popup()
          .setLatLng(e.latlng)
          .setContent(e.latlng.toString() + '<br> Forecast for ' + this.weatherForecastData.city.name.toString() + ' on ' + this.weatherForecastData.list[0].dt_txt + ': '
        + this.weatherForecastData.list[0].weather[0].description.toString() + '<br>' + 'Wind: ' + this.weatherForecastData.list[0].wind.speed
        + '  ' + this.weatherForecastData.list[0].wind.deg + '<br> Humidity: ' + this.weatherForecastData.list[0].main.humidity)
          .openOn(map);
      },
      error => this.errorMessage = <any>error);

      console.log('ELEV: ', this.getElevationByCoords(e.latlng.lat, e.latlng.lng));

      if (!this.gridOnMap) {
        this.showGrid(map, e.latlng);
        this.gridOnMap = true;
      }

    });
    
  }


  showGrid(map: L.Map, coords: any) {

    //bbox: any = [-124,32,-110,49];
    this.bbox = [coords.lng-1.5,coords.lat-1,coords.lng+1.5,coords.lat+1];
    // var cellSide = 5;
    // var units = {units: 'miles'};
    
    console.log('showGrid called ', coords, this.bbox, this.hexgrid);

    if (this.gridOnMap) {
      console.log('removing existing hexgrid')
      for (var i=0; i<this.hexgrid.features.length; i++) {
        var geojson = L.geoJSON(this.hexgrid.features[i]).addTo(map);
        //map.removeLayer(L.geoJSON(this.hexgrid.features[i]));
        map.removeLayer(geojson)
        L.geoJSON().clearLayers();
      }
      
      
      console.log('REMOVED ', geojson)
      this.gridOnMap = false;
    }
    else if (!this.gridOnMap) {
      console.log('drawing new hexgrid')
      this.hexgrid = T.hexGrid(this.bbox, this.cellSide);
      for (var i=0; i<this.hexgrid.features.length; i++) {
        var geojson = L.geoJSON(this.hexgrid.features[i]).addTo(map);
        map.removeLayer(geojson)
      } 
        this.gridOnMap = true;
    }
  }


  ngOnInit() {
    console.log('On Init');
  }

  getForecastByCoords(lat: any, lng: any) {
    //http://api.openweathermap.org/data/2.5/forecast?lat=35.0845611&lon=137.1706404&units=metric&appid=0b9ae90c37b492b7da3c843ff795f217"
    this._weatherService.getWeatherForecast(lat, lng)
      .subscribe(res => {
        this.weatherForecastData = res;
        console.log('res: ', this.weatherForecastData);
      },
      error => this.errorMessage = <any>error);
      return this.weatherForecastData;
  }

  getElevationByCoords(lat: any, lng: any) {
    //http://api.openweathermap.org/data/2.5/forecast?lat=35.0845611&lon=137.1706404&units=metric&appid=0b9ae90c37b492b7da3c843ff795f217"
    this._elevationService.getElevation(lat, lng)
      .subscribe(res => {
        //res.setHeader('Access-Control-Allow-Origin','*') 
        this.elevationData = res;
        console.log('ELEVATION res: ', this.elevationData);
      },
      error => this.errorMessage = <any>error);
      return this.elevationData;
  }

}
