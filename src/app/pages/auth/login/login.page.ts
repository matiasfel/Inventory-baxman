import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { FirebaseService } from 'src/app/services/firebase/firebase.service';
import { TermsModalComponent } from 'src/app/components/terms-modal/terms-modal.component';

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
  regConfPassword: string = "";

  passwordStrength: number = 0;
  passwordStrengthColor: string = "danger";

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private firebaseService: FirebaseService,
    private modalController: ModalController,
    private storage: Storage,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.storage.create()
    await this.storage.set('sessionID', false);
  }

  async openModalTerms() {
    const modal = await this.modalController.create({
      component: TermsModalComponent,
      componentProps: {},
    });

    await modal.present();

    // Opcional: Recoge el resultado cuando se cierra el modal
    const { data } = await modal.onWillDismiss();
    console.log('Datos del modal:', data);
  }

  async toastSuccessfull(message: string, duration: number, icon: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      icon: icon,
      position: 'top'
    });
    toast.present();
  }

  async alertError(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK'],
    });
  
    await alert.present();
  }

  async loginForm() {
    console.log('loginForm is working');
  
    if (this.email === '' || this.password === '') {
      this.alertError("Inicio de sesión", "Debes completar todos los campos");
      return; 
    }
  
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    if (!emailPattern.test(this.email)) {
      this.alertError("Inicio de sesión", "Por favor ingresa un correo electrónico válido.");
      return;
    }
  
    this.firebaseService.login(this.email, this.password).then(async (res) => {
      if (!res.user) {
        this.alertError("Inicio de sesión", "Error al obtener el usuario, pide ayuda.");
        return;
      }
  
      try {
        const user = {
          uid: res.user.uid,
          email: res.user.email,
          displayName: this.email.split('@')[0],
        };
  
        this.storage.set('user', user);
        this.storage.set('sessionID', true);
        
        this.toastSuccessfull("Inicio de sesión exitoso", 2000, 'checkmark-outline');
        this.router.navigate(['/dashboard']);
  
      } catch (error) {
        this.alertError("Inicio de sesión", "Ha ocurrido un error al intentar iniciar sesión, pide ayuda.");
      }
    }).catch((error) => {
      this.alertError("Inicio de sesión", "Credenciales incorrectas o error en el servidor.");
      console.error("Error al iniciar sesión:", error);
    });
  }

  async registerForm() {
    console.log('registerForm is working');

    if (this.regEmail === '' || this.regPassword === "" || this.regConfPassword === '') {
      this.alertError("Registro", "Debes completar todos los campos.");
      return; 
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(this.regEmail)) {
      this.alertError("Registro", "Por favor ingresa un correo electrónico válido.");
      return;
    }

    const passwordPattern = /^(?=.*\d)(?=.*[A-Z])(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;

    if (!passwordPattern.test(this.regPassword) || /\s/.test(this.regPassword)) {
      this.alertError("Registro", 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número, un carácter especial y no debe contener espacios.');
      return;
    }

    if (this.regPassword !== this.regConfPassword) {
      this.alertError("Registro", "Las contraseñas no coinciden.");
      return;
    }

    const modal = await this.modalController.create({
      component: TermsModalComponent,
      componentProps: {},
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data && data.accepted) {
      this.firebaseService.register(this.regEmail, this.regPassword).then(async (userCredential) => {
      this.toastSuccessfull("Registro exitoso, ahora debes iniciar sesión", 2000, 'checkmark-outline');
      this.toggleContainers();
      }).catch((error) => {
      this.alertError("Registro", "El correo electrónico ya está en uso.");
      });
    } else {
      this.alertError("Registro", "Debes aceptar los términos y condiciones para registrarte.");
    }

  }

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
        this.regConfPassword = '';

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

}