import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
@Injectable({
  providedIn: 'root'
})
export class UserService {

  user = null;
  isAuth: boolean = false;

  constructor(public storage: Storage) {

  }

  saveUser(data) {
    this.user = data;
    this.storage.set('user', this.user);
    if (data)
      this.isAuth = true;
    else 
      this.isAuth = false;
  }

  setUser(user) {
    this.user = user;
  }

  getUser() {
    return this.user;
  }

  isAuthenticated() {
    return this.isAuth;
  }
}
