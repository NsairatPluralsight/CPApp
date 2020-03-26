import { MainLCDModule } from './main-lcd.module';

describe('MainLCDModule', () => {
  let mainLCDModule: MainLCDModule;

  beforeEach(() => {
    mainLCDModule = new MainLCDModule();
  });

  it('should create an instance', () => {
    expect(mainLCDModule).toBeTruthy();
  });
});
