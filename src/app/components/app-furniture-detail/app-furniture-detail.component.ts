import { Component, Input } from '@angular/core';
import { ActionSheetController, AlertController, LoadingController, ModalController, ToastController } from '@ionic/angular';
/* import { File } from '@awesome-cordova-plugins/file/ngx';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx'; */
import jsPDF from 'jspdf';

@Component({
  standalone: false,
  selector: 'app-furniture-detail',
  templateUrl: './app-furniture-detail.component.html',
  styleUrls: ['./app-furniture-detail.component.scss']
})

export class FurnitureDetailComponent {
  @Input() furniture: any;

  totalValue: number = 0;

  constructor(
    private modalController: ModalController,
    private toastController: ToastController,
    private alertController: AlertController,
    private actionSheet: ActionSheetController,
    private loadingController: LoadingController,
  ) {}
  
  ngOnInit() {
    this.totalValue = this.furniture.costs.reduce((acc: number, cost: { value: number }) => acc + Math.round(cost.value), 0);
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

  /********** Export functions ********** NOT WORKING /
/*   async export() {
    this.actionSheet.create({
      header: 'Exportar detalles',
      mode: 'ios',
      buttons: [
        {
          text: 'Detalles básicos',
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
    }).then(actionSheet => actionSheet.present());
  }

  async exportBasicDetails() {
    const loading = await this.loadingController.create({
      message: 'Generando PDF...',
      spinner: 'circles',
      mode: 'ios'
    });
    await loading.present();
  
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
    await loading.dismiss();
  }
  
  async exportAvancedDetails() {
    const loading = await this.loadingController.create({
      message: 'Generandoç PDF...',
      spinner: 'circles',
      mode: 'ios'
    });
    await loading.present();

    const { costs, cuts, accessories } = this.furniture;
    const contactInfo = {
      email: 'baxman_c@hotmail.com',
      phone: '+56 9 4010 8716',
      social: 'instagram.com/mueblesbaxman',
    };
  
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let cursorY = 70;
  
    // Agregar logo
    const logoImg = '/assets/logo.png';
    doc.addImage(logoImg, 'PNG', pageWidth / 2 - 15, 10, 30, 30);
  
    // Título principal
    doc.setFontSize(20);
    doc.text('Detalles Avanzados del Mueble', pageWidth / 2, 50, { align: 'center' });
  
    const addContentWithSpacing = (title: string, items: string[]) => {
      cursorY += 10;
      doc.setFont('helvetica', 'bold');
      doc.text(title, 20, cursorY);
      cursorY += 10;
  
      if (items.length === 0) {
        doc.setFont('helvetica', 'normal');
        doc.text('No hay información disponible.', 30, cursorY);
        cursorY += 10;
      } else {
        items.forEach(item => {
          if (cursorY + 10 > pageHeight - 30) {
            doc.addPage();
            cursorY = 20;
          }
          doc.setFont('helvetica', 'normal');
          doc.text(item, 30, cursorY);
          cursorY += 10;
        });
      }
    };
  
    // Procesar Costos
    const costItems = costs.map((cost: { name: string; value: number }) =>
      `${cost.name}: ${cost.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`
    );
    addContentWithSpacing('Costos:', costItems);
  
    // Procesar Cortes
    const cutItems = cuts.map((cut: { extent: string; name: string }) => `${cut.extent} = ${cut.name}`);
    addContentWithSpacing('Cortes:', cutItems);
  
    // Procesar Accesorios
    const accessoryItems = accessories.map((accessory: { name: string; quantity: number }) =>
      `${accessory.name}: ${accessory.quantity}`
    );
    addContentWithSpacing('Accesorios:', accessoryItems);
  
    // Agregar información de contacto al final de la última página
    if (cursorY + 30 > pageHeight - 30) {
      doc.addPage();
      cursorY = 20;
    }
    this.addContactInfo(doc, contactInfo, pageWidth, pageHeight);
  
    // Guardar el PDF
    this.savePDF(doc, `ADVANCED_DETAILS_${this.furniture.name}.pdf`);
    
    await loading.dismiss();
  }

  savePDF(doc: jsPDF, filename: string) {
    // Generar el archivo como Blob
    const pdfOutput = doc.output('blob');
  
    // Ruta del directorio donde guardar el archivo
    const directory = this.file.dataDirectory; // Usa `dataDirectory` para almacenamiento persistente
  
    // Guardar el archivo
    this.file
      .writeFile(directory, filename, pdfOutput, { replace: true })
      .then(() => {
        // Abrir el archivo si es necesario
        this.fileOpener
          .open(directory + filename, 'application/pdf')
          .then(() => {
            console.log('Archivo abierto exitosamente');
          })
          .catch(err => {
            console.error('Error abriendo el archivo', err);
          });
  
        // Notificar al usuario
        this.alert('Exportar detalles','Has descargado el PDF correctamente.')
      })
      .catch(err => {
        console.error('Error guardando el archivo', err);
        this.alert('Exportar detalles', 'Ha ocurrido un error al descargar el PDF, intentalo de nuevo.')
      });
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
  } */
  
  /********** Copy and Dismiss functions **********/
  copy(event: Event) {
    const target = event.target as HTMLButtonElement;
    const value = target.previousElementSibling?.textContent;
    if (value) {
      navigator.clipboard.writeText(value.trim());
      this.alert('Copiado', `Valor "${value.trim()}" copiado al portapapeles.`)
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
