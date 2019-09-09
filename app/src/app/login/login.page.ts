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
  username: string;
  password: string;
  userInfo : any;
  toast:any;

  constructor( private navCtrl: NavController,
    private httpService : AuthHttpService,
    private router: Router,
    public storage: Storage,    
    private userService : UserService,
    private loadingCtrl: LoadingController,
    public toastCtrl: ToastController,      
    ) {
  }

  ngOnInit() {
    this.storage.get('user').then((data) => {
      if (data) {
        this.userService.setUser(data);
        this.username = data['username'];
        this.password = data['password'];
        this.signIn();        
      }
    });
  }

  async presentLoading() {
  
    const loadingElement = await this.loadingCtrl.create({
      message: 'Cargando..',
      spinner: 'crescent'
    });
    return await loadingElement.present();
  }
    
  signIn() {
    this.presentLoading();

    let param = {
      username: this.username,
      password: this.password
    }
    
    this.httpService.request('POST', 'login', param).subscribe(response => {
      this.loadingCtrl.dismiss();      
      if(response['error']){
        this.presentToast(response['message']);
      }else{
        //console.log('data ' + JSON.stringify(response['data']));
        this.userService.saveUser(response['data']);
        this.router.navigateByUrl('/info');
      }      
    });    
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
    this.toast = this.toastCtrl.dismiss();
  }

}
