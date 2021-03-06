import { Component } from '@angular/core';
import { Http, Response, Headers ,RequestOptions} from '@angular/http';
import { FormBuilder,FormControl,FormArray, Validators } from '@angular/forms';
import { DataService } from '../data.service';
import { LoginUserInfoService } from '../login_user_info_service';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import { HomeComponentService } from './home.component.service'

@Component({
	selector: 'app-home',
	styleUrls: ['./home.component.css'],
	templateUrl: './home.component.html',
	providers: [HomeComponentService]
})
export class HomeComponent {
	private headers: Headers;
	private accessToken;// = "yaAbLGV5gi2TktrjHsESlSS9H2yRBmZ2S4d6ahSUriqhNhwQ1ibpwMLWhgGZgzHe";
	constructor(private ls:LoginUserInfoService,private dataService: DataService<any>,private http: Http,public fb: FormBuilder,private route: ActivatedRoute,
        private router: Router,private hs:HomeComponentService){
		this.accessToken = this.ls.getToken();
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
		this.headers.append('X-Access-Token',this.accessToken);
	}
	public loginForm = this.fb.group({
		userCard:["",Validators.required]
	});
	private extractData(res: Response): any {
        return res.json();
    }
	enroll(){
		//this.router.navigate([ 'KYC_Details'], { relativeTo: this.route });
		var options = new RequestOptions({headers : this.headers})
		this.http.post('http://localhost:3000/api/wallet/'+this.loginForm.controls.userCard.value+'/setDefault',options,{ withCredentials: true })
		.map(this.extractData).subscribe(res=>{
			console.log(res)
			if(res != null){
				alert("registration failed");
			}else if(res == null){
				this.http.get('http://localhost:3000/api/system/ping',options)
				.map(this.extractData).subscribe(pingData=>{
					console.log("pingData",pingData);
					var userData = pingData.participant.split('#');
					var userType = userData[0].split(".");
					console.log(userData,userType);
					this.http.get('http://localhost:3000/api/'+userType[3]+'/'+userData[1]+'',options)
					.map(this.extractData).subscribe(userDetails=>{
						console.log("pingData",userDetails);
						//alert(userDetails.name)
						console.log("userdetails :",userDetails)
						this.hs.setUser(userDetails);
						if(userType[3] == "User"){
							this.router.navigate(['user']);
						}else if (userType[3] == "Aadhar_Admin" || userType[3] == "Passport_Admin"){
							this.router.navigate(['verifier']);
						}else if (userType[3] == "KYC_Seeker"){
							this.router.navigate(['kycSeeker']);
						}
					})
				})
			}
		})
	}

}
