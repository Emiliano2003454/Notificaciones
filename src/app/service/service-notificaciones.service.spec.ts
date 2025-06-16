import { TestBed } from '@angular/core/testing';

import { NotificacionesService } from './service-notificaciones.service';

describe('ServiceNotificacionesService', () => {
  let service: NotificacionesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificacionesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
