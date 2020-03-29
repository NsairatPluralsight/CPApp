import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  public statusUpdate: EventEmitter<any> = new EventEmitter();
  public languageChanged: EventEmitter<any> = new EventEmitter();
  public onDisconnect: EventEmitter<any> = new EventEmitter();
  public unAuthenticated: EventEmitter<any> = new EventEmitter();
  public setUser: EventEmitter<any> = new EventEmitter();
  public loadDataDone: EventEmitter<boolean> = new EventEmitter<boolean>();
  public logoutUser: EventEmitter<any> = new EventEmitter<any>();
  public loginUser: EventEmitter<any> = new EventEmitter<any>();
  public unAuthorized: EventEmitter<any> = new EventEmitter<any>();
  public unAuthorizedAction: EventEmitter<any> = new EventEmitter<any>();
  public reconnect: EventEmitter<any> = new EventEmitter<any>();
  public servicesStatusUpdate: EventEmitter<any> = new EventEmitter<any>();
  public connectivityChanged: EventEmitter<any> = new EventEmitter<any>();
  public reboot: EventEmitter<any> = new EventEmitter<any>();

  // tslint:disable-next-line: no-empty
  constructor() { }
}
