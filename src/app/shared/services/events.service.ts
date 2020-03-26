import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  statusUpdate: EventEmitter<any> = new EventEmitter();
  languageChanged: EventEmitter<any> = new EventEmitter();
  onDisconnect: EventEmitter<any> = new EventEmitter();
  unAuthenticated: EventEmitter<any> = new EventEmitter();
  setUser: EventEmitter<any> = new EventEmitter();
  loadDataDone: EventEmitter<boolean> = new EventEmitter<boolean>();
  logoutUser: EventEmitter<any> = new EventEmitter<any>();
  loginUser: EventEmitter<any> = new EventEmitter<any>();
  unAuthorized: EventEmitter<any> = new EventEmitter<any>();
  unAuthorizedAction: EventEmitter<any> = new EventEmitter<any>();
  reconnect: EventEmitter<any> = new EventEmitter<any>();
  servicesStatusUpdate: EventEmitter<any> = new EventEmitter<any>();
  connectivityChanged: EventEmitter<any> = new EventEmitter<any>();
  reboot: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }
}
