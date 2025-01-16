import { Injectable } from '@angular/core';
import axios from 'axios';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private cloudName = 'dmbg8ccsr';
  private apiKey = '179815289865367';
  private apiSecret = 'ED2ywLc8lT_xDmZEIbDola-LS9M';
  private uploadPreset = 'default_preset';

  constructor() {
  }

  async uploadImage(file: File, uid: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    formData.append('folder', `users/${uid}`); // Organiza imágenes por UID en carpetas

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
        formData
      );
      return response.data; // Devuelve información de la imagen
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      throw error;
    }
  }

  async deleteImage(publicId: string): Promise<any> {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = this.generateSignature(publicId, timestamp);
  
    const formData = new URLSearchParams();
    formData.append('public_id', publicId);
    formData.append('api_key', this.apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
  
    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`,
        formData
      );
      console.log('Delete response:',response.data); // Verifica la respuesta
      return response.data; // Devuelve información de la imagen eliminada
    } catch (error) {
      console.error('Error al eliminar la imagen:', error);
      throw error;
    }
  }

  private generateSignature(publicId: string, timestamp: number): string {
    const signatureString = `public_id=${publicId}&timestamp=${timestamp}${this.apiSecret}`;
    return CryptoJS.SHA1(signatureString).toString();
  }
}