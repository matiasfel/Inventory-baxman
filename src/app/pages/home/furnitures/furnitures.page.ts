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

  ngOnInit() {
    this.furnitures = [

      /*  
        Datos a tener en cuenta:

        // STRINGS
        - frontImg: URL de la imagen principal del mueble.
        - name: Nombre del mueble.
        - description: Descripción del mueble.

        // ARRAYS
        - costs: Array de objetos con el costo y venta del mueble.
        - cuts: Array de objetos con las medidas de los cortes del mueble.
        - accessories: Array de objetos con los accesorios necesarios para el mueble

        // OBJECTS
        - cost: Objeto con el nombre y valor del costo del mueble.
        - cut: Objeto con la medida del corte del mueble.
        - accessory: Objeto con el nombre y cantidad del accesorio del mueble.

        // !!!!!!!!!!!
        El orden seria asi: Se agregan los campos requeridos (frontImg, name, description, costs, cuts, accessories)
        y se agregan los valores correspondientes a cada campo, luego se sube la fotografia referencial a Cloudinary
        y se copia la URL de la imagen en el campo frontImg, y asi con todos los datos para que finalmente se guarde
        el nuevo mueble en la base de datos de FIREBASE. 10/01/25
      */

      {
        frontImg: 'https://res-console.cloudinary.com/dmbg8ccsr/thumbnails/v1/image/upload/v1736285306/bHFxdWRmZm4zZm1hNzVtMHR2YzM=/drilldown',
        name: 'Zapatero',
        description: 'Un mueble blanco alto y delgado, con una puerta lisa y un tirador pequeño, ideal para espacios estrechos y almacenamiento vertical.',
        costs: [
          {
            name: 'Costo',
            value: 45000
          },
          {
            name: 'Venta',
            value: 80000,
          }
        ],
        cuts: [
          {
            name: '180 x 30 = 2 lt',
          },
          {
            name: '47 x 10 = 3 socalo',
          },
          {
            name: '47 x 30 = 2 piso y base',
          },
          {
            name: '47 x 28 = 7 divisiones',
          },
          {
            name: '170 x 50 = 1 puerta',
          },
          {
            name: '170 x 50 = 1 durolac',
          }
        ],
        accessories: [
          {
            name: 'Tirador balín',
            quantity: 1
          },
          {
            name: 'Bisagra de 35mm',
            quantity: 4
          },
          {
            name: 'Tapacanto',
            quantity: 25
          },
          {
            name: 'Tornillos',
            quantity: 50
          }
        ]
        
      }
    ];
    this.filterFurnitures();
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
    cuts = [];
    accessories = [];

    addCost() {
      this.costs.push({ name: '', value: 0 });
    }
  
    removeCost(index: number) {
      this.costs.splice(index, 1);
    }
  

  addFurniture(){
    const newFurniture = {
      frontImg: this.frontImg,
      name: this.name,
      description: this.description,
      costs: this.costs,
      cuts: this.cuts,
      accessories: this.accessories
    };

    console.log(newFurniture);
  }

}
