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

  constructor(private CloudDB: AngularFirestore, private firebaseDB: AngularFireDatabase) {
    this.itemsCouldDB = CloudDB.collection('users').valueChanges();
    this.itemsFirebaseDB = firebaseDB.list('TestDB/Items').valueChanges();
    this.firebaseList = firebaseDB.list('TestDB/Items');
  }
  addItem() {
    // console.log(this.inputItemName.nativeElement.value, this.inputItemID.nativeElement.valueAsNumber, this.inputItemPrice.nativeElement.valueAsNumber);
    this.firebaseList.set(this.inputItemName.nativeElement.value, {name: this.inputItemName.nativeElement.value, id: this.inputItemID.nativeElement.valueAsNumber, price: this.inputItemPrice.nativeElement.valueAsNumber});
  }
  deleteItem() {
    this.firebaseList.remove(this.inputDeleteItemName.nativeElement.value);
  }
  sort() {
    if (this.sortBtnText === 'Price') {
      this.sortBtnText = 'ID';
      this.itemsFirebaseDB = this.firebaseDB.list('TestDB/Items', ref => ref.orderByChild('price')).valueChanges();
    } else {
      this.sortBtnText = 'Price';
      this.itemsFirebaseDB = this.firebaseDB.list('TestDB/Items', ref => ref.orderByChild('ID')).valueChanges();
    }
  }
}
