import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FurnituresPage } from './furnitures.page';

const routes: Routes = [
  {
    path: '',
    component: FurnituresPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FurnituresPageRoutingModule { }