import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { EmailAuthProvider } from '@firebase/auth';
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(
    private fireAuth : AngularFireAuth,
    private fireStore: AngularFirestore,
    private router: Router,
    private storage: Storage
  ) { }

  login(email: string, password: string) {
    return this.fireAuth.signInWithEmailAndPassword(email, password);
  }

  async register(email: string, password: string) {
    const userCredential =  await this.fireAuth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    if(user) {
      await user.updateProfile({
        displayName: email.split('@')[0]
      });

      const uid = user.uid;
      await this.fireStore.doc(`users/${uid}`).set({
        uid: uid,
        email: email,
        displayName: email.split('@')[0],
      });
    }
  
    return userCredential;
  }

  logout() {
    this.router.navigate(['/login']);
    this.storage.set('sessionID', false);
    this.storage.remove('user');
    return this.fireAuth.signOut();
  }



}
