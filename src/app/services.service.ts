import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map,catchError } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { promise } from 'protractor';
import { resolve } from 'dns';

@Injectable({
  providedIn: 'root'
})
export class ServicesService {
  ms_user;
  user;


  constructor(
    private fireStore : AngularFirestore,
    private http : HttpClient,
    private fireAuth : AngularFireAuth,
  ) { }

  //register user baru (firebase auth)
  register(newUser){
    return new Promise<any>((resolve,reject)=> {
      this.fireAuth.createUserWithEmailAndPassword(newUser.email, newUser.password)
          .then(
            res => resolve(res),
            err => reject (err)
          );
    });
  }

  //ini selesai registrasi berhasil, masukin user ke ms_user
  addUser(newUser){
    const user = {
      firstName : newUser.firstName,
      lastName : newUser.lastName,
      email : newUser.email,
      password : newUser.password
    }

    this.fireStore.collection("ms_user").doc(user.email).set(user)
    .then(function() {
        console.log("Document successfully written!");
    })
    .catch(function(error) {
        console.error("Error writing document: ", error);
    });
  }
  
  //login (firebase auth)
  login(user){
    return new Promise<any>((resolve,reject)=> {
      this.fireAuth.signInWithEmailAndPassword(user.email, user.password)
          .then(
            res => resolve(res),
            err => reject (err)
          );
    });
  }

  //logout (firebase auth)
  logout(){
    return new Promise((resolve,reject)=>{
      if(this.fireAuth.currentUser){
        this.fireAuth.signOut()
        .then(()=>{
          console.log("Logged Out");
          resolve();
        }).catch((error)=>{ 
          reject(); 
        });
      }
    });
  }

  //ini buat cek ada user yang login atau tidak
  userDetail(){
    return this.fireAuth.user;
  }

  //masukin data latitude longitude ke ms_loc
  checkIn(doc_id, data){
    console.log(data);
    this.fireStore.collection("ms_loc").doc(doc_id).set(data)
    .then(function() {
        console.log("Document successfully written!");
    })
    .catch(function(error) {
        console.error("Error writing document: ", error);
    });
  }

  //tampilin semua pengguna 
  showUsers(){
    this.fireStore.collection("ms_user").get().subscribe((snapshot)=>{
        snapshot.docs.forEach(doc => {
          console.log(doc.data());
      })
    });
  }

  //tampilin yang jadi temen doang
  showFriends(doc_id){
    return this.fireStore.collection("ms_friend").doc(doc_id).get();
  }


  getUser(){
    return this.fireStore.collection("ms_user").get();
  }

  getCurrUser(doc_id){
    console.log(doc_id);
    return this.fireStore.collection("ms_user").doc(doc_id).get();
  }

  //tambahin temen
  addFriends(doc_id,data){ 
    this.fireStore.collection("ms_friend").doc(doc_id).set(Object.assign({}, data))
    .then(function() {
        console.log("Document successfully written!");
    })
    .catch(function(error) {
        console.error("Error writing document: ", error);
    });
  }

  // delete temen
  deleteFriends(doc_id,data){
    this.fireStore.collection("ms_friend").doc(doc_id).get().subscribe((doc) => {
      let fr: any = []
      fr = doc.data();
      fr.friends = fr.friends.filter(item => item != data)
      this.fireStore.collection("ms_friend").doc(doc_id).set({friends : fr.friends})
    })
  }

  //tambahin temen untuk pertama kali (belum ada docs nya di firestore)
  addFirstFriend(doc_id,data){
    this.fireStore.collection("ms_friend").doc(doc_id).set({friends : [data]}).
    then(function(){
      "Successfully added your first friend!";
    });
  }

  //misal A add B jadi temen, A juga masuk jadi temennya B
  addBack(doc_id, data){
    let listOfFriends : any = [];
    this.fireStore.collection("ms_friend").doc(doc_id).get().subscribe((doc) =>{
      console.log(doc.data());
      listOfFriends = doc.data();
      //kalo B belum punya temen, A jadi temen pertama, jadi ke function addFirstFriend
      if(!listOfFriends || !doc.data()){
        this.addFirstFriend(doc_id,data);
      }
      //kalo B uda ada temen, ambil list temen B, terus masukin A ke list temen B
      else {
        let index = listOfFriends.friends.length;
        listOfFriends.friends[index] = data;
        console.log("list:" , listOfFriends);
        this.fireStore.collection("ms_friend").doc(doc_id).set(Object.assign({}, listOfFriends)).
        then(function(){
          console.log("Successfully add friend back!");
        });
      }
    })
  }

  uploadPic(doc_id,base64){
    this.fireStore.collection("ms_photo").doc(doc_id).set({pic : base64}).then(
      function(){
        console.log("Profile Pic Uploaded!");
      }
    )
    .catch(function(error) {
      console.error("Error writing document: ", error);
    });
  }

  getProfilePic(doc_id){
    return this.fireStore.collection("ms_photo").doc(doc_id).get();
  }

}
