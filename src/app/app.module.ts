import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from "@angular/http";
import { LeafletModule } from "@asymmetrik/ngx-leaflet";
import { AppComponent } from './app.component';
import { WeatherService } from "../app/weather/weather.service";
import { ElevationService } from "../app/elevation/elevation.service";
import { AppConfig, APP_CONFIG } from "./app.config";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    LeafletModule.forRoot(),
    HttpModule
  ],
  providers: [
    WeatherService, { provide: APP_CONFIG, useValue: AppConfig },
    ElevationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { } 
