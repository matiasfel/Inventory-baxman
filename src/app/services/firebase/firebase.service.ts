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

  displayName!: string;
  email!: string;
  uid!: string;

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

  // Método para reautenticar al usuario
  async reauthenticate(email: string, password: string) {
    const user = await this.fireAuth.currentUser;
    if (user) {
      const credential = EmailAuthProvider.credential(email, password);
      return user.reauthenticateWithCredential(credential);
    } else {
      return null;
    }
  }

  // Método para cambiar el correo electrónico
  async updateEmail(newEmail: string) {
    const user = await this.fireAuth.currentUser;
    if (user) {
      return user.updateEmail(newEmail);
    }
  }

  // Método para cambiar la contraseña
  async updatePassword(newPassword: string) {
    const user = await this.fireAuth.currentUser;
    if (user) {
      return user.updatePassword(newPassword);
    }
  }

  // Método para eliminar la cuenta
  async deleteAccount() {
    const user = await this.fireAuth.currentUser;
    if (user) {
      const uid = user.uid;

      await this.fireStore.doc(`users/${uid}`).delete();

      await user.delete();
    }
  }

  async supportRequest(message: string) {
    try {
      const user = await this.fireAuth.currentUser;

      if (user) {
        const uid = user.uid;
        const email = user.email;
        const displayName = user.displayName;

        const reportTime = new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' });
        const reportDate = new Date();

        const supportRequest = {
          uid: uid,
          email: email,
          displayName: displayName,
          reportTime: reportTime,
          reportDate: reportDate,
          message: message,
        };

        await this.fireStore.collection('supportRequests').doc(uid).set(supportRequest);
        return 'Support request sent successfully';
      } else {
        throw new Error('User not authenticated');
      }
    } catch (error) {
      console.error('Error sending support request:', error);
      throw error;
    }
  }

  // Método para cerrar sesión
  logout() {
    this.router.navigate(['/login']);
    this.storage.set('sessionID', false);
    this.storage.remove('user');
    return this.fireAuth.signOut();
  }

}
