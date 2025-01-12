import { Component, Input } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import jsPDF from 'jspdf';

@Component({
  standalone: false,
  selector: 'app-furniture-detail',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ furniture.name }}</ion-title>
        <ion-buttons slot="start">
          <ion-button (click)="export()">
            <ion-icon name="download-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">Cerrar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <section class="viewFurniture">

        <div class="container">
          <div class="name">

            <div class="title">
              <h2>Nombre del mueble</h2>
              <ion-icon name="pricetag"></ion-icon>
            </div>

            <p>{{ furniture.name }}</p>

          </div>

          <div class="desc">

            <div class="title">
              <h2>Descripción del mueble</h2>
              <ion-icon name="information-circle"></ion-icon>
            </div>

            <p>{{ furniture.description }}</p>
          </div>
        </div>

        <div class="container">
          <div class="title">
            <h2>Imagen del mueble</h2>
            <ion-icon name="image"></ion-icon>
          </div>
          <img [src]="furniture.frontImg">
        </div>

        <div class="container">
          <div class="title">
            <h2>Detalles avanzados</h2>
            <ion-icon name="document-lock"></ion-icon>
          </div>

          <ion-accordion-group expand="inset" [multiple]="true">

          <ion-accordion value="first">
              <ion-item slot="header">
                <h2>Costos</h2>
              </ion-item>
              <div class="ion-padding" slot="content">
                <ion-item *ngFor="let cost of furniture.costs">
                  <ion-label>{{ cost.name }}: {{ cost.value | currency }}</ion-label>
                  <button class="copy" (click)="copy($event)"> Copiar </button>
                </ion-item>
              </div>
            </ion-accordion>

            <ion-accordion value="second">
              <ion-item slot="header">
                <h2>Cortes</h2>
              </ion-item>
              <div class="ion-padding" slot="content">
                <ion-item *ngFor="let cut of furniture.cuts">
                  <ion-label>{{cut.extent}} = {{ cut.name }}</ion-label>
                  <button class="copy" (click)="copy($event)"> Copiar </button>
                </ion-item>
              </div>
            </ion-accordion>

            <ion-accordion value="third">
              <ion-item slot="header">
                <h2>Accesorios</h2>
              </ion-item>
              <div class="ion-padding" slot="content">
                <ion-item *ngFor="let accessory of furniture.accessories">
                  <ion-label>{{ accessory.name }}: {{ accessory.quantity }}</ion-label>
                  <button class="copy" (click)="copy($event)"> Copiar </button>
                </ion-item>
              </div>
            </ion-accordion>
          </ion-accordion-group>
        </div>

        <div class="separator">
          ---
        </div>
      </section>
    </ion-content>
  `,
  styles: [`

  .copy {
    background: #f4f4f4;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 5px 10px;
    color: black;
    transition: transform 0.3s ease;
  }

  .copy:active {
    transform: scale(0.9);
  }

  ion-accordion-group {
    margin: 0;
    padding: 0;
    border-radius: 16px;
  }

  ion-accordion {
    border-radius: 16px;
  }

  ion-accordion.accordion-expanding,
  ion-accordion.accordion-expanded {
    margin: 16px auto;
  }
  
  ion-accordion.accordion-collapsing ion-item[slot='header'],
  ion-accordion.accordion-collapsed ion-item[slot='header'] {
    --background: #f4f4f4;
    --color: var(--ion-color-light-contrast);
  }

  ion-accordion.accordion-expanding ion-item[slot='header'],
  ion-accordion.accordion-expanded ion-item[slot='header'] {
    --background: #d8dade;
    --color: var(--ion-color-light-contrast);
  }

  .viewFurniture {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 1rem;
    gap: 1rem;
  }

  .viewFurniture .container {
    border-radius: 1rem;
    background: #f4f4f4;
    padding: 1rem;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  }

  .viewFurniture .container .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 0 1rem;
    gap: 10px;

    h2 {
      margin: 0;
      font-weight: 600;
      font-size: 1.5rem;
    }

    ion-icon {
      font-size: 1.5rem;
    }
  }

  .viewFurniture .container .name .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 0 0.5rem;
    gap: 10px;
  }

  .viewFurniture .container .name p {
    font-size: 1.2rem;
    margin: 0 0 1.5rem;
  }

  .viewFurniture .container .desc .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 0 0.5rem;
    gap: 10px;
  }

  .viewFurniture .container .desc p {
    font-size: 1.2rem;
    margin: 0;
  }

  // Basic details

  .viewFurniture .container img {
    border-radius: 1rem;
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.3);
  }

  .separator {
    width: 100%;
    background: transparent;
    text-align: center;
    color: transparent;
  }

          `]
})

export class FurnitureDetailComponent {
  @Input() furniture: any;

  constructor(
    private modalController: ModalController,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  async exportSucces(exportMode: string) {
    const toast = await this.toastController.create({
      message: `${this.furniture.name} ha sido exportado ${exportMode}`,
      duration: 2000,
      mode: 'ios',
      position: 'bottom',
      icon: 'download-outline',
      color: 'dark'
    });
    toast.present();
  }

  async export() {
    const alert = await this.alertController.create({
      header: 'Exportar detalles',
      message: '¿Qué tipo de detalles deseas obtener?',
      mode: 'ios',
      buttons: [
        {
          text: 'Detalles basicos',
          handler: () => {
            this.exportBasicDetails();
          }
        },
        {
          text: 'Detalles avanzados',
          handler: () => {
            this.exportAvancedDetails();
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });

    await alert.present();
  }

  exportBasicDetails() {
    const basicDetails = {
      name: this.furniture.name,
      description: this.furniture.description,
      frontImg: this.furniture.frontImg
    };
  
    const contactInfo = {
      email: 'baxman_c@hotmail.com',
      phone: '+56 9 4010 8716',
      social: 'instagram.com/mueblesbaxman'
    };
  
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
  
    // Título centrado
    doc.setFontSize(20);
    doc.text('Detalles Básicos del Mueble', pageWidth / 2, 50, { align: 'center' });
  
    // Agregar logo
    const logoImg = '/assets/logo.png'; // Asegúrate de reemplazar con tu logo
    doc.addImage(logoImg, 'PNG', pageWidth / 2 - 15, 10, 30, 30);
  
    // Detalles básicos
    doc.setFontSize(12);
    const marginLeft = 20;
    let cursorY = 70;
  
    doc.text(`Nombre:`, marginLeft, cursorY);
    doc.setFontSize(14);
    doc.text(`${basicDetails.name}`, marginLeft + 30, cursorY);
  
    cursorY += 10;
    doc.setFontSize(12);
    doc.text(`Descripción:`, marginLeft, cursorY);
    doc.setFontSize(14);
  
    // Ajustar descripción a líneas
    const maxWidth = pageWidth - marginLeft * 2;
    const descriptionLines = doc.splitTextToSize(basicDetails.description, maxWidth);
    cursorY += 10;
    doc.text(descriptionLines, marginLeft, cursorY);
  
    // Ajustar el cursor hacia abajo según el alto de la descripción
    cursorY += descriptionLines.length * 10;
  
    // Agregar imagen centrada si está disponible
    if (basicDetails.frontImg) {
      const img = new Image();
      img.src = basicDetails.frontImg;
      img.onload = () => {
        const imgWidth = 100;
        const imgHeight = (img.height * imgWidth) / img.width;
        doc.addImage(img, 'JPEG', pageWidth / 2 - imgWidth / 2, cursorY + 10, imgWidth, imgHeight);
  
        cursorY += imgHeight + 20;
  
        // Llamar función para agregar contacto
        this.addContactInfo(doc, contactInfo, pageWidth, pageHeight);
        doc.save(`BASIC_DETAILS_${this.furniture.name}.pdf`);
        this.exportSucces('en formato de PDF como detalles básicos');
      };
    } else {
      cursorY += 20;
  
      // Llamar función para agregar contacto
      this.addContactInfo(doc, contactInfo, pageWidth, pageHeight);
      doc.save(`BASIC_DETAILS_${this.furniture.name}.pdf`);
      this.exportSucces('Detalles Básicos en PDF');
    }
  }

  exportAvancedDetails() {
    const advancedDetails = {
      costs: this.furniture.costs,
      cuts: this.furniture.cuts,
      accessories: this.furniture.accessories
    };

    const contactInfo = {
      email: 'baxman_c@hotmail.com',
      phone: '+56 9 4010 8716',
      social: 'instagram.com/mueblesbaxman'
    };

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Título centrado
    doc.setFontSize(20);
    doc.text('Detalles Avanzados del Mueble', pageWidth / 2, 50, { align: 'center' });
    
    // Agregar logo
    const logoImg = '/assets/logo.png'; // Asegúrate de reemplazar con tu logo
    doc.addImage(logoImg, 'PNG', pageWidth / 2 - 15, 10, 30, 30);


    // Detalles avanzados
    doc.setFontSize(12);
    const marginLeft = 20;
    let cursorY = 70;

    // Costos
    doc.text('Costos:', marginLeft, cursorY);
    cursorY += 10;
    advancedDetails.costs.forEach((cost: { name: string; value: number }) => {
      doc.text(`${cost.name}: ${cost.value}`, marginLeft + 10, cursorY);
      cursorY += 10;
    });
    // Cortes
    cursorY += 10;
    doc.text('Cortes:', marginLeft, cursorY);
    cursorY += 10;
    advancedDetails.cuts.forEach((cut: { extent: string, name: string }) => {
      doc.text(`${cut.extent} = ${cut.name}`, marginLeft + 10, cursorY);
      cursorY += 10;
    });

    // Accesorios
    cursorY += 10;
    doc.text('Accesorios:', marginLeft, cursorY);
    cursorY += 10;
    advancedDetails.accessories.forEach((accessory: { name: string; quantity: number }) => {
      doc.text(`${accessory.name}: ${accessory.quantity}`, marginLeft + 10, cursorY);
      cursorY += 10;
    });

    // Llamar función para agregar contacto
    this.addContactInfo(doc, contactInfo, pageWidth, pageHeight);
    doc.save(`ADVANCED_DETAILS_${this.furniture.name}.pdf`);
    this.exportSucces('en formato de PDF como detalles avanzados');
  }
  
  addContactInfo(doc: jsPDF, contactInfo: any, pageWidth: number, pageHeight: number) {
    const marginBottom = 20;
    const cursorY = pageHeight - marginBottom;
  
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
  
    // Información de contacto centrada
    doc.text(`Correo: ${contactInfo.email}`, pageWidth / 2, cursorY - 15, { align: 'center' });
    doc.text(`Teléfono: ${contactInfo.phone}`, pageWidth / 2, cursorY - 5, { align: 'center' });
    doc.text(`Redes Sociales: ${contactInfo.social}`, pageWidth / 2, cursorY + 5, { align: 'center' });
  
    // Línea decorativa
    doc.line(20, cursorY - 25, pageWidth - 20, cursorY - 25); // Línea horizontal
  }

  copy(event: Event) {
    const target = event.target as HTMLButtonElement;
    const text = target.previousElementSibling?.textContent;
    navigator.clipboard.writeText(text || '');
    target.disabled = true; // Disable the button
    this.toastController.create({
      message: `Texto copiado: ${text}`,
      duration: 2000,
      mode: 'ios',
      position: 'bottom',
      color: 'dark',
      icon: 'copy-outline'
    }).then(toast => toast.present());
    setTimeout(() => {
      target.disabled = false; // Re-enable the button after 2 seconds
    }, 3000);
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
