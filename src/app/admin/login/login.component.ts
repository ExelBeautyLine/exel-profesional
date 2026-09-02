import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false,
})
export class LoginComponent {

  email = '';
  password = '';
  error = '';
  cargando = false;

  constructor(private http: HttpClient, private router: Router) {}

  iniciarSesion(): void {

    this.error = '';
    this.cargando = true;

    this.http.post(
      '/.netlify/functions/admin-login',
      {
        email: this.email,
        password: this.password
      },
      {
        withCredentials: true
      }
    ).subscribe({

      next: () => {

        this.cargando = false;

        this.router.navigate(['/admin']);

      },

      error: (error) => {

        this.cargando = false;

        this.error =
          error.error?.error ||
          'No se pudo iniciar sesión';

      }

    });

  }

}