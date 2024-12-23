import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn:'root'
})

  export class homeGuard{
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
      if(SessionActive == false){
        return this.route.createUrlTree(['/login']);
    }
      else{
        return true;
      }
    }
  }