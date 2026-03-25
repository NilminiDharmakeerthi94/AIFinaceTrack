import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

const TOKEN_KEY = 'login_sample_token';

export interface AuthUser {
  email: string;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  readonly isLoggedIn = computed(() => !!this.token());
  readonly currentUser = signal<AuthUser | null>(null);

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {
    const t = this.token();
    if (t) {
      this.refreshMe().subscribe({
        error: () => this.clearSession(),
      });
    }
  }

  private api(path: string): string {
    return `${environment.apiUrl}/api/auth${path}`;
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(this.api('/login'), { email, password })
      .pipe(tap((res) => this.persist(res)));
  }

  register(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(this.api('/register'), { email, password })
      .pipe(tap((res) => this.persist(res)));
  }

  private persist(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    this.token.set(res.token);
    this.currentUser.set(res.user);
  }

  logout(): void {
    this.clearSession();
    void this.router.navigate(['/login']);
  }

  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.token.set(null);
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return this.token();
  }

  refreshMe(): Observable<{ user: AuthUser }> {
    return this.http.get<{ user: AuthUser }>(this.api('/me')).pipe(
        tap((body) => this.currentUser.set(body.user)),
        catchError((err) => {
          this.clearSession();
          return throwError(() => err);
        }),
      );
  }
}
