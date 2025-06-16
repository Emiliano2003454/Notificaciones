import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { NotificacionService } from '../service/service-notificaciones.service';
import id from '@angular/common/locales/id';


@Component({
  selector: 'app-notificaciones',
  standalone: false,
  templateUrl: './notificaciones.component.html',
  styleUrl: './notificaciones.component.css'
})
export class NotificacionesComponent {
  formulario: FormGroup;
  resultados: any[] = [];
fechaInicio: any;
fechaFin: any;

  constructor( private fb: FormBuilder,
  private notificacionService: NotificacionService) {
this.formulario = this.fb.group({
  tipoNotificacion: [''],
  curp: [''],
  folio: [''],
  fechaInicio: [''],   // Nuevo control
  fechaFin: ['']          // Sigue usando "fecha" para la fecha final
});
  }

consultar() {

  const valores = this.formulario.value;
  if (this.formulario.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Verifica que todos los campos requeridos estén correctamente llenos.'
      });
      return;
    }
  if (!valores.tipoNotificacion) {
    Swal.fire({
      icon: 'warning',
      title: 'Campo requerido',
      text: 'Debes seleccionar el tipo de notificación.'
    });
    return;
  }
  const curpsTexto = valores.curp || '';
  if (curpsTexto.length > 500) {
    Swal.fire({
      icon: 'error',
      title: 'CURP muy larga',
      text: 'El campo CURP no debe superar los 500 caracteres.'
    });
    return;
  }

  const curpLista = curpsTexto
    .split(',')
    .map((c: string) => c.trim())
    .filter((c: string) => c !== '');

  const curpRegex = /^[A-Z]{4}[0-9]{6}[A-Z]{6}[0-9]{2}$/i;
  const curpsInvalidas = curpLista.filter((c: string) => !curpRegex.test(c));

  if (curpsInvalidas.length > 0) {
    Swal.fire({
      icon: 'error',
      title: 'CURP(s) inválida(s)',
      html: 'Las siguientes CURPs tienen un formato incorrecto:<br><b>' + curpsInvalidas.join(', ') + '</b>'
    });
    return;
  }

  const foliosTexto = valores.folio || '';
  if (foliosTexto.length > 500) {
    Swal.fire({
      icon: 'error',
      title: 'Folio muy largo',
      text: 'El campo folio no debe superar los 500 caracteres.'
    });
    return;
  }

  const folioLista = foliosTexto
    .split(',')
    .map((f: string) => f.trim())
    .filter((f: string) => f !== '');

  const folioRegex = /^[A-Z0-9\-]{5,20}$/i;
  const foliosInvalidos = folioLista.filter((f: string) => !folioRegex.test(f));

  if (foliosInvalidos.length > 0) {
    Swal.fire({
      icon: 'error',
      title: 'Folio(s) inválido(s)',
      html: 'Los siguientes folios son inválidos:<br><b>' + foliosInvalidos.join(', ') + '</b>'
    });
    return;
  }

  if (folioLista.length > 1 && curpLista.length > 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Ingreso no permitido',
      text: 'Si ingresas más de un Folio de Aclaración, no puedes ingresar CURP(s).'
    });
    return;
  }

  if (curpLista.length > 1 && folioLista.length > 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Ingreso no permitido',
      text: 'Si ingresas más de una CURP, no puedes ingresar folios de aclaración.'
    });
    return;
  }

  // ----------- NUEVA VALIDACIÓN DE FECHAS -----------
  const fechaInicioStr = valores.fechaInicio;
  const fechaFinStr = valores.fechaFin;
  const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (fechaInicioStr) {
    if (!fechaRegex.test(fechaInicioStr)) {
      Swal.fire({
        icon: 'error',
        title: 'Fecha de inicio inválida',
        text: 'La fecha de inicio debe estar en formato YYYY-MM-DD.'
      });
      return;
    }

    const fechaInicio = new Date(fechaInicioStr);
    if (fechaInicio > hoy) {
      Swal.fire({
        icon: 'error',
        title: 'Fecha futura',
        text: 'La fecha de inicio no puede ser futura.'
      });
      return;
    }
  }

  if (fechaFinStr) {
    if (!fechaRegex.test(fechaFinStr)) {
      Swal.fire({
        icon: 'error',
        title: 'Fecha final inválida',
        text: 'La fecha final debe estar en formato YYYY-MM-DD.'
      });
      return;
    }

    const fechaFin = new Date(fechaFinStr);
    if (fechaFin > hoy) {
      Swal.fire({
        icon: 'error',
        title: 'Fecha futura',
        text: 'La fecha final no puede ser futura.'
      });
      return;
    }
  }

  if (fechaInicioStr && fechaFinStr) {
    const inicio = new Date(fechaInicioStr);
    const fin = new Date(fechaFinStr);
    const diffDias = Math.abs(fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDias > 31) {
      Swal.fire({
        icon: 'error',
        title: 'Rango de fechas inválido',
        text: 'La diferencia entre la fecha de inicio y la fecha final no debe ser mayor a un mes (31 días).'
      });
      return;
    }
  }
  // --------------------------------------------------

  this.resultados = curpLista.map((curp: any, index: number) => ({
    id: index + 1,
    tipo: valores.tipoNotificacion,
    curp: curp,
    folio: folioLista[index] || '',
    fechaInicio: fechaFinStr || new Date().toISOString().split('T')[0],
    fechaFin: fechaFinStr || new Date().toISOString().split('T')[0]
  }));
 this.resultados = curpLista.map((curp: any, index: number) => ({
  id: index + 1,
  tipo: valores.tipoNotificacion,
  curp: curp,
  folio: folioLista[index] || '',
  fechaInicio: fechaInicioStr || new Date().toISOString().split('T')[0],
  fechaFin: fechaFinStr || new Date().toISOString().split('T')[0]
}));

