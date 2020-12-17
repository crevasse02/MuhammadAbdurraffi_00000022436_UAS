import { Component, OnInit , Input} from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { threadId } from 'worker_threads';
import { ServicesService } from '../services.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  @Input() email: string;
  @Input() password: string;

  constructor(
    private service : ServicesService,
    private route : Router,
    private toastController : ToastController
  ) { }

  ngOnInit() {
  }

  login(){
    if(!this.email || !this.password){
      this.presentToast("Please Fill All Fields","danger");
      return;
    }
    else{
        const user = {
          email : this.email,
          password : this.password,
        }
        this.service.login(user)
        .then(res => {
          console.log(res);
          this.presentToast('Welcome Back','primary');
          this.route.navigateByUrl('/tabs');
        }, err=> {
          this.presentToast(err.message,'danger');
        })      
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

  goRegisterPage(){
    this.route.navigateByUrl('/register');
  }

  ionViewDidEnter(){
    this.email="";
    this.password="";
  }

}
