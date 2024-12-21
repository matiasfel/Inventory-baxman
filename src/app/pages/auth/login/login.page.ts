import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  username: string = "";
  password: string = "";

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private storage: Storage,
    private router: Router
  ) {}

  ngOnInit() {
    this.storage.create()
    this.storage.set('sessionActive', false);
  }

  async toastSuccessfull(message: string, duration: number) {
    const toast = await this.toastController.create({
      message: message,
      duration: duration
    });
    toast.present();
  }

  async alertError(message: string) {
    const alert = await this.alertController.create({
      header: 'Inicio de sesión',
      message: message,
      buttons: ['OK']
    });
  
    await alert.present();
  }

  async loginForm() {
    console.log('loginForm is working');

    if (this.username === '' || this.password === '') {
      this.alertError("Debes completar todos los campos");
      return; 
    }
    
    if (this.username === 'test' && this.password === '1234') {
      this.toastSuccessfull('Login successful', 2000);
      this.router.navigate(['/dashboard']);
    } else {
      this.alertError("Credenciales invalidas o incorrectas");
    }

  }

}
