import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { AuthHttpService } from '../auth/auth-http.service';
import { Router, NavigationExtras } from '@angular/router';
import { UserService } from '../provider/user.service';
import { CalendarPopupPage } from '../calendar-popup/calendar-popup.page'

@Component({
  selector: 'app-info',
  templateUrl: './info.page.html',
  styleUrls: ['./info.page.scss'],
})
export class InfoPage implements OnInit {

  user: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private httpService: AuthHttpService,
    private zone: NgZone,
    private userService: UserService,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
  ) {
    this.user = this.userService.getUser();
  }

  ngOnInit() {

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
}
