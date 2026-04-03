import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatProgressBarModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  loading = false;

  form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  submit() {
    if (this.form.invalid) return;
    const { username, password } = this.form.value as any;
    this.loading = true;

    this.auth.login(username, password).subscribe({
      next: (res) => {
        this.auth.setToken(res.token);
        this.snack.open('Sikeres belépés', 'OK', { duration: 1800 });
        this.router.navigate(['/tech']);
      },
      error: (err) => {
        const msg = err?.error?.message || 'Sikertelen belépés';
        this.snack.open(msg, 'OK', { duration: 2500 });
      },
      complete: () => (this.loading = false),
    });
  }
}