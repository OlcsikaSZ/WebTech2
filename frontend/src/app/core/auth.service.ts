import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export type UserRole = 'admin' | 'buyer';

export interface CurrentUser {
  _id: string;
  username: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

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

  private decodeToken(): any | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      return decoded;
    } catch {
      return null;
    }
  }

  getRole(): UserRole | null {
    const decoded = this.decodeToken();
    return decoded?.role ?? null;
  }

  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }

  getUsername(): string {
    return this.decodeToken()?.username ?? '';
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

  me() {
    return this.http.get<CurrentUser>(`${environment.apiBaseUrl}/auth/me`);
  }

  listUsers() {
    return this.http.get<CurrentUser[]>(`${environment.apiBaseUrl}/auth/users`);
  }

  updateUserRole(userId: string, role: UserRole) {
    return this.http.patch(`${environment.apiBaseUrl}/auth/users/${userId}/role`, { role });
  }

  deleteUser(userId: string) {
    return this.http.delete(`${environment.apiBaseUrl}/auth/users/${userId}`);
  }
}