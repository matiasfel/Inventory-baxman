import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn:'root'
})

  export class authGuard{
    constructor(
      private route:Router,
      private storage: Storage){
      this.init();
    }

    async init(){
      await this.storage.create();
    }

    canActivate : CanActivateFn = async(route,state) =>{
      const SessionActive = await this.storage.get("sessionID");
      if(SessionActive == true ){
        return this.route.createUrlTree(['/dashboard']);
    }
      else{
        return true;
      }
    }
  }