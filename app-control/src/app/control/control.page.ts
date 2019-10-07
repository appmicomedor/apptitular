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
    
    let param = {
      username: this.userService.getUser().username,
      password: this.userService.getUser().password,
      school_id: this.school.id,
      year: this.date.getFullYear(), 
      month: this.date.getMonth() + 1,
      day: this.date.getDate(),
    }

    this.httpService.request('POST', 'control-get-school', param).subscribe(response => {
    
      if (!response['error']) {   
        this.control = response['data'];
        let dia = 'dia' + this.date.getDate();
        for (var i = 0; i < this.control.length; i++) {
          var names = this.control[i]['student_id'][1].split(',');
          this.control[i].asistencia  = this.control[i][dia][1];
          this.control[i].nombre      = names[2]+ ', ' + names[3];
          this.control[i].id          = this.control[i]['student_id'][0];

          this.control[i].class = 'asistencia';
          if (this.control[i].asistencia=='A' || this.control[i].asistencia=='J' || this.control[i].asistencia=='F')
            this.control[i].class += '-' + this.control[i].asistencia;

        }
      }
    });
  }

  goBack(){
    this.location.back();
  }
}
