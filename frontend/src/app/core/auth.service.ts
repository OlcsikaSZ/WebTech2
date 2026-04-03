import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private key = 'token';

  constructor(private http: HttpClient, private router: Router) {}

  private hasStorage(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  isLoggedIn(): boolean {
    return this.hasStorage() && !!localStorage.getItem(this.key);
  }

  getToken(): string | null {
    return this.hasStorage() ? localStorage.getItem(this.key) : null;
  }

  setToken(token: string) {
    if (this.hasStorage()) localStorage.setItem(this.key, token);
  }

  logout() {
    if (this.hasStorage()) localStorage.removeItem(this.key);
    this.router.navigate(['/login']);
  }

  login(username: string, password: string) {
    return this.http.post<{ token: string }>(
      `${environment.apiBaseUrl}/auth/login`,
      { username, password }
    );
  }

  register(username: string, password: string) {
    return this.http.post(
      `${environment.apiBaseUrl}/auth/register`,
      { username, password }
    );
  }
}