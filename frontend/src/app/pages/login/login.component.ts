import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  readonly mode = signal<'login' | 'register'>('login');
  readonly error = signal<string | null>(null);
  readonly loading = signal(false);

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      void this.router.navigate(['/home']);
    }
  }

  setMode(m: 'login' | 'register'): void {
    this.mode.set(m);
    this.error.set(null);
  }

  submit(): void {
    this.error.set(null);
    const email = this.email.trim();
    if (!email || !this.password) {
      this.error.set('Enter email and password.');
      return;
    }
    this.loading.set(true);
    const req$ =
      this.mode() === 'login'
        ? this.auth.login(email, this.password)
        : this.auth.register(email, this.password);
    req$.subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading.set(false);
        const msg =
          err?.error?.message ||
          (this.mode() === 'login' ? 'Login failed.' : 'Registration failed.');
        this.error.set(msg);
      },
    });
  }
}
