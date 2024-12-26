import { Component, OnInit } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-inventory',
  templateUrl: './inventory.page.html',
  styleUrls: ['./inventory.page.scss'],
})
export class InventoryPage implements OnInit {

  items: { 
    name: string, 
    quantity: number 
  }[] = [];

  constructor() { }

  ngOnInit() {
  }

}
