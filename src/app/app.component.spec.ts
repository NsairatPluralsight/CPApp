import { TestBed, async, ComponentFixture, inject, fakeAsync } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { EventEmitter } from 'events';
import { StateService } from './shared/services/state.service';
import { MaterialModule } from './material/material.module';
import { LoggerService } from './shared/services/logger.service';
import { EventsService } from './shared/services/events.service';
import { MultilingualService } from './shared/services/multilingual.service';
import { Router } from '@angular/router';
import { SessionStorageService } from './shared/services/session-storage.service';
import { CommunicationService } from './shared/services/communication.service';
import { CacheService } from './shared/services/cache.service';
import { RouterTestingModule } from '@angular/router/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommunicationManagerService } from './shared/services/communication-manager.service';
import { SharedModule } from './shared/shared.module';
import { ConnectivityService } from './shared/services/connectivity.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockLoggerservice, mockEventsService, mockCommunicationManagerService;

  mockEventsService = {
    statusUpdate: new EventEmitter(),
    languageChanged: new EventEmitter(),
    unAuthenticated: new EventEmitter(),
    setUser: new EventEmitter(),
    loginUser: new EventEmitter(),
    logoutUser: new EventEmitter(),
    unAuthorized: new EventEmitter(),
    onDisconnect: new EventEmitter(),
    environmentStatusChanged: new EventEmitter()
  };

  mockEventsService.statusUpdate = new EventEmitter();
  mockEventsService.languageChanged = new EventEmitter();
  mockEventsService.unAuthenticated = new EventEmitter(),
    mockEventsService.setUser = new EventEmitter(),
    mockEventsService.loginUser = new EventEmitter(),
    mockEventsService.logoutUser = new EventEmitter(),
    mockEventsService.unAuthorized = new EventEmitter(),
    mockEventsService.onDisconnect = new EventEmitter(),
    mockEventsService.environmentStatusChanged = new EventEmitter()

  let mockRouter = {
    navigate: jasmine.createSpy('navigate')
  };

  let mockConnService = {
    getEnvironmentStatus() { return true; },
    reset() {
      return;
    }
  }

  beforeEach(async(() => {
    mockLoggerservice = jasmine.createSpyObj(['error', 'info']);

    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      providers: [
        StateService,
        SessionStorageService,
        CacheService,
        CommunicationService,
        MultilingualService,
        { provide: CommunicationManagerService, useValue: mockCommunicationManagerService },
        { provide: LoggerService, useValue: mockLoggerservice },
        { provide: EventsService, useValue: mockEventsService },
        { provide: Router, useValue: mockRouter },
        { provide: ConnectivityService, useValue: mockConnService },
      ],
      imports: [
        MaterialModule,
        RouterTestingModule,
        HttpClientTestingModule,
        SharedModule
      ]
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.debugElement.componentInstance;
    expect(component).toBeTruthy();
  }));

  describe('logout', () => {

    it('should call two methods', async () => {
      let raiseUserLogoutSpy = spyOn(SessionStorageService.prototype, 'raiseUserLogout');
      let handleLogoutSpy = spyOn(component, 'handleLogout');

      await component.logout();

      expect(raiseUserLogoutSpy).toHaveBeenCalledTimes(1);
      expect(handleLogoutSpy).toHaveBeenCalledTimes(1);
    });

  });

  describe('handleLogout', () => {

    it('should call four methods', async () => {
      let storeDataSpy = spyOn(SessionStorageService.prototype, 'storeData');
      let closeSocketIOSpy = spyOn(CommunicationService.prototype, 'closeSocketIO');
      let logoutSpy = spyOn(CommunicationService.prototype, 'logout');
      //let resetSpy = spyOn(envStatus, 'reset');
      await component.handleLogout();

      expect(logoutSpy).toHaveBeenCalledTimes(1);
      expect(storeDataSpy).toHaveBeenCalledTimes(1);
      expect(closeSocketIOSpy).toHaveBeenCalledTimes(1);
      //expect(resetSpy).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
    });
  });

});
