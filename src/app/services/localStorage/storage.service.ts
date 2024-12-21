import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage : Storage) {
    this.init();
  }

  // Inicializar el storage

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  // Guardar data

  public set(key: string, value: any) {
    this._storage?.set(key, value);
  }

  // Obtener data
  public async get(key: string): Promise<any> {
    return await this._storage?.get(key);
  }

  // Remover data
  public remove(key: string) {
    this._storage?.remove(key);
  }

  // Obtener todas las llaves
  public async getAllKeys(): Promise<string[]> {
    return (await this._storage?.keys()) ?? [];
  }

}
