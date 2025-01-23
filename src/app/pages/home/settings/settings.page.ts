import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { FirebaseService } from 'src/app/services/firebase/firebase.service';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  standalone: false,
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  displayName!: string;
  uid!: string;

  constructor(
    private toastController: ToastController,
    private alertController: AlertController,
    private firebaseService: FirebaseService,
    private modalController: ModalController,
    private firestore: AngularFirestore,
    private storage: Storage,
    private router: Router
  ) { }

  /********** all functions on the start the page  **********/
  async ngOnInit() {
    await this.loadUser();
  }

  async ionViewWillEnter() {
    await this.loadUser();
  }

  async loadUser() {
    await this.storage.create();
    const user = await this.storage.get('user');
    if (user) {
      this.displayName = user.displayName;
      this.uid = user.uid;
    } else {
      this.displayName = 'No tiene nombre';
      this.uid = 'No tiene UID';
    }
  }

  /********** Toast and Alert functions **********/
  async alert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK'],
      mode: 'ios'
    });
    await alert.present();
  }

  async toast(message: string, icon: string) {
    const toast = await this.toastController.create({
      message: message,
      mode: 'ios',
      duration: 2000,
      icon: icon
    });
    await toast.present();
  }

  /********** dismiss the modal function **********/
  async dismissModal() {
    try {
      await this.modalController.dismiss();
    } catch (error) {
      console.error(error);
    }
  }

  /********** Copy uid function **********/
  async copyUID() {
    const button = document.getElementById('copyUID') as HTMLButtonElement;
    if (button) {
      button.disabled = true;
      navigator.clipboard.writeText(this.uid);
      this.alert('Copiar UID', 'UID copiado al portapapeles.');
      setTimeout(() => {
        button.disabled = false;
      }, 3000);
    }
  }

  /********** Change password function **********/
  async changePassword() {
    const alert = await this.alertController.create({
      header: 'Reautenticación requerida',
      message: 'Para cambiar tu contraseña, por favor ingresa tu correo electrónico y contraseña actual',
      mode: 'ios',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'Correo electrónico'
        },
        {
          name: 'password',
          type: 'password',
          placeholder: 'Contraseña'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Aceptar',
          handler: async (data) => {
            try {
              await this.firebaseService.reauthenticate(data.email, data.password);
              const newPasswordAlert = await this.alertController.create({
                header: 'Cambiar contraseña',
                message: 'Ingresa tu nueva contraseña, esta será la nueva contraseña asociada a tu cuenta.',
                mode: 'ios',
                inputs: [
                  {
                    name: 'actualPassword',
                    type: 'password',
                    placeholder: 'Contraseña actual'
                  },
                  {
                    name: 'newPassword',
                    type: 'password',
                    placeholder: 'Nueva contraseña'
                  }
                ],
                buttons: [
                  {
                    text: 'Cancelar',
                    role: 'cancel'
                  },
                  {
                    text: 'Aceptar',
                    handler: async (newData) => {

                      if (newData.actualPassword !== data.password) {
                        this.alert('Cambiar contraseña', 'Contraseña actual incorrecta');
                        return;
                      }

                      if (newData.newPassword === data.password) {
                        this.alert('Cambiar contraseña', 'La nueva contraseña no puede ser igual a la actual');
                        return;
                      }

                      const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.\-#*])[A-Za-z\d.\-#*]+$/;

                      if (!passwordPattern.test(newData.newPassword) || /\s/.test(newData.newPassword)) {
                        this.alert('Cambiar contraseña', 'La contraseña como minimo debe tener una miniscula, una mayúscula, un número y un carácter especial.');
                      return;
                      }

                      try {
                        await this.firebaseService.updatePassword(newData.newPassword);
                        this.alert('Cambiar contraseña', 'Contraseña actualizada exitosamente');
                      } catch (error) {
                        this.alert('Cambiar contraseña', 'Hubo un error al cambiar tu contraseña, por favor intenta de nuevo o pide ayuda en soporte');
                      }
                    }
                  }
                ]
              });

              await newPasswordAlert.present();
            } catch (error) {
              this.alert('Autenticación', 'Ha ocurrido un error al autenticar tu cuenta, por favor intenta de nuevo.');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /********** send email to developer for help **********/
  async supportRequests() {
    this.alertController.create({
      header: '¿Necesitas ayuda?',
      message: 'Por favor, mánda un correo a matiasbaxman@gmail.com con tu problema y te respondere lo más pronto posible.',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Enviar correo',
          handler: () => {
            window.open('mailto:matiasbaxman@gmail.com?subject=Soporte%20de%20Inventario&body=Describe%20tu%20problema%20aquí');
          }
        }
      ]
    }).then(alert => alert.present());
  }

  /********** delete account function **********/
  async deleteAccount() {
    const alert = await this.alertController.create({
      header: 'Reautenticación requerida',
      message: 'Para eliminar tu cuenta, por favor ingresa tu correo electrónico y contraseña actual.',
      mode: 'ios',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'Correo electrónico'
        },
        {
          name: 'password',
          type: 'password',
          placeholder: 'Contraseña'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Aceptar',
          handler: async (data) => {
            try {
              await this.firebaseService.reauthenticate(data.email, data.password);
              const confirmAlert = await this.alertController.create({
                header: 'Confirmar eliminación',
                subHeader: '¿Estás seguro?',
                message: 'Esta acción no se puede deshacer y se eliminaran todos tus datos de nuestros archivos. Por favor, escribe "borrar cuenta" para confirmar.',
                mode: 'ios',
                inputs: [
                  {
                    name: 'confirmation',
                    type: 'text',
                    placeholder: 'Escribe "borrar cuenta"'
                  }
                ],
                buttons: [
                  {
                    text: 'Cancelar',
                    role: 'cancel'
                  },
                  {
                    text: 'Aceptar',
                    handler: async (confirmData) => {
                      if (confirmData.confirmation !== 'borrar cuenta' ) {
                        this.alert('Eliminar cuenta', 'Confirmación incorrecta, por favor intentalo de nuevo.');
                        return;
                      } 
                      try {
                        await this.firebaseService.deleteAccount();
                        await this.storage.remove('user');
                        await this.storage.set('sessionID', false);
                        await this.router.navigate(['/login']);
                        this.alert('Eliminar cuenta', 'Cuenta eliminada exitosamente.');
                      } catch (error) {
                        this.alert('Eliminar cuenta', 'Ha ocurrido un error al eliminar tu cuenta, por favor intenta de nuevo.');
                      }
                    }
                  }
                ]
              });

              await confirmAlert.present();
            } catch (error) {
              this.alert('Autenticación', 'Ha ocurrido un error al autenticar tu cuenta, por favor intenta de nuevo.');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /********** logout function **********/
  async logout() {
    this.alertController.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro de cerrar sesión?',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Aceptar',
          handler: () => {
            this.alert('Cerrar sesión', 'Sesión cerrada exitosamente.');
            this.firebaseService.logout();
            this.storage.set('sessionID', false);
            this.storage.remove('user');
            this.router.navigate(['/login']);
          }
        }
      ]
    }).then(alert => alert.present());
  }

}
