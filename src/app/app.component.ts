import {Component, ElementRef, ViewChild} from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Observable } from 'rxjs';
import swal from 'sweetalert2';
// import * as firebase from 'firebase/app';

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
  @ViewChild('inputSearchByItem') inputSearchByItem: ElementRef;
  itemsCouldDB: Observable<any[]>;
  itemsFirebaseDB: Observable<any[]>;
  firebaseList: AngularFireList<any>;
  sortBtnText = 'Price';
  showSortButton = true;
  allItemIDs = [];
  allItemNames = [];
  allItemPrices = [];
  totalPrice = 0;

  constructor(private CloudDB: AngularFirestore, private firebaseDB: AngularFireDatabase) {
    this.itemsCouldDB = CloudDB.collection('users').valueChanges();
    this.firebaseList = firebaseDB.list('TestDB/Items');
    this.itemsFirebaseDB = this.firebaseList.valueChanges();
    this.updateAll();
  }
  addItem() {
    // console.log(this.inputItemName.nativeElement.value, this.inputItemID.nativeElement.valueAsNumber, this.inputItemPrice.nativeElement.valueAsNumber);
    const itemName = this.inputItemName.nativeElement.value;
    const itemID = this.inputItemID.nativeElement.valueAsNumber;
    const itemPrice = this.inputItemPrice.nativeElement.valueAsNumber;
    if (this.containsItem(itemName)) {
      // alert(itemName + 'already existed. The new value has been updated!');
      swal({
        type: 'warning',
        title: 'Update?',
        text: itemName + ' already existed! Do you want to update new value?',
        showCancelButton: true,
        confirmButtonText: 'Yes, update!',
        cancelButtonText: 'cancel'
      }).then((result) => {
        if (result.dismiss === swal.DismissReason.cancel) {
           swal({
            type: 'info',
            title: 'Cancelled',
            text: 'Your data is safe :)'
          }).catch(reason => { console.log(reason); });
        } else if (result) {
          // this.firebaseList = this.firebaseDB.list('TestDB/Items');
          this.firebaseList.set(itemName, {name: itemName, id: itemID, price: itemPrice}).catch(reason => { console.log(reason); });
          swal({
            type: 'success',
            title: 'Success!',
            text: itemName + ' has been updated!'
          }).catch(reason => { console.log(reason); });
          this.itemsFirebaseDB = this.firebaseList.valueChanges();
          this.updateAllPrice();
          // this.inputSearchByItem.nativeElement.value = '';
        }
      });
    } else {
      // this.firebaseList = this.firebaseDB.list('TestDB/Items');
      this.firebaseList.set(itemName, {name: itemName, id: itemID, price: itemPrice}).catch(reason => { console.log(reason); });
    }
    // this.updateAllPrice();
    // this.itemsFirebaseDB = this.firebaseList.valueChanges();
    this.updateAll();
    // this.inputSearchByItem.nativeElement.value = '';
  }
  deleteItem() {
    const itemName = this.inputDeleteItemName.nativeElement.value;
    // this.firebaseList = this.firebaseDB.list('TestDB/Items');
    if (this.containsItem(itemName)) {
      this.firebaseList.remove(itemName).catch(reason => { console.log(reason); });
      swal({
        type: 'success',
        title: 'Success!',
        text: itemName + ' has been deleted!'
      }).catch(reason => { console.log(reason); });
    } else {
      // alert(itemName + ' does not exist!');
      swal({
        title: 'Error!',
        text: itemName + ' does not exist!',
        type: 'error'
      }).catch(reason => { console.log(reason); });
    }
    // this.itemsFirebaseDB = this.firebaseList.valueChanges();
    this.updateAll();
    // this.updateAllPrice();
  }
  sort() {
    this.updateTempList();
    if (this.sortBtnText === 'Price') {
      this.sortBtnText = 'ID';
      // this.itemsFirebaseDB = this.firebaseDB.list('TestDB/Items', ref => ref.orderByChild('price')).valueChanges();
      // this.firebaseList = this.firebaseDB.list('TestDB/tempItems', ref => ref.orderByChild('price'));
      this.firebaseList = this.firebaseDB.list('TestDB/Items', ref => ref.orderByChild('price'));
      this.itemsFirebaseDB = this.firebaseList.valueChanges();
    } else {
      this.sortBtnText = 'Price';
      // this.itemsFirebaseDB = this.firebaseDB.list('TestDB/Items', ref => ref.orderByChild('ID')).valueChanges();
      // this.firebaseList = this.firebaseDB.list('TestDB/tempItems', ref => ref.orderByChild('ID'));
      this.firebaseList = this.firebaseDB.list('TestDB/Items', ref => ref.orderByChild('ID'));
      this.itemsFirebaseDB = this.firebaseList.valueChanges();
    }
    // const temp = firebase.database().ref('TestDB/Items').orderByChild('ID').on('child_added', function (snapshot) {
    //   const item = snapshot.val();
    //   if (/item 1/.test(item.name)) {
    //     console.log(item);
    //   }
    // }).name;
    // console.log(temp);
    this.updateAll();
  }
  searchByNameOnChange() {
    this.updateTempList();
  }
  searchByItemName() {
    const searchItemName = this.inputSearchByItem.nativeElement.value;
    this.firebaseList = this.firebaseDB.list('TestDB/Items', ref => ref.orderByChild('name').startAt(searchItemName).endAt(searchItemName + '\uf8ff'));
    this.itemsFirebaseDB = this.firebaseList.valueChanges();
    this.updateAllPrice();
    // this.updateAll();
    this.showSortButton = searchItemName === '';
  }
  containsItem(itemName: string): boolean {
     return this.allItemNames.includes(itemName);
  }
  updateTempList() {
    // const searchItemName = this.inputSearchByItem.nativeElement.value;
    // this.firebaseList = this.firebaseDB.list('TestDB/Items');
    // this.firebaseList.snapshotChanges(['child_added'])
    //   .subscribe(actions => {
    //     const tempList = this.firebaseDB.list('TestDB');
    //     tempList.remove('tempItems');
    //     actions.forEach(action => {
    //       if (action.key.includes(searchItemName)) {
    //         // console.log('type: ' + action.type);
    //         // console.log('key: ' + action.key);
    //         // console.log(action.payload.val());
    //         tempList.update('tempItems/' + action.key, action.payload.val());
    //       }
    //     });
    //   });
  }
  updateAllPrice() {
    this.itemsFirebaseDB.subscribe(items => {
      this.allItemPrices = [];
      this.totalPrice = 0;
      items.forEach(item => {
        this.allItemPrices.push(item.price);
      });
      this.allItemPrices.forEach(price => {
        this.totalPrice = this.totalPrice + price;
      });
    });
  }
  updateAll() {
    this.itemsFirebaseDB.subscribe(items => {
      this.allItemIDs = [];
      this.allItemNames = [];
      this.allItemPrices = [];
      this.totalPrice = 0;
      items.forEach(item => {
        this.allItemIDs.push(item.id);
        this.allItemNames.push(item.name);
        this.allItemPrices.push(item.price);
      });
      this.allItemPrices.forEach(price => {
        this.totalPrice = this.totalPrice + price;
      });
    });
    // console.log(this.allItemIDs);
    // console.log(this.allItemNames);
    // console.log(this.allItemPrices);
    // this.firebaseList.snapshotChanges(['child_added'])
    //   .subscribe(actions => {
    //     this.allItemIDs = [];
    //     this.allItemNames = [];
    //     this.allItemPrices = [];
    //     this.totalPrice = 0;
    //     actions.forEach(action => {
    //         // console.log('type: ' + action.type);
    //         // console.log('key: ' + action.key);
    //         // console.log(action.payload.val().id);
    //       this.allItemIDs.push(action.payload.val().id);
    //       this.allItemNames.push(action.payload.val().name);
    //       this.allItemPrices.push(action.payload.val().price);
    //     });
    //     this.allItemPrices.forEach(price => {
    //       this.totalPrice = this.totalPrice + price;
    //     });
    //   });
  }
}
