import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Network } from '@capacitor/network';

@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  constructor(
    private storage: Storage,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    
    this.checkInternetConnection();
    this.storage.create();
  }

  async checkInternetConnection() {
    const status = await Network.getStatus();
    if (!status.connected) {
      const alert = await this.alertController.create({
        header: 'Inventory',
        message: 'No tienes conexión a internet, por favor revisa tu conexión para utilizar correctamente la aplicación.',
        buttons: [
          {
            text: 'OK',
            role: 'cancel'
          },
          {
            text: 'Actualizar',
            handler: () => {
              window.location.reload();
            }
          }
        ]
      });
      await alert.present();
    }
  }

}
