import { Component, ElementRef, OnInit, ViewChild, Input } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { ServicesService } from '../services.service';
declare var google : any;

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit{
  @Input() txtDesc : string;
  checkIn_map: boolean = false;
  map : any;
  location;
  uid;
  index = 0;
  arrayOfLoc : any = [];

  infoWindow : any = new google.maps.InfoWindow();
  @ViewChild('map', {read: ElementRef, static : false}) 
  mapRef : ElementRef;


  constructor(
    private navCtrl : NavController,
    private service : ServicesService,
    private toastController : ToastController
  ) {
    this.txtDesc = "";
  }

  ionViewDidEnter(){
    this.txtDesc="";
    this.showCurrentLoc();
  }

  showCurrentLoc(){
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition((position : Position) => {
        const pos = {
          lat : position.coords.latitude,
          lng : position.coords.longitude
        };
        this.location = pos;
        console.log(pos);
        this.showMap(pos);
      });
    }
    this.presentToast('You are back to where you are!','primary');
  }

  showMap(pos:any){
    const location = new google.maps.LatLng(pos.lat, pos.lng);
    const options = {
      center : location,
      zoom : 15,
      disableDefaultUI : true
    };
    this.map = new google.maps.Map(this.mapRef.nativeElement, options);
    const marker = new google.maps.Marker({
      position : pos,
      map : this.map,
      draggable : true,
      animation: google.maps.Animation.DROP,
    });

    this.map.addListener('click', (mapsMouseEvent) => {
      console.log(mapsMouseEvent.latLng.toJSON());
      this.location = mapsMouseEvent.latLng.toJSON();
      marker.setPosition(mapsMouseEvent.latLng.toJSON());
      this.infoWindow.setContent(
        JSON.stringify(mapsMouseEvent.latLng.toJSON(), null, 2)
      );
    });
  }


  ngOnInit(){
    this.txtDesc = "";
    this.service.userDetail().subscribe(res => {
      if (res !== null){
        console.log("CurrentUser:" , res.email);
        this.uid = res.email;
        console.log("UserId:", this.uid);
      }
      else{
        this.navCtrl.navigateBack('/register');
      }
    })
  }
  oncheckIn_map(){
    this.checkIn_map=true;
  }
  offcheckIn_map(){
    this.checkIn_map=false;
  }
  firebaseCheckIn(){
    this.presentToast('Checked In','primary');
  }

  async presentToast(message : any, color:any) {
    const toast = await this.toastController.create({
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


}
