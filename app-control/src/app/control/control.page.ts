import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
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

  toast:any;

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
    public toastCtrl: ToastController,     
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

        // Sort by name
        this.control.sort(function (a, b) {
          let name_a = a['student_name'].normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          let name_b = b['student_name'].normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          if(name_a < name_b) { return -1; }
          if(name_a > name_b) { return 1; }
          return 0;
      });

        let dia = 'dia' + this.date.getDate();


        for (var i = 0; i < this.control.length; i++) {

          this.control[i].asistencia  = this.control[i][dia][1];
          this.control[i].nombre      = this.control[i]['student_name'];
          this.control[i].id          = this.control[i]['id'];

          this.control[i].class = 'asistencia';
          if (this.control[i].asistencia=='A' || this.control[i].asistencia=='J' || this.control[i].asistencia=='F'){
            this.control[i].class += '-' + this.control[i].asistencia;
            if (this.control[i].asistencia == 'A')
              this.control[i].code = 1;
            if (this.control[i].asistencia == 'J')
              this.control[i].code = 3;
            if (this.control[i].asistencia == 'F')
              this.control[i].code = 2;
          }

          //console.log('control ' + JSON.stringify(this.control[i]));
        }
      }
    });
  }

  changeControl(student, index){
    if (student.asistencia=='A' || student.asistencia=='J' || student.asistencia=='F'){

      let daym = this.date.getDate();
      let dayi = 'dia' + String(daym);  
      
      if (student.code==1){
        student.code = 2;
        student.asistencia = 'F';
      }
        
      else if (student.code==2 || student.code==3){
        student.code = 1;
        student.asistencia = 'A';
      }
        
      let param = {
        username: this.userService.getUser().username,
        password: this.userService.getUser().password,
        id: student.id,
        dia: dayi,
        value: student.code,       
      }

      this.httpService.request('POST', 'control-set-day', param).subscribe(response => {

        if (!response['error']) {    
          this.updateStudent(student, index);
          this.presentToast('Cambio efectuado correctamente');
        }
        else {
          this.presentToast('ERROR: el cambio no se ha guardado, consulte con soporte');
        }
      });

    }
  }

  updateStudent(student, i){

    this.control[i].asistencia = student.asistencia;
    this.control[i].code = student.code;
    this.control[i].class = 'asistencia';
    if (this.control[i].asistencia=='A' || this.control[i].asistencia=='J' || this.control[i].asistencia=='F'){
      this.control[i].class += '-' + this.control[i].asistencia + '  md hydrated';
    }
  }

  goBack(){
    this.location.back();
  }

  presentToast(msg) {
    this.toast = this.toastCtrl.create({
      message: msg,
      duration: 2000,
      position: 'bottom'
    }).then((toastData)=>{
      toastData.present();
    });
  }

  hideToast(){
    this.toastCtrl.dismiss();
    this.toast = null;
  }  

}
