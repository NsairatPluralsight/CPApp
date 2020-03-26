import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CVMComponentsComponent } from './cvm-components.component';
import { EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CVMComponentsService } from './cvm-components.service';
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
import { CommonActionsService } from '../shared/services/common-actions.service';
import { CacheService } from '../shared/services/cache.service';

describe('CVMComponentsComponent', () => {
  let component: CVMComponentsComponent;
  let fixture: ComponentFixture<CVMComponentsComponent>;
  let mockLoggerservice, mockEventsService, mockMultilingualService, mockCommunicationManagerService;

  mockEventsService = {
    statusUpdate: new EventEmitter(),
    languageChanged: new EventEmitter(),
  };

  mockEventsService.statusUpdate = new EventEmitter();
  mockEventsService.languageChanged = new EventEmitter();

  mockMultilingualService = {
    getCaption() { return 'test' }
  };

  let mockRouter = {
    navigate: jasmine.createSpy('navigate')
  };

  let mockRoute = {
    params: jasmine.createSpy('params')
  };

  beforeEach(async(() => {
    mockLoggerservice = jasmine.createSpyObj(['error', 'info']);

    TestBed.configureTestingModule({
      declarations: [ CVMComponentsComponent ],
      providers: [
        CVMComponentsService,
        StateService,
        { provide: Router, useValue: mockRouter},
        { provide: CommunicationManagerService, useValue: mockCommunicationManagerService },
        { provide: LoggerService, useValue: mockLoggerservice },
        { provide: EventsService, useValue: mockEventsService },
        { provide: MultilingualService, useValue: mockMultilingualService },
        { provide: ActivatedRoute, useValue: mockRoute },
        CommonActionsService,
        ChangeDetectorRef,
        MatDialog,
        FormBuilder,
        CacheService,
      ],
      imports: [
        MaterialModule,
        ReactiveFormsModule,
        SharedModule,
        RouterModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CVMComponentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getDevices', () => {

    it('should call get devices', async () => {
      let CVMComponentsServiceSpy = spyOn(CVMComponentsService.prototype, 'getDevices');
      let getColumnNameSpy = spyOn(component, 'getColumnName');

      await component.getDevices(true);

      expect(CVMComponentsServiceSpy).toHaveBeenCalledTimes(1);
      expect(getColumnNameSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('applyFilter', () => {

    it('should call get devices', async () => {
      let getDevicesSpy = spyOn(component, 'getDevices');

      await component.applyFilter('ID');

      expect(getDevicesSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('showError', () => {

    it('should call get getErrorCaption and openDialog', async () => {
      let getErrorCaptionSpy = spyOn(CommonActionsService.prototype, 'getErrorCaption').and.callFake(
        () => {return 'test' });
      let openDialogSpy = spyOn(component, 'openDialog');
      let ngOnInitSpy = spyOn(component, 'ngOnInit');

      await component.showError(-100);

      expect(getErrorCaptionSpy).toHaveBeenCalledTimes(2);
      expect(openDialogSpy).toHaveBeenCalledTimes(2);
    });
  });

});
