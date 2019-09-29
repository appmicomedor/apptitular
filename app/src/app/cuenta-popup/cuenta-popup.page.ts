import { Component, OnInit, Input } from '@angular/core';
import { ModalController, LoadingController, ToastController, AlertController } from '@ionic/angular';
import { CalendarComponentOptions, DayConfig } from "ion4-calendar";
import { UtilService } from '../provider/util.service';
import { AuthHttpService } from '../auth/auth-http.service';
import { UserService } from '../provider/user.service';

@Component({
  selector: 'app-cuenta-popup',
  templateUrl: './cuenta-popup.page.html',
  styleUrls: ['./cuenta-popup.page.scss'],
})
export class CuentaPopupPage implements OnInit {
  
  @Input() user: any;

  loadingModal: any;
  data: any;

  toast:any;

  input1: string ='';
  input2: string ='';  
  input3: string ='';  
  input4: string ='';  
  input5: string ='';  
  input6: string ='';    

  constructor(
    private modalController: ModalController,
    private loadingCtrl: LoadingController,    
    private utilService: UtilService,
    private httpService : AuthHttpService, 
    public toastCtrl: ToastController,    
    private alertCtrl: AlertController,  
    private userService: UserService,      
  ) { 
     
  
  }
 
  ngOnInit() {  
    console.log('user ' + JSON.stringify(this.user));
  }
 
  async closeModal() {
    const onClosedData: string = "Wrapped Up!";
    await this.modalController.dismiss(onClosedData);
  }

 
  accept() 
  {
    if (this.input1.length!=4 && this.input2.length!=4 && this.input3.length!=4 &&
        this.input4.length!=4 && this.input5.length!=4 && this.input6.length!=4){
          this.presentToast('Faltan números en su cuenta bancaria, por favor revíselo');
        }
    else{

      this.user['bank'].acc_number = this.input1+this.input2+this.input3+this.input4+this.input5+this.input6;

      // Guardamos nueva cuenta
      let param = {
        id:  this.user['bank'].id,
        acc_number: this.user['bank'].acc_number,
      }
  
      this.data = null;
      this.httpService.request('POST', 'save_bank', param).subscribe(response => {
  
        console.log('response ' + JSON.stringify(response));
        if (!response['error']) {    
          this.user['bank'].acc_number_fmt = this.user['bank'].acc_number.replace(/[^\dA-Z]/g, '').replace(/(.{4})/g, '$1 ').trim();      
          this.userService.saveUser(this.user);
        }
        else {
          this.presentToast('No se ha podido modificar su cuenta bancaria, inténtelo más tarde o contacte con soporte');
        }
      });





      this.closeModal();
    }
  }

  async presentLoading() {
  
    const loadingElement = await this.loadingCtrl.create({
      message: 'Cargando..',
      spinner: 'crescent'
    });
    return await loadingElement.present();
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
 