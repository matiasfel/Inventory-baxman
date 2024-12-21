import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/app/services/localStorage/storage.service';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(private storageService : StorageService ) {

  }

  ngOnInit() {
    this.storageService.set('session', false);
    this.storageService.get('session').then((data) => {
      console.log('data = ', data);
    });
  }

  loginForm(){
    console.log('loginForm = TRUE');
  }

}
