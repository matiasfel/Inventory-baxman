import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { ActionSheetController, AlertController, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { CloudinaryService } from 'src/app/services/cloudinary/cloudinary.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FurnitureDetailComponent } from 'src/app/components/app-furniture-detail/app-furniture-detail.component';
import { FurnitureEditComponent } from 'src/app/components/app-furniture-edit/app-furniture-edit.component';
import { Network } from '@capacitor/network';

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

  isOnline: boolean = false;

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private cloudinaryService: CloudinaryService,
    private actionShit: ActionSheetController,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private firestore: AngularFirestore,
    private auth: AngularFireAuth
  ) {}

  /********** call all functions to init the page **********/
  ngOnInit() {
    this.loadFurnitures();
    this.filterFurnitures();

    Network.getStatus().then((status) => {
      this.isOnline = status.connected;
    });
  }

  /********** About furnitures **********/

  about(){
    const count = this.furnitures.length;
    this.alert('Cantidad de muebles', `Hay un total de ${count} muebles cargados en la nube.`);
  }

  /********** Load all furnitures from firestore and save in furnitures array **********/  

  furnitures: any[] = [];

  loadFurnitures() {
    console.log('Loading furnitures...');
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.firestore.collection(`users/${user.uid}/furnitures`).valueChanges().subscribe((furnitures) => {
          this.furnitures = furnitures;
          this.filterFurnitures();
        });
        console.log('Furnitures loaded');
      } else {
        console.log('No user is logged in');
      }
    });
  }

  handleRefresh(event: CustomEvent) {
    this.alertController.create({
      header: 'Actualizando...',
      message: 'No cierres la aplicación.',
      mode: 'ios',
      backdropDismiss: false
    }).then((alert) => {
      alert.present();
    });

    setTimeout(async () => {
      try {
      const networkStatus = await Network.getStatus();
      if (networkStatus.connected) {
        this.alertController.dismiss();
        window.location.reload()
      } else {
        this.alertController.dismiss();
        this.alert('Sin conexión', 'No hay conexión a internet. Por favor, verifica tu conexión e intenta nuevamente.');
      }
      } catch (error) {
        this.alertController.dismiss();
        this.alert('Actualización fallida', 'Ha ocurrido un error al intentar actualizar los muebles. Por favor, intentalo nuevamente.');
        console.error('Error refreshing furnitures:', error);
      }
      (event.target as HTMLIonRefresherElement).complete();
    }, 2000);
  }

  /********** Toast and Alert functions **********/
  async alert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      mode: "ios",
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

  /********** Upload images functions **********/

  // logic to convert JPG/PNG/ETC to WEBP
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

  // logic to select files / photos | CHECKED ✓
  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const selectedFile = input.files[0];
      const user = await this.auth.currentUser;
      const uid = user?.uid;
  
      if (!uid) {
        console.error('No se ha encontrado un usuario autenticado.');
        return;
      }
  
      try {
        const webPFile = await this.convertToWebP(selectedFile);
  
        const uploadPath = `${uid}/${webPFile.name}`;
  
        const uploadResult = await this.cloudinaryService.uploadImage(webPFile, uploadPath);
        console.log(`Imagen subida correctamente: ${uploadResult.secure_url}`);
  
        await this.firestore.collection(`users/${uid}/images`).add({
          url: uploadResult.secure_url,
          createdAt: new Date(),
        });
      } catch (error) {
        console.error('Error al subir la imagen:', error);
        this.alert('Subir imagen', 'Ha ocurrido un error al intentar subir la imagen. Por favor, intenta nuevamente.');
      }
    }
  }  

  // logic to add photos | CHECKED ✓
  async addPhoto(event: any) {
    const fileInput = event.target;
    
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0]; // Tomamos el primer archivo seleccionado
  
      try {
        const webpFile = await this.convertToWebP(file);
  
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const base64Image = e.target.result;
          
          this.photos.push(base64Image);
          console.log('Imagen convertida a WebP:', this.photos);
        };
  
        reader.readAsDataURL(webpFile);
      } catch (error) {
        console.error('Error al convertir la imagen a WebP:', error);
        this.alert('Subir foto', 'Ha ocurrido un error al intentar subir la imagen. Por favor, intenta nuevamente.');
      }
    }
  }

  // logic to remove photos from addFurniture() | CHECKED ✓
  removePhoto(index: number) {
    this.alertController.create({
      header: 'Eliminar foto',
      message: '¿Estás seguro de que deseas eliminar esta foto?',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.photos.splice(index, 1);
          }
        }
      ]
    }).then((alert) => {
      alert.present();
    });
  }

  /********** Furniture functions **********/

  // logic to filter the furnitures | CHECKED ✓

  searchQuery = '';
  filteredFurnitures: any[] = [];

  filterFurnitures() {
    this.filteredFurnitures = this.furnitures.filter(furniture => {
      const query = this.searchQuery.toLowerCase();
      return furniture.name.toLowerCase().includes(query) || furniture.description.toLowerCase().includes(query) || furniture.tags;
    });
  }

  // logic to open instagram | CHECKED ✓

  async openInstagram(furniture: any) {
    if (!furniture.instagram) {
      this.alert('Instagram no disponible', 'No has proporcionado una URL para este mueble.');
      return;
    } else {
      this.alertController.create({
        header: 'Abrir Instagram',
        message: '¿Desea abrir Instagram para ver la publicación de este mueble?',
        mode: 'ios',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Abrir',
            handler: () => {
              const url = `${furniture.instagram}`;
              window.open(url, '_blank');
            }
          }
        ]
      }).then((alert) => {
        alert.present();
      });
    }
  }

  // logic to edit a furniture | CHECKED ✓
  async editFurniture(furniture: any) {
    const modal = await this.modalController.create({
      mode: 'ios',
      component: FurnitureEditComponent,
      componentProps: { furniture }
    });
    modal.onDidDismiss().then((data) => {
      if (data.data) {
        this.loadFurnitures();
      }
    });
    return await modal.present();
  }

  // logic to delete a furniture | CHECKED ✓
  async deleteFurniture(furniture: any) {
    const alert = await this.alertController.create({
      header: 'Confirma la eliminación',
      message: `¿Estás seguro de que deseas eliminar el mueble "${furniture.name}"?`,
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: async () => {
            const user = this.auth.currentUser;
            if (!user) {
              console.error('No user is logged in');
              return;
            }
  
            const docId = this.cleanNameForFirestoreId(furniture.name);
  
            try {
              const resolvedUser = await user;
              if (!resolvedUser) {
                console.error('No user is logged in');
                return;
              }
  
              const collectionRef = this.firestore.collection(`users/${resolvedUser.uid}/furnitures`);
              const furnitureDoc = await collectionRef.doc(docId).get().toPromise();
  
              if (!furnitureDoc || !furnitureDoc.exists) {
                console.error('El mueble no existe en la base de datos.');
                return;
              }
  
              const furnitureData = furnitureDoc.data() as { photos?: string[] };
              const photos = furnitureData.photos || []; // Obtén las fotos asociadas
  
              // Eliminar imágenes de Cloudinary
              for (const photoUrl of photos) {
                try {
                  const publicId = this.extractPublicId(photoUrl);
                  await this.cloudinaryService.deleteImage(publicId);
                } catch (error) {
                  console.error('Error al eliminar imagen en Cloudinary:', error);
                }
              }
  
              // Eliminar mueble en Firestore
              await collectionRef.doc(docId).delete();
  
              this.alert("Mueble eliminado", `El mueble con el identificador "${furniture.furnitureId}" ha sido eliminado correctamente.`);
              this.loadFurnitures();
            } catch (error) {
              this.alert("Eliminar mueble", `Ha ocurrido un error al intentar eliminar el mueble "${furniture.name}". Por favor, intentalo nuevamente.`);
              alert.present();
              console.error('Error deleting furniture or images:', error);
            }
          },
        },
      ],
    });
    await alert.present();
  }  

  // extract public id 
  extractPublicId(photoUrl: string): string {
    const parts = photoUrl.split('/');
    const lastPart = parts[parts.length - 1]; // Obtiene la última parte de la URL
    const publicId = lastPart.split('.')[0]; // Remueve la extensión del archivo
    return publicId;
  }

  // logic to view the furniture details | CHECKED ✓
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

  // logic to add a new furniture | CHECKED ✓
  furnitureId = '';
  name = '';
  description = '';
  instagram = '';
  frontImg = '';

  costs: { name: string; value: number }[] = [];
  cuts: { extent: string; name: string }[] = [];
  accessories: { name: string; quantity: number } [] = [];
  photos: string[] = [];

  async addFurniture() {
    const user = this.auth.currentUser;
    if (!user) {
      this.alert("Usuario no autenticado", "No se ha encontrado un usuario autenticado.");
      console.error('No user is logged in');
      return;
    }

    if (this.photos.length === 0) {
      this.alert("Fotos requeridas", "Debes subir al menos una foto del mueble.");
      return;
    }

    const furniture = {
      furnitureId: this.furnitureId,
      name: this.name,
      description: this.description,
      instagram: this.instagram,
      frontImg: '',
      costs: this.costs,
      cuts: this.cuts,
      accessories: this.accessories,
      photos: [] as string[],
    };

    if (!furniture.name) {
      this.alert("Nombre requerido", "Debes ingresar un nombre para el mueble.");
      return;
    }

    if (furniture.costs.some(cost => cost.name === '')) {
      this.alert("Especificación", "Debes ingresar al menos un nombre para el costo del mueble.");
      return;
    }

    if (furniture.cuts.some(cut => cut.extent === '' || cut.name === '')) {
      this.alert("Especificación", "Debes ingresar al menos una medida y un nombre para el corte del mueble.");
      return;
    }

    if (furniture.accessories.some(accessory => accessory.name === '')) {
      this.alert("Especificación", "Debes ingresar al menos un nombre para el accesorio del mueble.");
      return;
    }

    const docId = this.cleanNameForFirestoreId(furniture.name);

    // Mostrar loading
    const loading = await this.loadingController.create({
      mode: 'ios',
      message: 'Guardando el mueble...',
      spinner: 'crescent'
    });
    await loading.present();

    user.then(async (resolvedUser) => {
      if (!resolvedUser) {
        console.error('No user is logged in');
        await loading.dismiss();
        return;
      }

      const collectionRef = this.firestore.collection(`users/${resolvedUser.uid}/furnitures`);

      try {
        const docSnapshot = await collectionRef.doc(docId).get().toPromise();

        if (docSnapshot && docSnapshot.exists) {
          console.log(`Furniture with name ${furniture.name} already exists.`);

          this.alert("Mueble existente", `El mueble "${furniture.name}" ya existe. Por favor, ingresa un nombre diferente.`);

          await loading.dismiss();
          return;
        }

        // Subir fotos a Cloudinary
        for (const photo of this.photos) {
          try {
            const blob = await (await fetch(photo)).blob();
            const file = new File([blob], `${docId}.webp`, { type: 'image/webp' });
            const response = await this.cloudinaryService.uploadImage(file, `${resolvedUser.uid}/${docId}`);
            furniture.photos.push(response.secure_url);
          } catch (error) {
            console.error('Error al subir la foto:', error);
          }
        }

        // Establecer la primera imagen como frontImg
        furniture.frontImg = furniture.photos[0] || '';
        furniture.furnitureId = docId;

        // Guardar mueble en Firestore
        await collectionRef.doc(docId).set(furniture);

        this.alert("Mueble guardado", `El mueble "${furniture.name}" ha sido guardado correctamente.`);

        // Limpiar formulario
        this.name = '';
        this.description = '';
        this.instagram = '';
        this.frontImg = '';
        this.photos = [];
        this.costs = [];
        this.cuts = [];
        this.accessories = [];
        this.photos = [];
        this.modalController.dismiss();

        console.log(`Furniture added with ID: ${docId} under user ${resolvedUser.uid}`);
      } catch (error) {
        this.alert("Error al agregar mueble", `Ha ocurrido un error al intentar agregar el mueble "${furniture.name}". Por favor, intentalo nuevamente.`);
        console.error('Error al agregar el mueble:', error);
      } finally {
        // Ocultar loading
        await loading.dismiss();
      }
    });
  }

  // clean the name to furniture ID in Firestore | CHECKED ✓
  private cleanNameForFirestoreId(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '')
      .substring(0, 20);
  }

  // validate the input to avoid special characters | CHECKED ✓
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

  // costs functions | CHECKED ✓
  addCost() {
    this.costs.push({ name: '', value: 0 });
  }

  updateCost(index: number, field: string, value: any) {
    if (field === 'name') {
      this.costs[index].name = value;
    } else if (field === 'value') {
      this.costs[index].value = parseInt(value);
    }
  }

  removeCost(index: number) {
    this.alertController.create({
      header: 'Eliminar item',
      message: 'Si eliminas este item, se perderá para siempre.',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.costs.splice(index, 1);
          }
        }
      ]
    }).then(alert => alert.present());
  }
  
  // cuts section | CHECKED ✓
  addCut() {
    this.cuts.push({ extent: '', name: '' });
  }

  updateCut(index: number, field: string, value: any) {
    if (field === 'extent') {
      this.cuts[index].extent = value;
    } else if (field === 'name') {
      this.cuts[index].name = value;
    }
  }

  removeCut(index: number) {
    this.alertController.create({
      header: 'Eliminar item',
      message: 'Si eliminas este item, se perderá para siempre.',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.cuts.splice(index, 1);
          }
        }
      ]
    }).then(alert => alert.present());
  }

  // accesories sections | CHECKED ✓
  addAccessory() {
    this.accessories.push({ name: '', quantity: 0 });
  }

  updateAccessory(index: number, field: string, value: any) {
    if (field === 'name') {
      this.accessories[index].name = value;
    } else if (field === 'quantity') {
      this.accessories[index].quantity = parseFloat(value);
    }
  }

  removeAccessory(index: number) {
    this.alertController.create({
      header: 'Eliminar item',
      message: 'Si eliminas este item, se perderá para siempre.',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.accessories.splice(index, 1);
          }
        }
      ]
    }).then(alert => alert.present());
  }

  // dismiss or close modals | CHECKED ✓
  dismissModal() {
    if (this.name || this.description || this.costs.length || this.cuts.length || this.accessories.length || this.photos.length) {
      this.alertController.create({
        header: '¿Estas seguro?',
        message: 'Si cancelas se perderán los datos ingresados.',
        mode: 'ios',
        buttons: [
          {
            text: 'No, continuar',
            role: 'cancel'
          },
          {
            text: 'Si, cancelar',
            handler: () => {
              this.name = '';
              this.description = '';
              this.instagram = '';
              this.frontImg = '';
              this.photos = [];
              this.costs = [];
              this.cuts = [];
              this.accessories = [];
              this.photos = [];
              this.modalController.dismiss();
            }
          }
        ]
      }).then((alert) => {
        alert.present();
      });
    }

    if (!this.name && !this.description && !this.costs.length && !this.cuts.length && !this.accessories.length && !this.photos.length) {
      this.modalController.dismiss();
    }

  }

}
