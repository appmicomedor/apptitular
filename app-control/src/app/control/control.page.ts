import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { AuthHttpService } from '../auth/auth-http.service';
import { Router, NavigationExtras } from '@angular/router';
import { Location } from '@angular/common';
import { UserService } from '../provider/user.service';
import { UtilService } from '../provider/util.service';

@Component({
  selector: 'app-control',
  templateUrl: './control.page.html',
  styleUrls: ['./control.page.scss'],
})
export class ControlPage implements OnInit {

  school: any;
  date: Date;
  dateFmt: string;

  control: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private httpService: AuthHttpService,
    private zone: NgZone,
    private userService: UserService,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private location: Location,
    private utilService: UtilService,    
  ) {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.zone.run(() => {
          this.school   = this.router.getCurrentNavigation().extras.state.school;
          this.date     = this.router.getCurrentNavigation().extras.state.date;
          this.dateFmt  = this.router.getCurrentNavigation().extras.state.dateFmt;

          this.getControl();
        });
      }
    });
  }

  ngOnInit() {

  }

  getControl(){
    /*
    let param = {
      childId: this.child.id,
    }

    this.httpService.request('POST', 'get_control', param).subscribe(response => {
      
      if (!response['error']) {   
        this.control = response['data'];

        for (var i = 0; i < this.control.length; i++) {
          let json = JSON.parse(this.control[i].value);
          // Convert UTC to GMT                
          this.control[i].createdAtFmt  = this.utilService.formatDateTime(this.control[i].createdAt); 

          if (this.control[i].tipo==0){
            if (json.value==1)
              this.control[i].status = 'Sí asiste';

            else if (json.value==3)
              this.control[i].status = 'No asiste';

            this.control[i].dateFmt       = this.utilService.presentDate(this.control[i].date);                 
          }
          else if (this.control[i].tipo==1){
            if (json.y_ise_factura_aut){
              this.control[i].status = 'Semana completa';
            }
            else if (json.y_ise_s){
              this.control[i].status = 'Esporádico';
            }
            else {
              this.control[i].status = 'Por días: ';  
              if (json.y_ise_l) this.control[i].status += 'Lunes ';
              if (json.y_ise_m) this.control[i].status += 'Martes ';
              if (json.y_ise_x) this.control[i].status += 'Miércoles ';
              if (json.y_ise_j) this.control[i].status += 'Jueves ';
              if (json.y_ise_v) this.control[i].status += 'Viernes ';
            }
          }
        }
      }
    });*/
  }

  goBack(){
    this.location.back();
  }
}
