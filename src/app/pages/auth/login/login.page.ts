import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { FirebaseService } from 'src/app/services/firebase/firebase.service';
import { TermsModalComponent } from 'src/app/components/terms-modal/terms-modal.component';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  email: string = "";
  password: string = "";

  regEmail: string = "";
  regPassword: string = "";

  passwordStrength: number = 0;
  passwordStrengthColor: string = "danger";

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private firebaseService: FirebaseService,
    private firestore: AngularFirestore,
    private modalController: ModalController,
    private storage: Storage,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.storage.create()
    await this.storage.set('sessionID', false);
  }

  /********** Toast and Alert functions **********/
  async alert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      mode: 'ios',
      buttons: ['OK']
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

  /********** Open modal terms **********/
  async openModalTerms() {
    const modal = await this.modalController.create({
      component: TermsModalComponent,
      componentProps: {},
    });

    await modal.present();
  }

  /********** Login function **********/
  async loginForm() {
  
    if (this.email === '' || this.password === '') {
      this.alert('Inicio de sesión', 'Para iniciar sesión debes completar todos los campos.');
      console.log('empty fields');
      return; 
    }
  
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    if (!emailPattern.test(this.email)) {
      this.alert('Inicio de sesión', 'El correo electrónico no es válido.');
      console.log('email pattern');
      return;
    }
  
    this.firebaseService.login(this.email, this.password).then(async (res) => {
      if (!res.user) {
        this.alert('Inicio de sesión', 'El correo electrónico o la contraseña son incorrectos.');
        console.error("Error al iniciar sesión:", res);
        return;
      }
  
      try {
        const user = {
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName,
        };

        const lastLogin = new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' });
        this.firestore.collection('users').doc(user.uid).update({ lastLogin: lastLogin });

        this.storage.set('user', user);
        this.storage.set('sessionID', true);
        this.router.navigate(['/dashboard']);

        this.email = '';
        this.password = '';

        this.alert('Inicio de sesión', 'Inicio de sesión exitoso.');
  
      } catch (error) {
        // Handle Errors here.
        this.alert('Inicio de sesión', 'El correo electrónico o la contraseña son incorrectos.');
      }
    }).catch((error) => {
      // Handle Errors here.
      this.alert('Inicio de sesión', 'El correo electrónico o la contraseña son incorrectos.');
    });
  }

  /********** Register forms **********/
  async registerForm() {

    if (this.regEmail === '' || this.regPassword === "" ) {
      this.alert('Registro', 'Para registrarse debes completar todos los campos.');
      console.log('empty fields');
      return; 
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(this.regEmail)) {
      this.alert('Registro', 'El correo electrónico no es válido.');
      console.log('email pattern');
      return;
    }

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.\-#*])[A-Za-z\d.\-#*]+$/;

    if (!passwordPattern.test(this.regPassword)) {
      this.alert('Registro', 'La contraseña como minimo debe tener una miniscula, una mayúscula, un número y un carácter especial.');
      console.log('password pattern');
      return;
    }    

    const modal = await this.modalController.create({
      component: TermsModalComponent,
      componentProps: {},
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data && data.accepted) {
        this.firebaseService.register(this.regEmail, this.regPassword).then(async (r) => {
        this.toggleContainers();

        this.alert('Registro', 'Registro exitoso, inicia sesión para continuar.');
        console.log('register successful');
      }).catch((error) => {
        // Handle Errors here.
        this.alert('Registro', 'El correo electrónico ya está en uso.');
        console.error("Error al registrar:", error);
      });
    } else {
      this.alert('Registro', 'Debes aceptar los términos y condiciones.');
      console.log('terms not accepted');
    }

  }

  /********** Password strength **********/
  onPasswordInput(event: any): void {
    this.regPassword = event.target.value;
    this.passwordStrength = this.calculatePasswordStrength(this.regPassword);
    this.updatePasswordStrengthColor();
  }

  calculatePasswordStrength(password: string): number {
    let strength = 0;

    if (password.length >= 8) {
      strength += 0.25;
    }
    if (/[A-Z]/.test(password)) {
      strength += 0.25;
    }
    if (/[0-9]/.test(password)) {
      strength += 0.25;
    }
    if (/[^A-Za-z0-9]/.test(password)) {
      strength += 0.25;
    }

    return strength;
  }

  updatePasswordStrengthColor(): void {
    if (this.passwordStrength < 0.5) {
      this.passwordStrengthColor = 'danger';
    } else if (this.passwordStrength >= 0.5 && this.passwordStrength < 0.8) {
      this.passwordStrengthColor = 'warning';
    } else {
      this.passwordStrengthColor = 'success';
    }
  }

  /********** Toggle containers (login / register) **********/
  async toggleContainers() {

    const loginForm = document.getElementsByClassName('loginForm')[0] as HTMLElement;
    const registerForm = document.getElementsByClassName('registerForm')[0] as HTMLElement;

    if (loginForm && registerForm) {
      if (loginForm.style.zIndex === '2') {
        this.email = '';
        this.password = '';

        loginForm.style.zIndex = '1';
        registerForm.style.zIndex = '2';

        loginForm.style.transform = 'translateY(100%)';
        registerForm.style.display = 'flex';

        setTimeout(() => {
          loginForm.style.display = 'none';
          registerForm.style.transform = 'translateY(0%)';
        }, 250);

      } else {
        this.regEmail = '';
        this.regPassword = '';

        loginForm.style.zIndex = '2';
        registerForm.style.zIndex = '1';

        registerForm.style.transform = 'translateY(100%)';
        loginForm.style.display = 'block';

        setTimeout(() => {
          registerForm.style.display = 'none';
          loginForm.style.transform = 'translateY(0%)';
        }, 250);
      }
    }
  }


  /********** Validate inputs for register **********/
  validateInput(event: any, type: string) {
    const input = event.target as HTMLInputElement;
    const invalidChars = [
      ' ', '(', ')', '<', '>', 
      '[', ']', ':', ';', ',', 
      '/', '#', '$', '%', '^', 
      '&', '*', '!', '=', '?', 
      '{', '}', '|', '~', '`', 
      '\"', '\\', '¡', '-', '¨',
      '´', '+', "'", '¿', "´"
    ];

    let value = input.value;
    invalidChars.forEach(char => {
      value = value.replace(new RegExp(`\\${char}`, 'g'), '');
    });

    if (type === 'input') {
      this.regEmail = value;
    } else if (type === 'input') {
      this.email = value;
    }

    input.value = value;
  }

  validateInputPass(event: any, type: string) {
    const input = event.target as HTMLInputElement;
    const invalidChars = [' '];

    let value = input.value;
    invalidChars.forEach(char => {
      value = value.replace(new RegExp(`\\${char}`, 'g'), '');
    });

    if (type === 'input') {
      this.regPassword = value;
    } 

    input.value = value;
  }

  /********** Restore pass **********/

  restorePass() {
    this.alertController.create({
      header: 'Restablecer contraseña',
      message: 'Ingresa el correo electrónico asociado a tu cuenta para enviarte un enlace de restablecimiento de contraseña.',
      mode: 'ios',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'Correo electrónico',
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Enviar',
          handler: (data) => {
            if (data.email) {
              this.firebaseService.resetPassword(data.email).then(() => {
                this.alert('Restablecer contraseña', `Se ha enviado un enlace de restablecimiento de contraseña a ${data.email}.`);
              }).catch((error: any) => {
                this.alert('Restablecer contraseña', 'Hubo un error al enviar el enlace de restablecimiento de contraseña.');
                console.error("Error al restablecer contraseña:", error);
              });
            } else {
              this.alert('Restablecer contraseña', 'Debes ingresar un correo electrónico.');
            }
          }
        }
      ]
    }).then(alert => alert.present());
  }

}