import { Component, Input } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActionSheetController, AlertController, ModalController, ToastController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  standalone: false,
  selector: 'app-furniture-edit',
  templateUrl: './app-furniture-edit.component.html',
  styleUrls: ['./app-furniture-edit.component.scss']

})

export class FurnitureEditComponent {
  @Input() furniture: any;

  constructor(
    private modalController: ModalController,
    private toastController: ToastController,
    private alertController: AlertController,
    private firestore: AngularFirestore,
    private auth: AngularFireAuth
  ) {}

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

  /********** Functions to edit shields **********/

  description: string = '';
  instagram: string = '';

  costs: { name: string, value: number }[] = [];
  cuts: { extent: string, name: string }[] = [];
  accessories: { name: string, quantity: number }[] = [];

  ngOnInit() {
    this.description = this.furniture.description;
    this.instagram = this.furniture.instagram;
    this.costs = this.furniture.costs;
    this.cuts = this.furniture.cuts;
    this.accessories = this.furniture.accessories;
  }

  /********** Dismiss functions and save functions **********/
  async dismiss() {
    if (this.description || this.costs.length || this.cuts.length || this.accessories.length) {
      this.alertController.create({
        header: '¿Estas seguro?',
        message: 'Si cancelas no se guardaran ninguno de los cambios que has realizado.',
        mode: 'ios',
        buttons: [
          {
            text: 'No, seguir editando',
            role: 'cancel'
          },
          {
            text: 'Si, cancelar edición',
            handler: async () => {
              this.modalController.dismiss();
              location.reload();
            }
          }
        ]
      }).then((alert) => {
        alert.present();
      });
    }
  }

  async saveChanges() {

    const user = await firstValueFrom(this.auth.user);
    if (user) {

      if(this.instagram){
        if(!this.instagram.includes('instagram.com')) {
          this.alert('Link de instagram', 'El enlace de Instagram no es válido.');
          return;
        }
      }

      if (this.furniture.costs.some((cost: { name: string }) => cost.name === '')) {
        this.alert("Especificación", "Debes ingresar al menos un nombre para el costo del mueble.");
        return;
      }
  
      if (this.furniture.cuts.some((cut: { extent: string, name: string }) => cut.extent === '' || cut.name === '')) {
        this.alert("Especificación", "Debes ingresar al menos una medida y un nombre para el corte del mueble.");
        return;
      }
  
      if (this.accessories.some((accessory: { name: string }) => accessory.name === '')) {
        this.alert("Especificación", "Debes ingresar al menos un nombre para el accesorio del mueble.");
        return;
      }

      try {
        this.alertController.create({
          header: 'Guardar cambios',
          message: 'Si guardas, todos los cambios que has realizado se guardan para siempre.',
          mode: 'ios',
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel'
            },
            {
              text: 'Guardar',
              handler: () => {
                this.firestore.collection('users').doc(user.uid).collection('furnitures').doc(this.furniture.furnitureId).update({
                  description: this.description,
                  instagram: this.instagram,
                  costs: this.costs,
                  cuts: this.cuts,
                  accessories: this.accessories
                });
        
                this.description = this.furniture.description;
                this.instagram = this.furniture.instagram;
                this.costs = this.furniture.costs;
                this.cuts = this.furniture.cuts;
                this.accessories = this.furniture.accessories;
                
                this.alert('Mueble editado', `El mueble con el identificador "${this.furniture.furnitureId}" ha sido editado correctamente.`);
                this.dismiss();
              }
            }
          ]
        }).then(alert => alert.present());
      } catch (error) {
        console.error('Error updating document: ', error);
        this.alert('Ha ocurrido un error', `No se ha podido editar el mueble con el identificador "${this.furniture.furnitureId}", intentalo nuevamente.`);
      }

    } else {
      this.alert('Error', 'User not authenticated');
    }
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

    if (type === 'textarea') {
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
      message: 'Si eliminas este item no se podrá recuperar a menos que canceles la edición.',
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
      message: 'Si eliminas este item no se podrá recuperar a menos que canceles la edición.',
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
      this.furniture.accessories[index].quantity = parseFloat(value);
    }
  }

  removeAccessory(index: number) {
    this.alertController.create({
      header: 'Eliminar item',
      message: 'Si eliminas este item no se podrá recuperar a menos que canceles la edición.',
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

}