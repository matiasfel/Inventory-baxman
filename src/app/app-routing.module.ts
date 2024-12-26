import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { homeGuard } from './guards/home.guard';
import { authGuard } from './guards/auth.guard';
import { TabsComponent } from './components/tabs/tabs.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/auth/login/login.module').then(m => m.LoginPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/home/dashboard/dashboard.module').then(m => m.DashboardPageModule),
    canActivate: [homeGuard]
  },
  {
    path: 'tabs',
    component: TabsComponent,
    children: [
      {
        path: 'inventory',
        loadChildren: () => import('./pages/home/inventory/inventory.module').then(m => m.InventoryPageModule)
      },
      {
        path: 'furnitures',
        loadChildren: () => import('./pages/home/furnitures/furnitures.module').then(m => m.FurnituresPageModule)
      },
      {
        path: 'settings',
        loadChildren: () => import('./pages/home/settings/settings.module').then(m => m.SettingsPageModule)
      },
      {
        path: '',
        redirectTo: 'inventory',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }