import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../service/auth-service.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginForm: FormGroup;
  loading: any;
  f: any;

  constructor(private fb: FormBuilder,  private authService: AuthService) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  login() {
    if (this.loginForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor llena todos los campos.',
      });
      return;
    }

    const { username, password } = this.loginForm.value;

    Swal.fire({
      title: 'Verificando credenciales...',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.authService.login(username, password).subscribe({
      next: (res: { token: string; }) => {
        Swal.close();
        Swal.fire({
          icon: 'success',
          title: '¡Bienvenido!',
          text: 'Inicio de sesión exitoso',
          timer: 2000,
          showConfirmButton: false
        });
        localStorage.setItem('token', res.token);
        // redireccionar si quieres
      },
      error: (err: { error: { message: string; }; }) => {
        Swal.close();
        let msg = 'Error de autenticación';
        if (err.error && err.error.message) {
          msg = err.error.message;
        }
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: msg,
        });
      }
    });
  }
}
