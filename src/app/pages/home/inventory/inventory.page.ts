import { Component, ViewChild, ElementRef } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { CloudinaryService } from 'src/app/services/cloudinary/cloudinary.service';
import { Storage } from '@ionic/storage-angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  standalone: false,
  selector: 'app-inventory',
  templateUrl: './inventory.page.html',
  styleUrls: ['./inventory.page.scss'],
  providers: [CloudinaryService],
})
export class InventoryPage {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  selectedFile: File | null = null;

  constructor(
    private alertController: AlertController,
    private cloudinaryService: CloudinaryService,
    private storage: Storage,
    private firestore: AngularFirestore
  ) {}

  selectImage() {
    this.fileInput.nativeElement.click();
  }

  async convertToWebP(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), { type: 'image/webp' }));
              } else {
                reject(new Error('Conversion to WebP failed.'));
              }
            },
            'image/webp',
            0.8 // Adjust the quality here (0.0 to 1.0)
          );
        };
        img.src = event.target.result;
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
  
      // Obtén el UID del usuario desde localStorage o Firebase
      const user = await this.storage.get('user');
      const uid = user ? user.uid : null;
  
      if (!uid) {
        this.showAlert('Error', 'No se pudo obtener el UID del usuario.');
        return;
      }
  
      try {
        const webPFile = await this.convertToWebP(this.selectedFile);
        const uploadPath = `${uid}/${webPFile.name}`;
        const uploadResult = await this.cloudinaryService.uploadImage(webPFile, uploadPath);
        this.showAlert('Imagen subida con éxito', `URL: ${uploadResult.secure_url}`);
        this.firestore.collection('images').add({ ...uploadResult, path: uploadPath });
        console.log('Imagen subida:', uploadResult);
        console.log('URL de la imagen:', uploadResult.secure_url);
      } catch (error) {
        this.showAlert('Error', 'No se pudo subir la imagen.');
      }
    }
  }
  

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
