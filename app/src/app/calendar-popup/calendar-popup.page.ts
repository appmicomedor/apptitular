import { Component, OnInit, Input } from '@angular/core';
import { ModalController, LoadingController, ToastController, AlertController } from '@ionic/angular';
import { CalendarComponentOptions, DayConfig } from "ion4-calendar";
import { UtilService } from '../provider/util.service';
import { AuthHttpService } from '../auth/auth-http.service';
import { UserService } from '../provider/user.service';

@Component({
  selector: 'app-calendar-popup',
  templateUrl: './calendar-popup.page.html',
  styleUrls: ['./calendar-popup.page.scss'],
})
export class CalendarPopupPage implements OnInit {
  
  @Input() child: any;

  loadingModal: any;

  date: Date;
  type: 'string';
  dateFmt: string;
  dateYMD: string;

  mode: string;
  categoryID: any;
  auctionID: any;

  daysConfig: DayConfig[];
  data: any;

  status: string = '';
  code: number = 0;

  odoo_id: number;
  server_time: any;

  optionsRange: CalendarComponentOptions = {
      from: new Date(2018, 0, 1),
      to: 0,
      pickMode: 'single',
      showMonthPicker: true,
      monthPickerFormat: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      weekdays: ['Domin', 'Lun', 'Mar', 'Mié', 'Jue', 'Viernes', 'Sáb'],
      weekStart: 1,
      daysConfig: []
  };

  toast:any;

  preaviso: number = -1;
  can_modify: boolean = false;

  constructor(
    private modalController: ModalController,
    private loadingCtrl: LoadingController,    
    private utilService: UtilService,
    private httpService : AuthHttpService, 
    public toastCtrl: ToastController,    
    private alertCtrl: AlertController,  
    private userService: UserService,      
  ) { 
    this.date = new Date();
    this.dateYMD = this.utilService.formatYMD(this.date);
    this.dateFmt = this.utilService.presentDate(this.date);

    this.daysConfig = [];   
     
  
  }
 
  ngOnInit() {  
    this.getPreaviso();
  }
 
  async closeModal() {
    const onClosedData: string = "Wrapped Up!";
    await this.modalController.dismiss(onClosedData);
  }

  onChange($event) 
  {
    this.date = new Date(this.dateYMD);
    this.date.setHours(14);
    
    this.dateFmt = this.utilService.presentDate(this.date);

    this.calcStatus();
  }

  onMonthChange(data) 
  {
    this.getDaysConfig(data.newMonth.years, data.newMonth.months);
 
  }

  calcStatus(){
    this.status = '';    
    this.code = 0;
    if (this.data==null)
      return;

    let daym = this.date.getDate();
    let dayi = 'dia' + String(daym);
    if (this.data[dayi].length == 2) {
      let letter = this.data[dayi][1];
      if (letter=='A'){
        this.status = 'Sí asiste';
        this.code = 1;
      }
      else if (letter=='J'){
        this.status = 'No asiste';
        this.code = 3;
      }
    }

    //let now = new Date();
    let h = this.server_time.getHours();
    let extraday = 0;
    if (h>=10)
      extraday = 1;

    let days_preaviso = this.preaviso + extraday;

    let dif_days  = ((Date.UTC(this.date.getFullYear(), this.date.getMonth(), this.date.getDate()) - Date.UTC(this.server_time.getFullYear(), this.server_time.getMonth(), this.server_time.getDate()) ) /(1000 * 60 * 60 * 24));
  

    console.log(days_preaviso + ' > ' + dif_days);


    if (days_preaviso>dif_days)
      this.can_modify = false;
    else  
      this.can_modify = true;

      console.log('can_modify ' + this.can_modify);      
      console.log('h ' + h);      
      console.log('this.preaviso ' + this.preaviso);      
  }



  accept() 
  {
    this.date = new Date(this.dateYMD);  

    //this.modalController.dismiss({date: new Date(this.date)});
  }

  async presentLoading() {
  
    const loadingElement = await this.loadingCtrl.create({
      message: 'Cargando..',
      spinner: 'crescent'
    });
    return await loadingElement.present();
  }

