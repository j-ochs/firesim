import { Injectable, Inject } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { environment } from '../../environments/environment';
import { APP_CONFIG, IAppConfig } from '../app.config';


@Injectable()
export class WeatherService {

    constructor(private http: Http) {
    }

    //60 free requests/minute
    getWeatherForecast(lat: any, lng: any): Observable<any[]> {
        //console.log('forecast for coords: ', lat, lng);
        //'forecast?q=' + cityName + '&appid=' + environment.appId + '&units=' + environment.units
        //http://api.openweathermap.org/data/2.5/forecast?lat=35.0845611&lon=137.1706404&units=metric&appid=0b9ae90c37b492b7da3c843ff795f217
        return this.http.get(environment.baseUrl + '/forecast?lat=' + lat + '&lon=' + lng + '&units=imperial&appid=0b9ae90c37b492b7da3c843ff795f217')
            .map(this.extractData)
            .catch(this.handleError);
    }

    private extractData (res: Response) {
        let body = res.json();
        return body || {};
    }

    private handleError(error: any) {
        let errMsg: string;
        // if (error instanceof Response) {
        //   const body = error.json() || '';
        //   const err = body.error || JSON.stringify(body);
        //   errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        // } else {
        errMsg = error.message ? error.message : error.toString();
        //}
        console.error(errMsg);
        return Observable.throw(errMsg);
    }

}