import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { Md5 } from "md5-typescript";
import { ServicesService } from '../services.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  checked : boolean;
  @Input() firstName : string = "";
  @Input() lastName: string = "";
  @Input() email: string = "";
  @Input() password: string = "";

  constructor(
    private service : ServicesService,
    private route : Router,
    private toastController : ToastController,
    private navCtrl : NavController,
  ) { }

  ngOnInit() {
  }

  register(){
    if(!this.firstName || !this.lastName || !this.email || !this.password){
      this.presentToast("Please Fill All Fields","danger");
      return;
    }
    else{
      const user = {
        firstName : this.firstName,
        lastName : this.lastName,
        email : this.email,
        password : Md5.init(this.password)
      }
      const userReg = {
        email : this.email,
        password : this.password
      }
      this.service.register(userReg).then(
        res=>{
          console.log(res);
          //if success, add user to collection ms_user
          this.service.addUser(user);
          this.presentToast('Account successfully created!','success');
          this.navCtrl.navigateForward('/login')
        },
        err => {
          console.log(err.message);
          this.presentToast(err.message,'danger');
        }
      )
    }
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

  goLoginPage(){
    this.route.navigateByUrl('/login');
  }

  ionViewDidEnter(){
    this.firstName = "";
    this.lastName = "";
    this.email = "";
    this.password = "";
  }


}
