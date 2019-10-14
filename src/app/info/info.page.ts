import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { AuthHttpService } from '../auth/auth-http.service';
import { Router, NavigationExtras } from '@angular/router';
import { UserService } from '../provider/user.service';
import { CalendarPopupPage } from '../calendar-popup/calendar-popup.page'
import { AsistenciaPopupPage } from '../asistencia-popup/asistencia-popup.page'
import { CuentaPopupPage } from '../cuenta-popup/cuenta-popup.page'

@Component({
  selector: 'app-info',
  templateUrl: './info.page.html',
  styleUrls: ['./info.page.scss'],
})
export class InfoPage implements OnInit {

  user: any;
  app_version: string;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private httpService: AuthHttpService,
    private zone: NgZone,
    private userService: UserService,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
  ) {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.zone.run(() => {
          this.user = this.router.getCurrentNavigation().extras.state.user;
          this.prepareUser();
        });
      }
      else{
        this.user = this.userService.getUser();
      }
    });
  }

  prepareUser(){

    this.user['bank'].acc_number_fmt = this.user['bank'].acc_number.replace(/[^\dA-Z]/g, '').replace(/(.{4})/g, '$1 ').trim();;

    for (var i = 0; i < this.user['childs'].length; i++) {
      if (this.user['childs'][i].company_id){
        let company_id = this.user['childs'][i].company_id[0];
        if (company_id==1){
          this.user['childs'][i].catering_logo = 'assets/image/perearojas.png';
        }
        else if (company_id==3){
          this.user['childs'][i].catering_logo = 'assets/image/villablanca.png';
        }
        else if (company_id==4){
          this.user['childs'][i].catering_logo = 'assets/image/servicol.png';
        }
      }
    }
  }

  ngOnInit() {
    this.app_version = '1.0.3';
  }

  async cerrarSesion(){
    const alert = await this.alertCtrl.create({
      subHeader: 'Cierre de sesión',
      message: '¿Está seguro que quiere cerrar la sesión?',
      buttons: [
        {
          text: 'Sí',
          handler: () => {
            this.logout();
          }
        },
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
          }
        }
      ],
    });
    alert.present();
  }  
  logout() {
    this.userService.saveUser(null);
    this.router.navigateByUrl('/');
  }

  async openCalendar(child){
    const modal = await this.modalCtrl.create({
      component: CalendarPopupPage,
      componentProps: {
        "child": child,
      }
    });
 
    modal.onDidDismiss().then((data) => {
      if (data !== null) {

      }
    });
 
    return await modal.present();
  }

  openHistorico(child){
    let navigationExtras: NavigationExtras = {
      state: {
        child: child
      }
    };
    this.router.navigate(['historico'], navigationExtras);
  }

  async openAsistencia(child){
    const modal = await this.modalCtrl.create({
      component: AsistenciaPopupPage,
      componentProps: {
        "child": child,
      }
    });
 
    modal.onDidDismiss().then((data) => {
      if (data !== null) {

      }
    });
 
    return await modal.present();
  }

  async editarCuenta(){
    const modal = await this.modalCtrl.create({
      component: CuentaPopupPage,
      componentProps: {
        "user": this.user,
      }
    });
 
    modal.onDidDismiss().then((data) => {
      if (data !== null) {
        this.user = this.userService.getUser();
      }
    });
 
    return await modal.present();
  }


}
