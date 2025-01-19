import { Component, Input } from '@angular/core';
import { ActionSheetController, AlertController, ModalController, ToastController } from '@ionic/angular';
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

            <p *ngIf="furniture.description !== '' ">{{ furniture.name }}</p>
            <p *ngIf="furniture.description === '' " style="padding: 0;">{{ furniture.name }}</p>

          </div>

          <div class="desc">

            <div class="title" *ngIf="furniture.description !== '' ">
              <h2>Descripción del mueble</h2>
              <ion-icon name="information-circle"></ion-icon>
            </div>

            <p *ngIf="furniture.description !== '' ">{{ furniture.description }}</p>

          </div>
        </div>

        <div class="container">
          <div class="title">
            <h2>Imagen del mueble</h2>
            <ion-icon name="image"></ion-icon>
          </div>
          <div *ngFor="let photo of furniture.photos">
            <img [src]="photo">
          </div>
        </div>

        <div class="container">
          <div class="title">
            <h2>Detalles avanzados</h2>
            <ion-icon name="document-lock"></ion-icon>
          </div>

          <ion-accordion-group expand="inset" [multiple]="true">
            <ion-accordion value="first" toggleIconSlot="end">
              <ion-item slot="header">
                <h2>Costos</h2>
              </ion-item>
              <div class="ion-padding" slot="content" *ngIf="furniture.costs.length > 0">
                <ion-item *ngFor="let cost of furniture.costs">
                  <ion-label>{{ cost.name }}: {{ cost.value | currency }}</ion-label>
                  <button class="copy" (click)="copy($event)"> Copiar </button>
                </ion-item>
                <ion-item> 
                  <ion-label> <strong>Total: {{ totalValue | currency}}</strong> </ion-label> 
                  <button class="copy" (click)="copy($event)"> Copiar </button>
                </ion-item>
              </div>
              <div class="ion-padding" slot="content" *ngIf="furniture.costs.length === 0">
                <ion-item lines="none">
                  <ion-label> No hay costos asociados a este mueble.</ion-label>
                </ion-item>
              </div>
            </ion-accordion>

            <ion-accordion value="second">
              <ion-item slot="header">
                <h2>Cortes</h2>
              </ion-item>
              <div class="ion-padding" slot="content" *ngIf="furniture.cuts.length > 0">
                <ion-item *ngFor="let cut of furniture.cuts">
                  <ion-label>{{cut.extent}} = {{ cut.name }}</ion-label>
                  <button class="copy" (click)="copy($event)"> Copiar </button>
                </ion-item>
              </div>
              
              <div class="ion-padding" slot="content" *ngIf="furniture.cuts.length === 0">
                <ion-item lines="none">
                  <ion-label> No hay cortes asociados a este mueble.</ion-label>
                </ion-item>
              </div>
            </ion-accordion>

            <ion-accordion value="third">
              <ion-item slot="header">
                <h2>Accesorios</h2>
              </ion-item>
              <div class="ion-padding" slot="content" *ngIf="furniture.accessories.length > 0">
                <ion-item *ngFor="let accessory of furniture.accessories">
                  <ion-label>{{ accessory.name }}: {{ accessory.quantity }}</ion-label>
                  <button class="copy" (click)="copy($event)"> Copiar </button>
                </ion-item>
              </div>
              <div class="ion-padding" slot="content" *ngIf="furniture.accessories.length === 0">
                <ion-item lines="none">
                  <ion-label> No hay accesorios asociados a este mueble.</ion-label>
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
    background-color: #f9f9f9;
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
    opacity: 0.6;
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
    opacity: 0.6;
  }

  // Basic details

  .viewFurniture .container img {
    border-radius: 1rem;
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

  totalValue: number = 0;

  constructor(
    private modalController: ModalController,
    private toastController: ToastController,
    private alertController: AlertController,
    private actionSheet: ActionSheetController
  ) {}
  
  ngOnInit() {
    this.totalValue = this.furniture.costs.reduce((acc: number, cost: { value: number }) => acc + cost.value, 0);
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
      color: 'dark',
      icon: icon
    });
    await toast.present();
  }

  async export() {
    this.actionSheet.create({
      header: 'Exportar detalles',
      mode: 'ios',
      buttons: [
        {
          text: 'Detalles básicos',
          handler: () => {
            this.exportBasicDetails();
            this.toast('Detalles básicos exportados correctamente.', 'download-outline');
          }
        },
        {
          text: 'Detalles avanzados',
          handler: () => {
            this.exportAvancedDetails();
            this.toast('Detalles avanzados exportados correctamente.', 'download-outline');
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    }).then(actionSheet => actionSheet.present());
  }

  exportBasicDetails() {
    const { name, description, frontImg } = this.furniture;
    const contactInfo = {
      email: 'baxman_c@hotmail.com',
      phone: '+56 9 4010 8716',
      social: 'instagram.com/mueblesbaxman',
    };
  
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
  
    // Agregar logo
    const logoImg = '/assets/logo.png';
    doc.addImage(logoImg, 'PNG', pageWidth / 2 - 15, 10, 30, 30);

    // Título principal
    doc.setFontSize(20);
    doc.text('Detalles Avanzados del Mueble', pageWidth / 2, 50, { align: 'center' });
  
    let cursorY = 70;
  
    // Nombre del mueble
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Nombre:', 20, cursorY);
    doc.setFont('helvetica', 'normal');
    doc.text(name || 'N/A', 50, cursorY);
  
    cursorY += 10;
  
    // Descripción
    doc.setFont('helvetica', 'bold');
    doc.text('Descripción:', 20, cursorY);
    doc.setFont('helvetica', 'normal');
    const descriptionLines = doc.splitTextToSize(description || 'No disponible', pageWidth - 40);
    doc.text(descriptionLines, 20, cursorY + 10);
    cursorY += 10 + descriptionLines.length * 10;
  
    // Imagen
    if (frontImg) {
      const img = new Image();
      img.src = frontImg;
      img.onload = () => {
        const imgWidth = 100;
        const imgHeight = (img.height * imgWidth) / img.width;
        doc.addImage(img, 'JPEG', pageWidth / 2 - imgWidth / 2, cursorY + 10, imgWidth, imgHeight);
        cursorY += imgHeight + 20;
        const pageHeight = doc.internal.pageSize.getHeight();
        this.addContactInfo(doc, contactInfo, pageWidth, pageHeight);
        this.savePDF(doc, `BASIC_DETAILS_${name}.pdf`);
      };
    } else {
      cursorY += 20;
      const pageHeight = doc.internal.pageSize.getHeight();
      this.addContactInfo(doc, contactInfo, pageWidth, pageHeight);
      this.savePDF(doc, `BASIC_DETAILS_${name}.pdf`);
    }
  }
  
  exportAvancedDetails() {
    const { costs, cuts, accessories } = this.furniture;
    const contactInfo = {
      email: 'baxman_c@hotmail.com',
      phone: '+56 9 4010 8716',
      social: 'instagram.com/mueblesbaxman',
    };
  
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
  
    // Agregar logo
    const logoImg = '/assets/logo.png';
    doc.addImage(logoImg, 'PNG', pageWidth / 2 - 15, 10, 30, 30);

    // Título principal
    doc.setFontSize(20);
    doc.text('Detalles Avanzados del Mueble', pageWidth / 2, 50, { align: 'center' });
  
    let cursorY = 70;
  
    // Costos
    doc.setFont('helvetica', 'bold');
    doc.text('Costos:', 20, cursorY);
    cursorY += 10;
    if (costs.length > 0) {
      costs.forEach((cost: { name: string; value: number }) => {
        doc.setFont('helvetica', 'normal');
        doc.text(`${cost.name}: ${cost.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`, 30, cursorY);
        cursorY += 10;
      });
    } else {
      doc.text('No hay costos asociados.', 30, cursorY);
      cursorY += 10;
    }
  
    // Cortes
    cursorY += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Cortes:', 20, cursorY);
    cursorY += 10;
    if (cuts.length > 0) {
      cuts.forEach((cut: { extent: string; name: string }) => {
        doc.setFont('helvetica', 'normal');
        doc.text(`${cut.extent} = ${cut.name}`, 30, cursorY);
        cursorY += 10;
      });
    } else {
      doc.text('No hay cortes asociados.', 30, cursorY);
      cursorY += 10;
    }
  
    // Accesorios
    cursorY += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Accesorios:', 20, cursorY);
    cursorY += 10;
    if (accessories.length > 0) {
      accessories.forEach((accessory: { name: string; quantity: number }) => {
        doc.setFont('helvetica', 'normal');
        doc.text(`${accessory.name}: ${accessory.quantity}`, 30, cursorY);
        cursorY += 10;
      });
    } else {
      doc.text('No hay accesorios asociados.', 30, cursorY);
      cursorY += 10;
    }
  
    const pageHeight = doc.internal.pageSize.getHeight();
    this.addContactInfo(doc, contactInfo, pageWidth, pageHeight);
    this.savePDF(doc, `ADVANCED_DETAILS_${this.furniture.name}.pdf`);
  }

  savePDF(doc: jsPDF, filename: string) {
    doc.save(filename);
  }
  
  addContactInfo(doc: jsPDF, contactInfo: any, pageWidth: number, pageHeight: number) {
    const marginBottom = 20;
    const cursorY = pageHeight - marginBottom;
  
    // Configuración de fuente y estilo
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
  
    // Dibujar una línea horizontal decorativa
    doc.line(20, cursorY - 25, pageWidth - 20, cursorY - 25);
  
    // Información de contacto centrada en la parte inferior
    doc.text(`Correo: ${contactInfo.email}`, pageWidth / 2, cursorY - 15, { align: 'center' });
    doc.text(`Teléfono: ${contactInfo.phone}`, pageWidth / 2, cursorY - 5, { align: 'center' });
    doc.text(`Redes Sociales: ${contactInfo.social}`, pageWidth / 2, cursorY + 5, { align: 'center' });
  }
  

  copy(event: Event) {
    const target = event.target as HTMLButtonElement;
    const text = target.previousElementSibling?.textContent;
    navigator.clipboard.writeText(text || '');
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
