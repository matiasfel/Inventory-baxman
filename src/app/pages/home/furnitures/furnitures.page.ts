import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { CloudinaryService } from 'src/app/services/cloudinary/cloudinary.service';
import { Storage } from '@ionic/storage-angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FurnitureDetailComponent } from 'src/app/components/app-furniture-detail/app-furniture-detail.component';

@Component({
  standalone: false,
  selector: 'app-inventory',
  templateUrl: './furnitures.page.html', 
  styleUrls: ['./furnitures.page.scss'],
  providers: [CloudinaryService],
})
export class FurnituresPage implements OnInit {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  // selected file to upload
  selectedFile: File | null = null;

  constructor(
    private alertController: AlertController,
    private cloudinaryService: CloudinaryService,
    private modalController: ModalController,
    private storage: Storage,
    private firestore: AngularFirestore
  ) {}

  /* 

  frontImg:
  name:
  description: 
  costs: [
    {
      name:
      value:
    }
  ]

  cuts: [
    {
      extent:
      name:
    }
  ]

  accessories: [
    {
      name:
      quantity:
    }
  ]

  */

  ngOnInit() {
    console.log('FurnituresPage initialized');

    this.furnitures = [
    ];

    this.filterFurnitures();
  }

  // refresh content

  handleRefresh(event: CustomEvent) {
    setTimeout(() => {
      window.location.reload();
      (event.target as HTMLIonRefresherElement).complete();
    }, 2000);
  }

  // logic to upload an image, convert image and upload to cloudinary

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
        console.log('No se ha encontrado un usuario autenticado.');
        return;
      }
  
      try {
        const webPFile = await this.convertToWebP(this.selectedFile);
        const uploadPath = `${uid}/${webPFile.name}`;
        const uploadResult = await this.cloudinaryService.uploadImage(webPFile, uploadPath);
        console.log(`Imagen subida: URL: ${uploadResult.secure_url}`);

        this.firestore.collection('images').add({ ...uploadResult, path: uploadPath });

        console.log('Imagen subida:', uploadResult);
      } catch (error) {
        console.log('Error al subir la imagen:', error);
      }
    }
  }

  // logic to close modal

  dismissModal(){
    this.modalController.dismiss();
  }

  // logic to filter the furnitures

  filterFurnitures() {
    this.filteredFurnitures = this.furnitures.filter(furniture => {
      return furniture.name.toLowerCase().includes(this.searchQuery.toLowerCase());
    });
  }

    // input to search for a furniture
    searchQuery = '';

    // array of filtered furnitures
    filteredFurnitures: any[] = [];

  // logic to view the furniture details

  editFurniture(){
    console.log('Furniture edited');
    //logic
  }

  deleteFurniture(){
    console.log('Furniture deleted');
    //logic
  }

  selectedFurniture: any;

  async viewFurniture(furniture: any) {
    this.selectedFurniture = furniture;
    const modal = await this.modalController.create({
      mode: 'ios',
      component: FurnitureDetailComponent,
      componentProps: { furniture: this.selectedFurniture }
    });
    return await modal.present();
  }

  // logic to add a new furniture

    // array of furnitures
    furnitures: any[] = [];

    frontImg= "";
    name = '';
    description = '';
    costs: { name: string; value: number }[] = [];
    cuts: { extend: string; name: string }[] = [];
    accessories: { name: string; value: number } [] = [];

  addFurniture(){
    const newFurniture = {
      frontImg: this.frontImg,
      name: this.name,
      description: this.description,
      costs: this.costs,
      cuts: this.cuts,
      accessories: this.accessories
    };

    // implement logic to add a new furniture and the database

    console.log(newFurniture);
  }

  validateInput(event: any, type: string) {
    const input = event.target as HTMLInputElement;
    const invalidChars = [
      '°', '_', '-', '¡',
      '!', '@', '#', '$',
      '%', '^', '&', '*',
      '(', ')', '+', '/',
      '{', '}', '[', ']',
      '|', '\\', ':', ';',
      '"', "'", '<', '>', 
      '?'];

    let value = input.value;
    invalidChars.forEach(char => {
      value = value.replace(new RegExp(`\\${char}`, 'g'), '');
    });

    if (type === 'input') {
      this.name = value;
    } else if (type === 'textarea') {
      this.description = value;
    }

    input.value = value;
  }

/*   addCost() {
    this.costs.push({ name: '', value: 0 });
  }

  removeCost(index: number) {
    this.costs.splice(index, 1);
  } */

}
