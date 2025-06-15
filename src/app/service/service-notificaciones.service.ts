// notificacion.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  guardarConsulta(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/guardar`, data);
  }

  obtenerNotificaciones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/notificacion`);
  }
  eliminarNotificacion(id: number): Observable<any> {
  return this.http.delete(`http://localhost:8000/eliminar/${id}`);
}

eliminarTodas(): Observable<any> {
  return this.http.delete(`http://localhost:8000/eliminar-todo`);
}
}
