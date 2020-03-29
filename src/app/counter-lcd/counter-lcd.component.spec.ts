import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CounterLCDComponent } from './counter-lcd.component';
import { LoggerService } from '../shared/services/logger.service';
import { EventEmitter, ChangeDetectorRef } from '@angular/core';
import { EventsService } from '../shared/services/events.service';
import { MultilingualService } from '../shared/services/multilingual.service';
import { StateService } from '../shared/services/state.service';
import { CounterLCDService } from './counter-lcd.service';
import { CommunicationManagerService } from '../shared/services/communication-manager.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { MaterialModule } from '../material/material.module';
import { SharedModule } from '../shared/shared.module';
import { CounterLCDConfiguration } from '../shared/models/counter-lcd-configuration';

describe('CounterLCDComponent', () => {
  let component: CounterLCDComponent;
  let fixture: ComponentFixture<CounterLCDComponent>;
  let mockLoggerservice;
  let mockEventsService;
  let mockMultilingualService;
  const mockCommunicationManagerService = {};

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

  beforeEach(async(() => {
    mockLoggerservice = jasmine.createSpyObj(['error', 'info']);

    TestBed.configureTestingModule({
      declarations: [CounterLCDComponent],
      providers: [
        CounterLCDService,
        StateService,
        { provide: CommunicationManagerService, useValue: mockCommunicationManagerService },
        { provide: LoggerService, useValue: mockLoggerservice },
        { provide: EventsService, useValue: mockEventsService },
        { provide: MultilingualService, useValue: mockMultilingualService },
        { provide: ActivatedRoute, useValue: mockRouter },
        ChangeDetectorRef,
        MatDialog,
        FormBuilder,
      ],
      imports: [
        MaterialModule,
        ReactiveFormsModule,
        SharedModule,
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CounterLCDComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('fillFormGroup', () => {
    it('should create form group', async () => {
      await component.fillFormGroup(1);

      expect(component.countersForm.get('counter').value).toBe(1);
    });
  });

  describe('identify', () => {
    it('should call identify', async () => {
      const spy = spyOn(CounterLCDService.prototype, 'identify');

      await component.identify();

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('saveConfiguration', () => {
    it('should call setConfiguration', async () => {
      const setConfigurationSpy = spyOn(CounterLCDService.prototype, 'setConfiguration');
      const openDialogSpy = spyOn(component, 'openDialog');
      const fb = new FormBuilder();
      component.countersForm = fb.group({
        counter: [1],
      });
      component.counterLCDConfiguration = new CounterLCDConfiguration(1);
      component.disabled = false;
      component.canEdit = true;

      await component.saveConfiguration();

      expect(setConfigurationSpy).toHaveBeenCalledTimes(1);
      expect(openDialogSpy).toHaveBeenCalledTimes(1);
    });

    it('should not call setConfiguration', async () => {
      const setConfigurationSpy = spyOn(CounterLCDService.prototype, 'setConfiguration');
      const openDialogSpy = spyOn(component, 'openDialog');
      component.disabled = true;
      component.canEdit = false;

      await component.saveConfiguration();

      expect(setConfigurationSpy).toHaveBeenCalledTimes(0);
      expect(openDialogSpy).toHaveBeenCalledTimes(1);
    });
  });
});
