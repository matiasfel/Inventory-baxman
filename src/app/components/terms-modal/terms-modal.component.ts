import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'app-terms-modal',
  template: `
  <ion-header>
    <ion-toolbar mode="ios">
      <ion-title>Términos y Condiciones</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <div class="content-wrapper">
      <h3>1. Introducción</h3>
      <p>
        Bienvenido/a a nuestra aplicación de inventario. Al descargar, instalar y utilizar nuestra aplicación, acepta cumplir con los presentes Términos y Condiciones de Uso. Si no está de acuerdo con estos términos, no debe utilizar la aplicación.
      </p>

      <h3>2. Uso de la Aplicación</h3>
      <p>
        <strong>2.1.</strong> La aplicación está diseñada para gestionar inventarios de materiales de construcción y muebles.<br>
        <strong>2.2.</strong> Usted es responsable de garantizar que los datos ingresados en la aplicación sean precisos y completos.<br>
        <strong>2.3.</strong> No debe utilizar la aplicación para fines ilegales o no autorizados.
      </p>

      <h3>3. Registro y Autenticación</h3>
      <p>
        <strong>3.1.</strong> La aplicación utiliza Firebase Authentication para gestionar el acceso de los usuarios. Usted es responsable de mantener la confidencialidad de sus credenciales.<br>
        <strong>3.2.</strong> Nos reservamos el derecho de suspender o eliminar cuentas en caso de actividad sospechosa o uso indebido.
      </p>

      <h3>4. Almacenamiento de Datos</h3>
      <p>
        <strong>4.1.</strong> Los datos del usuario pueden almacenarse localmente en su dispositivo móvil para facilitar el acceso y el uso offline.<br>
        <strong>4.2.</strong> Firebase se utiliza como plataforma para almacenar ciertos datos de la aplicación, incluyendo información de inventario y credenciales de usuario.<br>
        <strong>4.3.</strong> Usted reconoce que aunque implementamos medidas de seguridad razonables, ninguna tecnología es completamente segura y no podemos garantizar la seguridad absoluta de sus datos.
      </p>

      <h3>5. Propiedad Intelectual</h3>
      <p>
        <strong>5.1.</strong> Todos los derechos de propiedad intelectual relacionados con la aplicación, incluyendo su diseño, logotipos y código fuente, son propiedad exclusiva de los desarrolladores.<br>
        <strong>5.2.</strong> Usted no está autorizado/a a copiar, modificar, distribuir o crear obras derivadas de la aplicación sin nuestro consentimiento previo por escrito.
      </p>

      <h3>6. Limitación de Responsabilidad</h3>
      <p> 
        <strong>6.1.</strong> La aplicación se proporciona "tal cual" y "según disponibilidad". No garantizamos que la aplicación estará libre de errores o interrupciones.<br>
        <strong>6.2.</strong> No seremos responsables por pérdidas de datos, daños indirectos, incidentales o consecuentes derivados del uso de la aplicación.
      </p>

      <h3>7. Modificaciones a los Términos y Condiciones</h3>
      <p>
        <strong>7.1.</strong> Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento. Los cambios serán notificados a través de la aplicación o por otros medios razonables.<br>
        <strong>7.2.</strong> El uso continuo de la aplicación después de dichos cambios constituye su aceptación de los mismos.
      </p>

      <h3>8. Contacto</h3>
      <p>
        Si tiene preguntas o inquietudes sobre estos Términos y Condiciones, puede comunicarse con nosotros a través del soporte proporcionado en la aplicación.
      </p>

      <h3>9. Ley Aplicable</h3>
      <p>
        Estos Términos y Condiciones se regirán e interpretarán de acuerdo con las leyes aplicables en su jurisdicción.
      </p>

      <p style="margin-bottom: 120px;">
        Gracias por utilizar nuestra aplicación. Nos comprometemos a ofrecerle una experiencia segura y eficiente para gestionar sus inventarios.
      </p>
    </div>

    <div class="buttons">
      <button (click)="dismiss()">No acepto</button>
      <button (click)="accept()">Acepto</button>
    </div>
  </ion-content>
`,
styles: [`
  ion-content {
    --background: #fff;
    padding-bottom: 120px;
  }

  .content-wrapper {
    text-align: left;
    padding: 10px;
  }

  h3 {
    margin-top: 24px;
    font-size: 1.2rem;
    font-weight: bold;
  }

  p {
    margin: 12px 0;
    line-height: 1.6;
    color: #444;
  }

  .buttons {
    position: fixed;
    bottom: 0;
    width: 100%;
    display: flex;
    justify-content: space-around;
    padding: 16px;
    background: #fff;
    box-shadow: 0 -6px 34px rgba(0, 0, 0, 0.1);
  }

  button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
  }
    `]
  })

export class TermsModalComponent {
  constructor(
    private modalController: ModalController
  ) {}

  dismiss() {
    this.modalController.dismiss();
    console.log('Términos y condiciones no aceptados');
  }

  accept() {
    this.modalController.dismiss({ accepted: true });
    console.log('Términos y condiciones aceptados');
  }
}
