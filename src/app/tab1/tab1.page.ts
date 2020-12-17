import { Component, Input, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { ServicesService } from '../services.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit{
  index;
  public show:boolean = true;
  uid;
  test : any [];
  users : any = [];
  friends : any = [];
  friendlist : boolean = false;

  constructor(
    private toastController : ToastController,
    private navCtrl : NavController,
    private service : ServicesService ) { }
  
  ionViewDidEnter(){
    this.users = [];
    this.showAllUser();
  }

  ngOnInit(){
    this.service.userDetail().subscribe(res => {
      if (res !== null){
        this.uid = res.email;
      }
      else{
        this.navCtrl.navigateBack('/register');
      }
    })
  }

  segmentChanged(ev: any) {
    console.log('Segment changed', ev);
  }

  showAllUser(){
    this.friendlist = false;
    this.users = [];
    this.service.getUser().subscribe((snapshot)=>{
      snapshot.docs.forEach(doc => {
        this.addUser(doc.data());
      })
      this.addLabelAdded(this.users)
    });
  }

  addUser(user : any){
    if(user.email !== this.uid){
      this.users.push({
        firstName : user.firstName,
        lastName : user.lastName,
        email : user.email,
      })
    }
  }

  addUserWithAdded(user : any){
    if(user.email !== this.uid){
      this.users.push({
        firstName : user.firstName,
        lastName : user.lastName,
        email : user.email,
        added : user.added,
      })
    }
  }

  addFriend(data,i, event: any){
    this.service.showFriends(this.uid).subscribe((doc) =>{
      if(doc.data()){
        this.friends = doc.data();
        this.index = this.friends.friends.length;
        this.addToDb(data,event);
      }
      else if(!doc.data())
      {
        event.target.classList.add('hide'); // To ADD
        this.friends= data;
        this.service.addFirstFriend(this.uid,this.friends);
        this.service.addBack(data,this.uid);
        this.presentToast('Success!','Friend has been successfully added','primary');
      }
    });
  }

  addToDb(data,event: any){
    let bool = [];
    let check = 0;
    //looping buat lihat dulu dia sudah jadi teman atau belum
    for(let i=0; i<this.index;i++){
      if(this.friends.friends[i] === data){
        bool[i] = 1;
      }
      else if (this.friends.friends[i] !== data){
        bool[i] = 0
      }
    }

    for(let i=0; i<bool.length;i++){
      check+=bool[i];
    }

    //kalau check === 0 berarti dia belum jadi temen
    if(check === 0){
      this.showAllUser();
      event.target.classList.add('hide'); // To ADD
      this.friends.friends[this.index] = data;
      this.service.addFriends(this.uid,this.friends);
      this.service.addBack(data, this.uid);
      this.presentToast('Success!','Friend has been successfully added','primary');
    }
    else if(check === 1){
      this.presentToast('Warning!','This friend has been on your list','danger');
    }
  }

  async presentToast(header:any, message : any, color:any) {
    const toast = await this.toastController.create({
      header: header,
      message: message,
      color : color,
      position: 'bottom',
      duration: 2000,
      buttons : [
        {
          side: 'end',
          icon: 'close-outline',
        }
      ]
    });
    toast.present();
  }

  removeFriend(data,i,event){
    this.users[i].added = false
    this.service.deleteFriends(this.uid,data);
    this.presentToast('Success!','Friend has been deleted','primary');
  }

  showFriends(){
    this.friendlist = true;
    this.service.showFriends(this.uid).subscribe((doc) =>{
      console.log(doc.data());
    });
  }

  async addLabelAdded(list: any) {
    this.users=[];
    this.service.showFriends(this.uid).subscribe(async (doc) =>{
      let friend: any;
      friend = doc.data();
      if(friend == undefined){
        for await (let el of list) {
          el.added = false;
          this.addUserWithAdded(el);
        }
      }else{
        for await (let el of list) {
          for await (let fr of friend.friends){
            if(el.email == fr){
              el.added = true;
              break;
            }else{
              el.added = false;
            }
          }
          this.addUserWithAdded(el);
        }
      }
    });
  }
}
