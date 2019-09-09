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
    private userService: UserService,
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
          if (this.historico[i].value==1)
            this.historico[i].status = 'Sí asiste';

          else if (this.historico[i].value==3)
            this.historico[i].status = 'No asiste';

          // Convert UTC to GMT    
          this.historico[i].dateFmt       = this.utilService.presentDate(this.historico[i].date);   
          this.historico[i].createdAtFmt  = this.utilService.formatDateTime(this.historico[i].createdAt); 

        }
      }
    });
  }

  goBack(){
    this.location.back();
  }

}