const nuevaConsulta = {
  tiponotificacion: valores.tipoNotificacion,
  curp: curpLista[0] || '',
  folio: folioLista[0] || '',
  fechaInicio: fechaInicioStr,
  fechaFin: fechaFinStr,
  nombreCompleto: '',
  rfc: '',
  numerotelefonico: '',
  direccion: ''
};

// Enviar al backend y luego cargar todo de la BD
this.notificacionService.guardarConsulta(nuevaConsulta).subscribe({
  next: () => {
    this.notificacionService.obtenerNotificaciones().subscribe({
      next: (data) => {
        this.resultados = data;
        Swal.fire({
          icon: 'success',
          title: 'Consulta realizada',
          text: 'La consulta fue guardada y los resultados cargados desde la base de datos.'
        });
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error al obtener datos',
          text: 'Se guardó la consulta, pero falló la carga de resultados.'
        });
      }
    });
  },
  error: () => {
    Swal.fire({
      icon: 'error',
      title: 'Error al guardar',
      text: 'No se pudo guardar la consulta en la base de datos.'
    });
  }
});

}
  limpiar(id?: number) {
  if (this.resultados.length === 0) {
    Swal.fire({
      icon: 'info',
      title: 'Sin registros',
      text: 'No hay registros para eliminar.'
    });
    return;
  }

  Swal.fire({
    title: '¿Qué deseas eliminar?',
    icon: 'question',
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: 'Eliminar uno',
    denyButtonText: 'Eliminar todos',
    cancelButtonText: 'Cancelar'
  }).then(result => {
    if (result.isConfirmed) {
      // Eliminar uno
      const opciones = this.resultados.map(n => ({
        value: n.idNotificacion,
        label: `ID: ${n.idNotificacion} - ${n.curp || n.folio || 'Sin datos'}`
      }));

      Swal.fire({
        title: 'Selecciona un registro',
        input: 'select',
        inputOptions: Object.fromEntries(opciones.map(o => [o.value, o.label])),
        inputPlaceholder: 'Selecciona un registro',
        showCancelButton: true,
        confirmButtonText: 'Eliminar'
      }).then(res => {
        if (res.isConfirmed && res.value) {
          const idSeleccionado = Number(res.value);
          this.notificacionService.eliminarNotificacion(idSeleccionado).subscribe({
            next: () => {
              this.resultados = this.resultados.filter(n => n.idNotificacion !== idSeleccionado);
              Swal.fire('Eliminado', 'El registro ha sido eliminado.', 'success');
            },
            error: () => {
              Swal.fire('Error', 'No se pudo eliminar el registro.', 'error');
            }
          });
        }
      });

    } else if (result.isDenied) {
      // Eliminar todos
      this.notificacionService.eliminarTodas().subscribe({
        next: () => {
          this.resultados = [];
          Swal.fire('Eliminados', 'Todos los registros han sido eliminados.', 'success');
        },
        error: () => {
          Swal.fire('Error', 'No se pudieron eliminar los registros.', 'error');
        }
      });
    }
  });
}

exportarExcel(): void {
  if (this.resultados.length === 0) {
    Swal.fire({
      icon: 'info',
      title: 'Sin datos',
      text: 'No hay resultados para exportar.'
    });
    return;
  }

  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.resultados);
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Notificaciones');

  const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blobData: Blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  FileSaver.saveAs(blobData, 'notificaciones.xlsx');
}
}
