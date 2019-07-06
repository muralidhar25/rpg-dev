import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/materialize';
import 'rxjs/add/operator/dematerialize';

import { User } from '../models/user.model';
import { LoginResponse } from '../models/login-response.model';
//import { Ruleset } from '../models/view-models/ruleset.model';
import { CharacterStats } from '../models/view-models/character-stats.model'
import { Characters } from '../models/view-models/characters.model';
import { usersData, loginResponse, RulesetMockData, characterStatList, charactersList } from './mock-data';

@Injectable()
export class BackendLessInterceptor implements HttpInterceptor {

    constructor() { }

    getUsers(): Observable<any[]> {
        return Observable.of(usersData);
    }



    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        let users: User[] = JSON.parse(localStorage.getItem('users')) || usersData;


        // wrap in delayed observable to simulate server api call
        return Observable.of(null).mergeMap(() => {

            // login authenticate
            if (request.url.endsWith('/myconnect/token') && request.method === 'POST') {

                let _username = request.body.split('&')[0].split('=')[1];
                let _password = request.body.split('&')[1].split('=')[1];

                // match login credentials
                let validUser = users.filter(user => {
                    if (user.userName === _username && user.password === _password)
                        return true;
                    else if (user.email === _username && user.password === _password)
                        return true;
                    else
                        return false;
                });

                if (validUser.length) {
                    let user = validUser[0];
                    let _user = {
                        id: user.id,
                        userName: user.userName,
                        fullName: user.fullName,
                        email: user.email,
                        jobTitle: user.jobTitle,
                        phoneNumber: user.phoneNumber,
                        isEnabled: user.isEnabled,
                        isLockedOut: user.isLockedOut,
                        roles: user.roles,
                    };

                    let responseData: LoginResponse[] = loginResponse;
                    let responseValid = responseData.filter(resp => {
                        if (resp.user === _user.userName)
                            return true;
                        else
                            return false;
                    });

                    if (responseValid.length) {
                        let response = responseValid[0];
                        let _response = {
                            access_token: response.access_token,
                            id_token: response.id_token,
                            refresh_token: response.refresh_token,
                            expires_in: response.refresh_token,
                            token_type: 'Bearer'
                        };

                        return Observable.of(new HttpResponse({ status: 200, body: _response }));
                    } else {
                        return Observable.throw(new Error('Please check that your email and password is correct'));
                    }
                } else {
                    // else return 400 bad request
                    return Observable.throw(new Error('Please check that your email and password is correct'));
                }
            }

            // register new user
            if (request.url.endsWith('/myconnect/register') && request.method === 'POST') {
                // get new user object from post body
                let req = request.body;
                let newUser = request.body.split('&');
                let _username = request.body.split('&')[0].split('=')[1];
                let _password = request.body.split('&')[1].split('=')[1];

                // validation
                let duplicateUser = users.filter(user => { return user.userName === newUser.username; }).length;
                if (duplicateUser) {
                    return Observable.throw('Username "' + newUser.username + '" is already taken');
                }

                // save new user
                newUser.id = users.length + 1;
                users.push(newUser);
                localStorage.setItem('users', JSON.stringify(users));

                return Observable.of(new HttpResponse({ status: 200 }));
            }

            // get ruleset
            //if (request.url.match(/\/rulesets\/\d+$/) && request.method === 'GET') {
            //if (request.url.endsWith('/api/ruleset/getrulesets') && request.method === 'GET') {
            
            //    let _rulesets: Ruleset[] = RulesetMockData;

            //    return Observable.of(new HttpResponse({ status: 200, body: _rulesets }));
            //}

            if (request.url.endsWith('/character-stat') && request.method === 'GET') {
            
                let _characterStat: any[] = characterStatList;
               

                return Observable.of(new HttpResponse({ status: 200, body: _characterStat }));
            }
         
            if (request.url.endsWith('/api/characters/GetCharacters') && request.method === 'GET') {
           
                let _characters: any[] = charactersList;
               

                return Observable.of(new HttpResponse({ status: 200, body: _characters }));
            }

            // pass through any requests not handled above
            return next.handle(request);

        })

            .materialize()
            .delay(500)
            .dematerialize();
    }
}

export let BackendLessProvider = {
    // use fake backend in place of Http service for backend-less development
    provide: HTTP_INTERCEPTORS,
    useClass: BackendLessInterceptor,
    multi: true
};
