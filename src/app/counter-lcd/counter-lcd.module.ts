import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CounterLCDComponent } from './counter-lcd.component';
import { CounterLCDService } from './counter-lcd.service';
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../material/material.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [CounterLCDComponent],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  providers: [CounterLCDService]
})
export class CounterLcdModule { }
