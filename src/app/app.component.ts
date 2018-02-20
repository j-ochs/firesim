import { Component } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from "@angular/http";
import  * as L  from "leaflet";
import 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  constructor (private http: Http){

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
    opacity: 0.5
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
    opacity: 0.5
  });
  openWeatherMap_Temperature = L.tileLayer('http://{s}.tile.openweathermap.org/map/temp/{z}/{x}/{y}.png?appid={apiKey}', {
    maxZoom: 19,
    attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
    apiKey: '0b9ae90c37b492b7da3c843ff795f217',
    opacity: 0.4
  });

  // Marker for Westmont College
  westmont = L.marker([ 34.4488, -119.6610 ], {
    icon: L.icon({
      iconSize: [ 25, 41 ],
      iconAnchor: [ 13, 41 ],
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
      this.googleMaps, this.westmont
    ],
    zoom: 7,
    center: L.latLng([ 34.4488, -119.6610 ]),
  };

  getData(coords: any) {
    console.log("get data: ", coords, typeof(coords))
    return this.http.get('api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}')
        .map(response => response = response.json());
}



  onMapReady(map: L.Map) {
    L.control.scale({metric:false}).addTo(map);

    // var info = L.control({position: 'bottomleft'});
    
    // info.onAdd = function (map) {
    //     this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    //     this.update();
    //     return this._div;
    // };
    
    // // method that we will use to update the control based on feature properties passed
    // info.update = function (props) {
    //     this._div.innerHTML = '<h4>US Population Density</h4>' +  (props ?
    //         '<b>' + props.name + '</b><br />' + props.density + ' people / mi<sup>2</sup>'
    //         : 'Hover over a state');
    // };
    
    // info.addTo(map);







    // map.on('click', function(e: any) {
    //   console.log('mapclick: ', e.latlng, typeof(e.latlng)); 
    //   return this.http.get('api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}')
    //   .map(response => response = response.json());



     // this.getData(e.latLng);
      
      // var popLocation= e.;
      // var popup = L.popup()
      // .setLatLng(popLocation)
      // .setContent('<p>Hello world!<br />This is a nice popup.</p>')
      // .openOn(map);        
 // });
    // map.fitBounds([
    //   [40.712, -74.227],
    //   [40.774, -74.125]
    // ]);
  }

}
 