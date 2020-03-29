import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MainLCDModule } from './main-lcd/main-lcd.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginModule } from './login/login.module';
import { MaterialModule } from './material/material.module';
import { CVMComponentsModule } from './cvm-components/cvm-components.module';
import { CounterLcdModule } from './counter-lcd/counter-lcd.module';
import { ErrorModule } from './error/error.module';
import { AppRoutingModule } from './app-routing/app-routing.module';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    MainLCDModule,
    LoginModule,
    MaterialModule,
    CVMComponentsModule,
    CounterLcdModule,
    BrowserAnimationsModule,
    ErrorModule,
    SharedModule,
  ],
  providers: [RouterModule],
  bootstrap: [AppComponent],
})
export class AppModule { }
