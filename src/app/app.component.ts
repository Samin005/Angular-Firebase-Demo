import {Component, ElementRef, ViewChild} from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import {AngularFireDatabase, AngularFireList} from '@angular/fire/database';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Angular-Firebase-Demo';
  @ViewChild('inputItemName') inputItemName: ElementRef;
  @ViewChild('inputItemID') inputItemID: ElementRef;
  @ViewChild('inputItemPrice') inputItemPrice: ElementRef;
  @ViewChild('inputDeleteItemName') inputDeleteItemName: ElementRef;
  itemsCouldDB: Observable<any[]>;
  itemsFirebaseDB: Observable<any[]>;
  firebaseList: AngularFireList<any>;
  sortBtnText = 'Price';
  allItemNames = [];
  allItemPrices = [];
  totalPrice = 0;

  constructor(private CloudDB: AngularFirestore, private firebaseDB: AngularFireDatabase) {
    this.itemsCouldDB = CloudDB.collection('users').valueChanges();
    this.firebaseList = firebaseDB.list('TestDB/Items');
    this.itemsFirebaseDB = this.firebaseList.valueChanges();
    this.itemsFirebaseDB.subscribe(items => {
      this.allItemNames = [];
      this.allItemPrices = [];
      this.totalPrice = 0;
      items.forEach(item => {
        this.allItemNames.push(item.name);
        this.allItemPrices.push(item.price);
      });
      this.allItemPrices.forEach(price => {
        this.totalPrice = this.totalPrice + price;
      });
    });
  }
  addItem() {
    // console.log(this.inputItemName.nativeElement.value, this.inputItemID.nativeElement.valueAsNumber, this.inputItemPrice.nativeElement.valueAsNumber);
    const itemName = this.inputItemName.nativeElement.value;
    const itemID = this.inputItemID.nativeElement.valueAsNumber;
    const itemPrice = this.inputItemPrice.nativeElement.valueAsNumber;
    if (this.containsItem(itemName)) {
      alert(itemName + 'already existed. The new value has been updated!');
    }
    this.firebaseList.set(itemName, {name: itemName, id: itemID, price: itemPrice});
  }
  deleteItem() {
    const itemName = this.inputDeleteItemName.nativeElement.value;
    if (this.containsItem(itemName)) {
      this.firebaseList.remove(itemName);
    } else {
      alert(itemName + ' does not exist!');
    }
  }
  sort() {
    if (this.sortBtnText === 'Price') {
      this.sortBtnText = 'ID';
      // this.itemsFirebaseDB = this.firebaseDB.list('TestDB/Items', ref => ref.orderByChild('price')).valueChanges();
      this.firebaseList = this.firebaseDB.list('TestDB/Items', ref => ref.orderByChild('price'));
      this.itemsFirebaseDB = this.firebaseList.valueChanges();
    } else {
      this.sortBtnText = 'Price';
      // this.itemsFirebaseDB = this.firebaseDB.list('TestDB/Items', ref => ref.orderByChild('ID')).valueChanges();
      this.firebaseList = this.firebaseDB.list('TestDB/Items', ref => ref.orderByChild('ID'));
      this.itemsFirebaseDB = this.firebaseList.valueChanges();
    }
  }
  containsItem(itemName: string): boolean {
     return this.allItemNames.includes(itemName);
  }
}
