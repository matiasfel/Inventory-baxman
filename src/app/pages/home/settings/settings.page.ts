import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { FirebaseService } from 'src/app/services/firebase/firebase.service';
import { Router } from '@angular/router';

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

  constructor(
    private toastController: ToastController,
    private alertController: AlertController,
    private firebaseService: FirebaseService,
    private storage: Storage,
    private router: Router
  ) { }

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
      this.email = user.email;
      this.uid = user.uid;
    } else {
      this.displayName = 'Unkown';
      this.email = 'Unkown';
      this.uid = 'Unkown';
    }
  }

  copyUID() {
    navigator.clipboard.writeText(this.uid);
    this.toastController.create({
      message: 'UID copiado al portapapeles',
      duration: 2000,
      icon: 'clipboard'
    }).then(toast => toast.present());
  }

  async changeEmail() {
    const alert = await this.alertController.create({
      header: 'Reautenticación requerida',
      message: 'Para cambiar tu correo electrónico, necesitamos que ingreses tu correo y contraseña actual.',
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
              const newEmailAlert = await this.alertController.create({
                header: 'Cambiar correo electrónico',
                message: 'Ingresa tu nuevo correo electrónico, este será el nuevo correo asociado a tu cuenta.',
                inputs: [
                  {
                    name: 'newEmail',
                    type: 'email',
                    placeholder: 'Nuevo correo electrónico'
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
                      if (newData.newEmail === this.email) {
                        await this.alertController.create({
                          header: 'Cambiar correo electrónico',
                          message: 'El nuevo correo electrónico no puede ser igual al actual',
                          buttons: ['OK']
                        }).then(alert => alert.present());
                        return;
                      }
                      try {
                        await this.firebaseService.updateEmail(newData.newEmail);
                        await this.storage.set('user', {
                          uid: this.uid,
                          email: newData.newEmail,
                          displayName: this.displayName
                        });
                        await this.alertController.create({
                          header: 'Cambiar correo electrónico',
                          message: 'Correo electrónico cambiado exitosamente',
                          buttons: ['OK']
                        }).then(alert => alert.present());
                      } catch (error) {
                        await this.alertController.create({
                          header: 'Cambiar correo electrónico',
                          message: 'Ha ocurrido un error al cambiar el correo electrónico, pide ayuda en soporte',
                          buttons: ['OK']
                        }).then(alert => alert.present());
                      }
                    }
                  }
                ]
              });

              await newEmailAlert.present();
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
                          header: 'Error',
                          message: 'La contraseña actual no coincide con la ingresada',
                          buttons: ['OK']
                        }).then(alert => alert.present());
                        return ;
                      }

                      if (newData.actualPassword === data.password) {
                        await this.alertController.create({
                          header: 'Error',
                          message: 'La contraseña nueva no puede ser igual a la actual',
                          buttons: ['OK']
                        }).then(alert => alert.present());
                        return ;
                      }

                      const passwordPattern = /^(?=.*\d)(?=.*[A-Z])(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;

                      if (!passwordPattern.test(newData.newPassword) || /\s/.test(newData.newPassword)) {
                      await this.alertController.create({
                        header: 'Error',
                        message: 'La contraseña nueva debe tener al menos 8 caracteres, una mayúscula, un número, un carácter especial y no debe contener espacios.',
                        buttons: ['OK']
                      }).then(alert => alert.present());
                      return;
                      }

                      try {
                        await this.firebaseService.updatePassword(newData.newPassword);
                        await this.alertController.create({
                          header: 'Éxito',
                          message: 'Tu contraseña ha sido cambiada exitosamente',
                          buttons: ['OK']
                        }).then(alert => alert.present());
                      } catch (error) {
                        await this.alertController.create({
                          header: 'Error',
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
    const alert = await this.alertController.create({
      header: 'Soporte',
      message: 'Por favor, describe tu problema o solicitud de soporte.',
      inputs: [
        {
          name: 'message',
          type: 'text',
          placeholder: 'Mensaje'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Enviar',
          handler: async (data) => {
            try {
              await this.firebaseService.supportRequest(data.message);
              const successAlert = await this.alertController.create({
                header: 'Soporte',
                message: 'Solicitud enviada exitosamente, te responderemos lo antes posible',
                buttons: ['OK']
              });
              await successAlert.present();
            } catch (error) {
              const errorAlert = await this.alertController.create({
                header: 'Error',
                message: 'Error al enviar la solicitud, por favor intenta de nuevo',
                buttons: ['OK']
              });
              await errorAlert.present();
            }
          }
        }
      ]
    });
    await alert.present();
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
                          icon: 'trash-outline'
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

  logout() {
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
              icon: 'log-out'
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
