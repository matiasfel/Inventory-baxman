import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FurnituresPageRoutingModule } from './furnitures-routing.module';

import { FurnituresPage } from './furnitures.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FurnituresPageRoutingModule
  ],
  declarations: [FurnituresPage]
})
export class FurnituresPageModule {}
