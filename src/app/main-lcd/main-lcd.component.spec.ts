import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MainLCDComponent } from './main-lcd.component';
import { EventEmitter, ChangeDetectorRef } from '@angular/core';
import { MainLCDService } from './services/main-lcd.service';
import { StateService } from '../shared/services/state.service';
import { CommunicationManagerService } from '../shared/services/communication-manager.service';
import { LoggerService } from '../shared/services/logger.service';
import { EventsService } from '../shared/services/events.service';
import { MultilingualService } from '../shared/services/multilingual.service';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';
import { SharedModule } from '../shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonActionsService } from '../shared/services/common-actions.service';
import { RouterTestingModule } from '@angular/router/testing';
import { CacheService } from '../shared/services/cache.service';
import { MainLCDDisplayMode, CountersOption } from '../shared/models/enum';
import { NumberValidators } from '../shared/models/number.validator';

describe('MainLCDConfigurationComponent', () => {
  let component: MainLCDComponent;
  let fixture: ComponentFixture<MainLCDComponent>;
  let mockLoggerservice;
  let mockEventsService;
  let mockMultilingualService;
  const mockCommunicationManagerService = {};
  const formBuilder: FormBuilder = new FormBuilder();

  mockEventsService = {
    statusUpdate: new EventEmitter(),
    languageChanged: new EventEmitter(),
  };
  mockEventsService.statusUpdate = new EventEmitter();
  mockEventsService.languageChanged = new EventEmitter();
  mockMultilingualService = {
    getCaption() { return 'test'; },
  };
  const mockRouter = {
    params: jasmine.createSpy('navigate'),
  };
  const mockRoute = {
    params: jasmine.createSpy('subscribe'),
  };

  beforeEach(async(() => {
    mockLoggerservice = jasmine.createSpyObj(['error', 'info']);
    TestBed.configureTestingModule({
      declarations: [ MainLCDComponent ],
      providers: [
        MainLCDService,
        StateService,
        CommonActionsService,
        { provide: CommunicationManagerService, useValue: mockCommunicationManagerService },
        { provide: LoggerService, useValue: mockLoggerservice },
        { provide: EventsService, useValue: mockEventsService },
        { provide: MultilingualService, useValue: mockMultilingualService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockRoute },
        ChangeDetectorRef,
        MatDialog,
        FormBuilder,
        CacheService,
      ],
      imports: [
        MaterialModule,
        ReactiveFormsModule,
        SharedModule,
        RouterTestingModule,
        BrowserAnimationsModule,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainLCDComponent);
    component = fixture.componentInstance;
    component.mainLCDForm = formBuilder.group({
      waiteTime: [30, NumberValidators.range(5, 300)],
      pageDuration: [10, NumberValidators.range(5, 300)],
      countersValue: [CountersOption.All],
      playerMode: [MainLCDDisplayMode.CurrentCustomer],
      servicesValue: [true],
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('showError', () => {
    it('should call get getErrorCaption and openDialog', async () => {
      const getErrorCaptionSpy = spyOn(CommonActionsService.prototype, 'getErrorCaption').and.callFake(
        () => 'test');
      const openDialogSpy = spyOn(component, 'openDialog');

      await component.showError(-100);

      expect(getErrorCaptionSpy).toHaveBeenCalledTimes(1);
      expect(openDialogSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('getPermition', () => {
    it('should call check per', () => {
      const spy = spyOn(CommonActionsService.prototype, 'checkPermission');

      component.getPermition();

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('identify', () => {
    it('should call identify', async () => {
      const spy = spyOn(MainLCDService.prototype, 'identify');

      await component.identify();

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
