import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { LocationListComponent } from './locations/locations.component';
import { AppRoutingModule } from './app-routing.module';
import { TSPComponent } from './tsp/tsp.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LocationListComponent,
    TSPComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
