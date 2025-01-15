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
  email!: string;
  uid!: string;
  newDisplayName: string = '';

  constructor(
    private toastController: ToastController,
    private alertController: AlertController,
    private firebaseService: FirebaseService,
    private modalController: ModalController,
    private firestore: AngularFirestore,
    private storage: Storage,
    private router: Router
  ) { }

  async ngOnInit() {
    await this.loadUser();
    this.newDisplayName = this.displayName;
  }

  async ionViewWillEnter() {
    await this.loadUser();
  }

  async loadUser() {
    await this.storage.create();
    const user = await this.storage.get('user');
    if (user) {
      this.displayName = user.displayName;
      this.email = user.email;
      this.uid = user.uid;
    } else {
      this.displayName = 'Unkown';
      this.email = 'Unkown';
      this.uid = 'Unkown';
    }
  }

  async dismissModal() {
    try {
      await this.modalController.dismiss();
      console.log('Modal dismissed');
      this.newDisplayName = this.displayName;
    } catch (error) {
      console.error('Error dismissing modal:', error);
    }
  }

  //

  async saveChanges(){

    if (this.newDisplayName === '') {
      await this.alertController.create({
        header: 'Editar perfil',
        message: 'Por favor, ingresa un nombre válido',
        buttons: ['OK']
      }).then(alert => alert.present());
    } else if (/[@.,;{}[\]]/.test(this.newDisplayName)) {
      await this.alertController.create({
        header: 'Editar perfil',
        message: 'El nombre no puede contener caracteres especiales',
        buttons: ['OK']
      }).then(alert => alert.present());
    } else {
      
      await this.firebaseService.updateName(this.newDisplayName);

      await this.firestore.collection('users').doc(this.uid).update({
        displayName: this.newDisplayName,
      });

      await this.storage.set('user', {
        displayName: this.newDisplayName,
        email: this.email,
        uid: this.uid
      });

      this.displayName = this.newDisplayName;
      
      this.dismissModal();

      await this.toastController.create({
        message: 'Cambios guardados exitosamente',
        duration: 2000,
        icon: 'checkmark',
        position: 'bottom',
        positionAnchor: 'version',
        color: 'dark',
        mode: 'ios'
      }).then(toast => toast.present());

    }

  }

  //

  async copyUID() {
    const button = document.getElementById('copyUID') as HTMLButtonElement;
    if (button) {
      button.disabled = true;
      navigator.clipboard.writeText(this.uid);
      this.toastController.create({
        message: 'UID copiado al portapapeles',
        duration: 2000,
        icon: 'clipboard',
        positionAnchor: 'version',
        color: 'dark',
        mode: 'ios'
      }).then(toast => toast.present());
      setTimeout(() => {
        button.disabled = false;
      }, 3000);
    }
  }

  async changePassword() {
    const alert = await this.alertController.create({
      header: 'Reautenticación requerida',
      message: 'Para cambiar tu contraseña, por favor ingresa tu correo electrónico y contraseña actual',
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
                        await this.alertController.create({
                          header: 'Cambiar contraseña',
                          message: 'Tu contraseña actual no coincide con la ingresada, por favor intentalo de nuevo',
                          buttons: ['OK']
                        }).then(alert => alert.present());
                        return;
                      }

                      if (newData.newPassword === data.password) {
                        await this.alertController.create({
                          header: 'Cambiar contraseña',
                          message: 'La nueva contraseña no puede ser igual a la actual, por favor intentalo de nuevo',
                          buttons: ['OK']
                        }).then(alert => alert.present());
                        return;
                      }

                      const passwordPattern = /^(?=.*\d)(?=.*[A-Z])(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;

                      if (!passwordPattern.test(newData.newPassword) || /\s/.test(newData.newPassword)) {
                      await this.alertController.create({
                        header: 'Cambiar contraseña',
                        message: 'Tu contraseña nueva debe tener al menos 8 caracteres, una mayúscula, un número, un carácter especial y no debe contener espacios.',
                        buttons: ['OK']
                      }).then(alert => alert.present());
                      return;
                      }

                      try {
                        await this.firebaseService.updatePassword(newData.newPassword);
                        await this.toastController.create({
                          message: 'Contraseña cambiada exitosamente',
                          duration: 2000,
                          icon: 'key-outline',
                          color: 'dark',
                          positionAnchor: 'version',
                          mode: 'ios'
                        }).then(toast => toast.present());
                      } catch (error) {
                        await this.alertController.create({
                          header: 'Cambiar contraseña',
                          message: 'Hubo un error al cambiar tu contraseña, por favor intenta de nuevo o pide ayuda en soporte',
                          buttons: ['OK']
                        }).then(alert => alert.present());
                      }
                    }
                  }
                ]
              });

              await newPasswordAlert.present();
            } catch (error) {
              await this.alertController.create({
                header: 'Autenficación fallida',
                message: 'Correo electrónico o contraseña incorrectos',
                buttons: ['OK']
              }).then(alert => alert.present());
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async supportRequests() {
    this.alertController.create({
      header: '¿Necesitas ayuda?',
      message: 'Por favor, mánda un correo a matiasbaxman@gmail.com con tu problema y te respondere lo más pronto posible.',
      buttons: [
        {
          text: 'Enviar correo',
          handler: () => {
            window.open('mailto:inventory@gmail.com?subject=Soporte%20de%20Inventario&body=Describe%20tu%20problema%20aquí');
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    }).then(alert => alert.present());
  }

  async deleteAccount() {
    const alert = await this.alertController.create({
      header: 'Reautenticación requerida',
      message: 'Para eliminar tu cuenta, por favor ingresa tu correo electrónico y contraseña actual.',
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
                      if (confirmData.confirmation !== 'borrar cuenta') {
                        await this.alertController.create({
                          header: 'Error',
                          message: 'Debes escribir "borrar cuenta" para confirmar la eliminación.',
                          buttons: ['OK']
                        }).then(alert => alert.present());
                        return;
                      }
                      try {
                        await this.firebaseService.deleteAccount();
                        await this.storage.remove('user');
                        await this.storage.set('sessionID', false);
                        await this.router.navigate(['/login']);
                        await this.toastController.create({
                          message: 'Cuenta eliminada exitosamente, lamentamos verte ir',
                          duration: 4000,
                          icon: 'trash-outline',
                          color: 'dark',
                          mode: 'ios'
                        }).then(toast => toast.present());
                      } catch (error) {
                        await this.alertController.create({
                          header: 'Error',
                          message: 'Error al eliminar la cuenta',
                          buttons: ['OK']
                        }).then(alert => alert.present());
                      }
                    }
                  }
                ]
              });

              await confirmAlert.present();
            } catch (error) {
              await this.alertController.create({
                header: 'Autenticación fallida',
                message: 'Correo electrónico o contraseña incorrectos',
                buttons: ['OK']
              }).then(alert => alert.present());
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async logout() {
    this.alertController.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro de cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Aceptar',
          handler: () => {
            this.toastController.create({
              message: 'Sesión cerrada exitosamente',
              duration: 2000,
              icon: 'log-out',
              color: 'dark',
              mode: 'ios'
            }).then(toast => toast.present());
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
