import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../service/auth-service.service';

@Component({
  selector: 'app-registrar',
  standalone: false,
  templateUrl: './registrar.component.html',
  styleUrl: './registrar.component.css'
})
export class RegistrarComponent {
 registerForm: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      direccion: ['', Validators.required],
      numeroTelefonico: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
    });
  }

register() {
  if (this.registerForm.invalid) {
    Swal.fire('Campos inválidos', 'Por favor, llena todos los campos correctamente.', 'warning');
    return;
  }

  this.loading = true;

  const { username, password, direccion, numeroTelefonico } = this.registerForm.value;

  this.authService.register({ username, password, direccion, numeroTelefonico }).subscribe({
    next: () => {
      this.loading = false;
      Swal.fire('¡Registrado!', 'Tu cuenta ha sido creada.', 'success');
      this.registerForm.reset();
    },
    error: (err: { error: any; }) => {
      this.loading = false;
      const msg = typeof err.error === 'string'
        ? err.error
        : err.error?.message || 'No se pudo registrar el usuario.';
      Swal.fire('Error', msg, 'error');
    }
  });
}
}

