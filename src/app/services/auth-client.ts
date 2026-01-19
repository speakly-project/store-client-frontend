import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginUserInterface } from '../models/LoginUserInterface';


@Injectable({
  providedIn: 'root',
})
export class AuthClient {
<<<<<<< HEAD
  //apiUrl = 'http://localhost:8080/api/speakly-bank';
  apiUrl = 'http://localhost:3000/users';
  coursesUrl = 'http://localhost:3000/courses';
  languagesUrl = 'http://localhost:3000/languages';
  levelsUrl = 'http://localhost:3000/levels';
  rolesUrl = 'http://localhost:3000/roles';
=======
  apiUrl = 'http://localhost:8080/api/speakly-bank';
>>>>>>> feature/componente-curso

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
<<<<<<< HEAD
=======
  getUserByUsername(username: string): Observable<LoginUserInterface> {
    return this.HttpClient.get<LoginUserInterface>(`${this.apiUrl}/users/username/${username}`);
  }

>>>>>>> feature/componente-curso
  // getUserById(userId: number): Observable<LoginUserInterface> {
  //   return this.HttpClient.get<LoginUserInterface>(`${this.apiUrl}/users/${userId}`);
  // }

}
