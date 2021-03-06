import { Component, OnInit } from '@angular/core';
import { AuthActions, IAuthAction } from 'ionic-appauth';
import { Router, NavigationExtras } from '@angular/router';
import { NavController, LoadingController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { AuthHttpService } from '../auth/auth-http.service';
import { UserService } from '../provider/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  action: IAuthAction;
  username: string = '';
  password: string = '';
  userInfo : any;
  toast:any;
  loading: any = null;

  constructor( private navCtrl: NavController,
    private httpService : AuthHttpService,
    private router: Router,
    public storage: Storage,    
    public userService : UserService,
    private loadingCtrl: LoadingController,
    public toastCtrl: ToastController,      
    ) {
  }

  ngOnInit() {    
    this.storage.get('user').then((data) => {
      if (data) {
        this.userService.setUser(data);
        this.username = data['username'];
        if (this.username)
          this.username = this.username.toUpperCase();
        this.password = data['password'];
        this.signIn();        
      }
    });
  }

  async presentLoading() {
  
    this.loading = await this.loadingCtrl.create({
      message: 'Cargando..',
      spinner: 'crescent'
    });
    return await this.loading.present();
  }
    
  signInLoading(){
    this.presentLoading();
    this.signIn();
  }
  signIn() {

    this.username = this.username.toUpperCase();

    let param = {
      username: this.username,
      password: this.password
    }
    
    let $this = this;
    this.httpService.request('POST', 'login', param).subscribe(response => {
      if (this.loading)
        this.loadingCtrl.dismiss();      
      if(response['error']) {
        console.error(JSON.stringify(response)); 
        $this.username = '';
        $this.password = '';       
        this.presentToast(response['message']);
      } else {
        console.log('data ' + JSON.stringify(response['data']));
        this.userService.saveUser(response['data']);

        let navigationExtras: NavigationExtras = {
          state: {
            user: this.userService.getUser()
          }
        };
        this.router.navigate(['info'], navigationExtras);
      }      
    });    
  }

  presentToast(msg) {
    this.toast = this.toastCtrl.create({
      message: msg,
      duration: 8000,
      position: 'bottom',
      color: 'danger',
      cssClass:"toast-comedor",
      showCloseButton: true,
      closeButtonText: 'OK',
    }).then((toastData)=>{
      toastData.present();
    });
  }

  hideToast(){
    this.toast = this.toastCtrl.dismiss();
  }

}
