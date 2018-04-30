import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers, RequestOptions, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { elevationEnv, staticEnv } from '../../environments/environment';
import { APP_CONFIG, IAppConfig } from '../app.config';



@Injectable()
export class ElevationService {

    constructor(private http: Http) {
    }

    getElevation(lat: number, lng: number): Observable<any[]> {
        //console.log('elevation for coords: ', lat, lng);

        var options = new RequestOptions({
            headers: new Headers({
              'Accept': 'application/json'
            })
        });
        //https://maps.googleapis.com/maps/api/elevation/json?locations=27.830797,86.469629&key=AIzaSyAzAy0Bp_D47hzpkNjFAY0szLh8I-f5ZTE
        return this.http.get(elevationEnv.baseUrl + 'json?locations=' + lat + ',' + lng + '&key=' + elevationEnv.appId, options)
            .map(this.extractData)
            .catch(this.handleError);
    }


    getStaticPixel(lat: number, lng: number, zoom: any): Observable<any[]> {
        //console.log('elevation for coords: ', lat, lng);

        var options = new RequestOptions({
            headers: new Headers({
              'Accept': 'application/json'
            })
        });
        //http://maps.googleapis.com/maps/api/staticmap?center=35.1479,-119.7842&zoom=12&size=600x600&maptype=roadmap&key=AIzaSyAzAy0Bp_D47hzpkNjFAY0szLh8I-f5ZTE
        return this.http.get(staticEnv.baseUrl + 'staticmap?center=' + lat + ',' + lng + '&zoom=' + zoom + '&size=600x600&maptype=roadmap&key=' + staticEnv.appId, { responseType: ResponseContentType.Json })
            .map(this.extractData)
            .catch(this.handleError);
    }

    //15 free requests/minute
    getOnWater(lat: number, lng: number): Observable<any[]> {
        //https://api.onwater.io/api/v1/results/34.2832,-119.3180?access_token=qscfzdjmKTp3z1os1txj
        return this.http.get('https://api.onwater.io/api/v1/results/' + lat + ',' + lng + '?access_token=qscfzdjmKTp3z1os1txj')
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