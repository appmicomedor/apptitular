import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { InfoPage } from './info.page';

import { CalendarPopupPageModule } from './../calendar-popup/calendar-popup.module';
import { AsistenciaPopupPageModule } from './../asistencia-popup/asistencia-popup.module';
import { CuentaPopupPageModule } from './../cuenta-popup/cuenta-popup.module';

const routes: Routes = [
  {
    path: '',
    component: InfoPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CalendarPopupPageModule,
    AsistenciaPopupPageModule,
    CuentaPopupPageModule,    
    RouterModule.forChild(routes)
  ],
  declarations: [InfoPage]
})
export class InfoPageModule {}
