import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginUserInterface } from '../models/LoginUserInterface';


@Injectable({
  providedIn: 'root',
})
export class AuthClient {
  apiUrl = 'http://localhost:8080/api/speakly';

  HttpClient = inject(HttpClient);

  login(loginInfo: { username: string; password: string }): Observable<string> {
    return this.HttpClient.post(`${this.apiUrl}/auth/login`, loginInfo, { responseType: 'text' });
  }

  logout(): Observable<void> {
    return this.HttpClient.post<void>(`${this.apiUrl}/auth/logout`, {});
  }

  getCurrentUserFromToken(): Observable<LoginUserInterface> {
    return this.HttpClient.get<LoginUserInterface>(`${this.apiUrl}/auth`);
  }
  getUserByUsername(username: string): Observable<LoginUserInterface> {
    const params = new HttpParams().set('username', username);
    return this.HttpClient.get<LoginUserInterface>(`${this.apiUrl}/users/username`, { params });
  }

  // getUserById(userId: number): Observable<LoginUserInterface> {
  //   return this.HttpClient.get<LoginUserInterface>(`${this.apiUrl}/users/${userId}`);
  // }

}
