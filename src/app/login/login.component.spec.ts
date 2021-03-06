import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { EventEmitter, ChangeDetectorRef } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MaterialModule } from '../material/material.module';
import { MatDialog } from '@angular/material';
import { CommonActionsService } from '../shared/services/common-actions.service';
import { MultilingualService } from '../shared/services/multilingual.service';
import { EventsService } from '../shared/services/events.service';
import { LoggerService } from '../shared/services/logger.service';
import { StateService } from '../shared/services/state.service';
import { AuthenticationService } from '../shared/services/authentication.service';
import { SessionStorageService } from '../shared/services/session-storage.service';
import { CommunicationService } from '../shared/services/communication.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Result } from '../shared/models/enum';
import { CacheService } from '../shared/services/cache.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockLoggerservice;
  let mockEventsService;
  let mockMultilingualService;

  mockEventsService = {
    statusUpdate: new EventEmitter(),
    languageChanged: new EventEmitter(),
  };

  mockEventsService.statusUpdate = new EventEmitter();
  mockEventsService.languageChanged = new EventEmitter();

  mockMultilingualService = {
    getCaption() { return 'test'; },
    initialize() { return; },
  };

  const mockRoute = {
    params: jasmine.createSpy('params'),
  };

  const mockRouter = {
    navigate: jasmine.createSpy('navigate'),
  };

  beforeEach(async(() => {
    mockLoggerservice = jasmine.createSpyObj(['error', 'info']);

    TestBed.configureTestingModule({
      declarations: [ LoginComponent ],
      providers: [
        StateService,
        AuthenticationService,
        CacheService,
        SessionStorageService,
        { provide: CommunicationService, useValue: {} },
        { provide: LoggerService, useValue: mockLoggerservice },
        { provide: EventsService, useValue: mockEventsService },
        { provide: MultilingualService, useValue: mockMultilingualService },
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: Router, useValue: mockRouter },
        CommonActionsService,
        ChangeDetectorRef,
        MatDialog,
        FormBuilder,
      ],
      imports: [
        MaterialModule,
        ReactiveFormsModule,
        SharedModule,
        RouterModule,
        BrowserAnimationsModule,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('login', () => {
    it('should show showError', async () => {
      const loginSpy = spyOn(AuthenticationService.prototype, 'login').and.callFake(() => Result.Failed);
      const showErrorSpy = spyOn(component, 'showError');
      const fb = new FormBuilder();

      component.loginForm = fb.group({
        userName: ['nsairat', Validators.required],
        password: ['123456', Validators.required],
      });

      await component.login();

      expect(loginSpy).toHaveBeenCalledTimes(1);
      expect(showErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should raiseUserLogin', async () => {
      const loginSpy = spyOn(AuthenticationService.prototype, 'login').and.callFake(() => Result.Success);
      const sraiseUserLoginSpy = spyOn(SessionStorageService.prototype, 'raiseUserLogin');
      const checkUserPermissionSpy = spyOn(CommonActionsService.prototype, 'checkUserPermission').and.callFake(() => true);
      const fb = new FormBuilder();

      component.loginForm = fb.group({
        userName: ['nsairat', Validators.required],
        password: ['123456', Validators.required],
      });

      await component.login();

      expect(loginSpy).toHaveBeenCalledTimes(1);
      expect(sraiseUserLoginSpy).toHaveBeenCalledTimes(1);
      expect(checkUserPermissionSpy).toHaveBeenCalledTimes(1);
    });

  });

  describe('trySSO', () => {
    it('it should call SSO login', async () => {
      const cacheSpy = spyOn(CacheService.prototype, 'getIsDiffrentUser').and.callFake(() => false);
      const loginSpy = spyOn(AuthenticationService.prototype, 'SSOLogin').and.callFake(() => Result.Success);
      const checkUserPermissionSpy = spyOn(CommonActionsService.prototype, 'checkUserPermission').and.callFake(() => true);

      await component.trySSO();

      expect(loginSpy).toHaveBeenCalledTimes(2);
      expect(cacheSpy).toHaveBeenCalledTimes(2);
      expect(checkUserPermissionSpy).toHaveBeenCalledTimes(2);
    });

    it('it should not call SSO login', async () => {
      const cacheSpy = spyOn(CacheService.prototype, 'getIsDiffrentUser').and.callFake(() => true);
      const loginSpy = spyOn(AuthenticationService.prototype, 'SSOLogin');
      const checkUserPermissionSpy = spyOn(CommonActionsService.prototype, 'checkUserPermission');

      await component.trySSO();

      expect(loginSpy).toHaveBeenCalledTimes(0);
      expect(cacheSpy).toHaveBeenCalledTimes(2);
      expect(checkUserPermissionSpy).toHaveBeenCalledTimes(0);
    });

  });

  describe('showError', () => {
    it('should call get devices', async () => {
      const getErrorCaptionSpy = spyOn(CommonActionsService.prototype, 'getErrorCaption');
      const openDialogSpy = spyOn(component, 'openDialog');

      await component.showError(401);

      expect(getErrorCaptionSpy).toHaveBeenCalledTimes(1);
      expect(openDialogSpy).toHaveBeenCalledTimes(1);
    });
  });
});
