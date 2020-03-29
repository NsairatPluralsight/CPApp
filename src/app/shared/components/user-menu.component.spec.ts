import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UserMenuComponent } from './user-menu.component';
import { MaterialModule } from 'src/app/material/material.module';
import { LoggerService } from '../services/logger.service';
import { EventEmitter } from '@angular/core';
import { CacheService } from '../services/cache.service';
import { SessionStorageService } from '../services/session-storage.service';
import { MultilingualService } from '../services/multilingual.service';
import { EventsService } from '../services/events.service';
import { Constants } from '../models/constants';
import { AuthenticatedUser } from '../models/authenticated-User';

describe('UserMenuComponent', () => {
  let component: UserMenuComponent;
  let fixture: ComponentFixture<UserMenuComponent>;
  let mockLoggerservice;
  let mockLanguageService;
  const mockSessionService = {};

  const mockEventsService = {
    logoutUser: new EventEmitter(),
  };
  mockEventsService.logoutUser = new EventEmitter();

  mockLanguageService = {
    getCaption() { return Constants.cLOGOUT; },
  };

  beforeEach(async(() => {
    mockLoggerservice = jasmine.createSpyObj(['error', 'info']);

    TestBed.configureTestingModule({
      declarations: [ UserMenuComponent ],
      providers: [
        CacheService,
        { provide: LoggerService, useValue: mockLoggerservice },
        { provide: SessionStorageService, useValue: mockSessionService },
        { provide: MultilingualService, useValue: mockLanguageService },
        {provide: EventsService, useValue: mockEventsService },
      ],
      imports: [MaterialModule],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('intilize', () => {
    beforeEach(() => {
      spyOn(component, 'ngAfterViewChecked');
      spyOn(component, 'ngOnInit');
    });

    it('should show Menu', () => {
      const authInfo = new AuthenticatedUser();
      authInfo.username = 'test';
      spyOn(CacheService.prototype, 'getUser').and.callFake(() => authInfo);

      component.initialize();

      expect(component.showMenu).toBe(true);
      expect(component.userName).toBe('test');
    });

    it('should no show Menu', () => {
      component.showMenu = false;
      spyOn(CacheService.prototype, 'getUser').and.callFake(() => null);

      component.initialize();

      expect(component.showMenu).toBe(false);
    });
  });

  describe('logout', () => {
    it('should emit logoutUser', () => {
      const spy = spyOn(mockEventsService.logoutUser, 'emit');

      component.logout(false);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(component.showMenu).toBe(false);
    });
  });
});
