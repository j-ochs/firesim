import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { elevationEnv } from '../../environments/environment';
import { APP_CONFIG, IAppConfig } from '../app.config';



@Injectable()
export class ElevationService {

    constructor(private http: Http) {
    }

    getElevation(lat: any, lng: any): Observable<any[]> {
        //console.log('elevation for coords: ', lat, lng);

        var options = new RequestOptions({
            headers: new Headers({
              'Accept': 'application/json'
            })
        });
        //'forecast?q=' + cityName + '&appid=' + environment.appId + '&units=' + environment.units
        //http://api.openweathermap.org/data/2.5/forecast?lat=35.0845611&lon=137.1706404&units=metric&appid=0b9ae90c37b492b7da3c843ff795f217
        //https://maps.googleapis.com/maps/api/elevation/json?locations=27.830797,86.469629&key=AIzaSyAzAy0Bp_D47hzpkNjFAY0szLh8I-f5ZTE
        return this.http.get(elevationEnv.baseUrl + 'json?locations=' + lat + ',' + lng + '&key=' + elevationEnv.appId, options)
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