  getDaysConfig(year, month) 
  {
    if (this.toast)
      this.hideToast();
    this.presentLoading();

     this.daysConfig = [];

    let days = this.utilService.getDaysInMonth(month-1, year);
    for (var d = 0; d < days.length; d++) {
      let dayConfig = {
          date: days[d],
          disable: true
      };
      this.daysConfig.push(dayConfig);
    }

    let days_prev = this.utilService.getPrevDays(days[0]);
    for (var d = 0; d < days_prev.length; d++) {
      let dayConfig = {
          date: days_prev[d],
          disable: true
      };
      this.daysConfig.push(dayConfig);
    }

    let days_next = this.utilService.getNextDays(days[days.length-1]);
    for (var d = 0; d < days_next.length; d++) {
      let dayConfig = {
          date: days_next[d],
          disable: true
      };
      this.daysConfig.push(dayConfig);
    }

    let param = {
      student_id: this.child.id,
      year: year,
      month: month
    }

    let $this = this;
    this.data = null;
    this.httpService.request('POST', 'get_month', param).subscribe(response => {

      if (!response['error']) {

        this.data = response['data'][0];
        this.odoo_id = response['id'];
        this.server_time = new Date(response['time']);

        //console.log('this.odoo_id  ' + JSON.stringify(this.odoo_id));
        //console.log('this.data  ' + JSON.stringify(this.data));

        for (let i = 0; i < days.length; i++) {
          let dayi = 'dia' + String(i + 1);

          if (this.data[dayi].length == 2) {
            let letter = this.data[dayi][1];
            if(letter!='S' || letter!='D')
              $this.daysConfig[i].disable = false;

            if(letter=='A' || letter=='J'){

              if (letter=='A')
                $this.daysConfig[i].subTitle = 'sí';
              else if (letter=='J')
                $this.daysConfig[i].subTitle = 'no';
            //$this.daysConfig[i].marked = true;
            }
          }
        }

        $this.optionsRange = {
          from: new Date(2018, 0, 1),
          to: 0,
          pickMode: 'single',
          showMonthPicker: true,
          monthPickerFormat: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
          weekdays: ['Domin', 'Lun', 'Mar', 'Mié', 'Jue', 'Viernes', 'Sáb'],
          weekStart: 1,
          daysConfig: $this.daysConfig
        };

        this.calcStatus();   
        this.loadingCtrl.dismiss();              
      }
      else {
        this.loadingCtrl.dismiss(); 
        this.presentToast('El calendario de asistencia para el mes seleccionado no está abierto.');
      }
     
    });   
  }

  getPreaviso(){

    if (!this.child.active_school_id || this.child.active_school_id.length==0){
      this.preaviso = 0;
      this.getDaysConfig(this.date.getFullYear(), this.date.getMonth() + 1);
      return;
    }

    let param = {
      school_id:  this.child.active_school_id[0],
    }

    let $this = this;
    this.data = null;
    this.httpService.request('POST', 'get_preaviso', param).subscribe(response => {

      if (!response['error']) {    
        let temp = response['data'][0];
        $this.preaviso = temp.preaviso;
      }
      else {
        $this.preaviso = 0;
      }

      $this.getDaysConfig($this.date.getFullYear(), $this.date.getMonth() + 1);

    });
  }  

  async changeDay(){
    var msg = '';
    if (this.code==1)
      msg = '¿Está seguro que quiere anular la asistencia al comedor para el día seleccionado?';
    else if (this.code==3)
      msg = '¿Está seguro que quiere confirmar la asistencia al comedor para el día seleccionado?';

    const alert = await this.alertCtrl.create({
      subHeader: 'Cambiar asistencia',
      message: msg,
      buttons: [
        {
          text: 'Sí',
          handler: () => {
            this.changeDayYes();
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

  changeDayYes(){
    if (this.data==null)
      return;

    let daym = this.date.getDate();
    let dayi = 'dia' + String(daym);  
    
    if (this.code==1)
      this.code = 3;
    else if  (this.code==3)
      this.code = 1;

    let user = this.userService.getUser();

    let param = {
      id:  this.data.id,
      dia: dayi,
      value: this.code,
      userId: user.db_id,
      parentId: user.id,
      childId: this.child.id,
      date: this.date,
      titular: user.name,
    }

    this.data = null;
    this.httpService.request('POST', 'set_day', param).subscribe(response => {

      if (!response['error']) {    
        this.getDaysConfig(this.date.getFullYear(), this.date.getMonth() + 1); 
      }
      else {
        this.presentToast('No se ha podido modificar el calendario, inténtelo más tarde o contacte con soporte');
      }
    });

    //console.log('change ' + dayi + '-' + (this.date.getMonth()+1) + '-'  + this.date.getFullYear());
  }

  presentToast(msg) {
    this.toast = this.toastCtrl.create({
      message: msg,
      duration: 5000,
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
 