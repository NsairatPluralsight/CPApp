import { TestBed } from '@angular/core/testing';
import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  let service: LoggerService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoggerService],
    });
    service = TestBed.get(LoggerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call error method', () => {
    const spy = spyOn(service, 'error');

    service.error(new Error('test'));

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
