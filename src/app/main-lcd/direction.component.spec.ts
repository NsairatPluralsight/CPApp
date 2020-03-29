import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DirectionComponent } from './direction.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MaterialModule } from '../material/material.module';
import { LoggerService } from '../shared/services/logger.service';
import { MultilingualService } from '../shared/services/multilingual.service';

describe('DirectionComponent', () => {
  let component: DirectionComponent;
  let fixture: ComponentFixture<DirectionComponent>;
  let mockLoggerservice;
  let mockMultilingualService;

  mockMultilingualService = {
    getCaption() { return 'test'; },
  };

  beforeEach(async(() => {
    mockLoggerservice = jasmine.createSpyObj(['error', 'info']);
    TestBed.configureTestingModule({
      declarations: [ DirectionComponent ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: LoggerService, useValue: mockLoggerservice },
        { provide: MultilingualService, useValue: mockMultilingualService },
      ],
      imports: [MaterialModule],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DirectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
