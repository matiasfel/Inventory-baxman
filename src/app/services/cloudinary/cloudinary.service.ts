import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})

export class CloudinaryService {
  private cloudName = 'dmbg8ccsr';
  private uploadPreset = 'default_preset'; // Define esto en Cloudinary

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
}