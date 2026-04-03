import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from './core/auth.service';

type ThemeMode = 'dark' | 'light';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf, MatToolbarModule, MatButtonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  themeIcon = '🌙';

  constructor(public auth: AuthService) {
    this.initTheme();
  }

  logout() {
    this.auth.logout();
  }

  private initTheme() {
    const saved = localStorage.getItem('theme') as ThemeMode | null;
    if (saved === 'dark' || saved === 'light') {
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    this.syncThemeIcon();
  }

  toggleTheme() {
    const current = (document.documentElement.getAttribute('data-theme') as ThemeMode | null) ?? 'dark';
    const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    this.syncThemeIcon();
  }

  private syncThemeIcon() {
    const current = (document.documentElement.getAttribute('data-theme') as ThemeMode | null) ?? 'dark';
    this.themeIcon = current === 'dark' ? '🌙' : '☀️';
  }
}
