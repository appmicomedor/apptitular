import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { AuthHttpService } from '../auth/auth-http.service';
import { Router, NavigationExtras } from '@angular/router';
import { Location } from '@angular/common';
import { UserService } from '../provider/user.service';
import { UtilService } from '../provider/util.service';

@Component({
  selector: 'app-historico',
  templateUrl: './historico.page.html',
  styleUrls: ['./historico.page.scss'],
})
export class HistoricoPage implements OnInit {

  child: any;
  historico: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private httpService: AuthHttpService,
    private zone: NgZone,
    public userService: UserService,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private location: Location,
    private utilService: UtilService,    
  ) {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.zone.run(() => {
          this.child = this.router.getCurrentNavigation().extras.state.child;
          this.getHistorico();
        });
      }
    });
  }

  ngOnInit() {

  }

  getHistorico(){
    let param = {
      childId: this.child.id,
    }

    this.httpService.request('POST', 'get_historico', param).subscribe(response => {
      
      if (!response['error']) {   
        this.historico = response['data'];

        for (var i = 0; i < this.historico.length; i++) {
          let json = JSON.parse(this.historico[i].value);
          // Convert UTC to GMT                
          this.historico[i].createdAtFmt  = this.utilService.formatDateTime(this.historico[i].createdAt); 

          if (this.historico[i].tipo==0){
            if (json.value==1)
              this.historico[i].status = 'Sí asiste';

            else if (json.value==3)
              this.historico[i].status = 'No asiste';

            this.historico[i].dateFmt       = this.utilService.presentDate(this.historico[i].date);                 
          }
          else if (this.historico[i].tipo==1){
            if (json.y_ise_factura_aut){
              this.historico[i].status = 'Semana completa';
            }
            else if (json.y_ise_s){
              this.historico[i].status = 'Esporádico';
            }
            else {
              this.historico[i].status = 'Por días: ';  
              if (json.y_ise_l) this.historico[i].status += 'Lunes ';
              if (json.y_ise_m) this.historico[i].status += 'Martes ';
              if (json.y_ise_x) this.historico[i].status += 'Miércoles ';
              if (json.y_ise_j) this.historico[i].status += 'Jueves ';
              if (json.y_ise_v) this.historico[i].status += 'Viernes ';
            }
          }
        }
      }
    });
  }

  goBack(){
    this.location.back();
  }

}
