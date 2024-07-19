import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    title = 'Z-Anatomy';
    version = 224;//v =
    cookiesONvar: boolean=false;
    /**  private https://stackoverflow.com/questions/40371728/firing-an-angular-2-attribute-directive-after-model-load */
    constructor() {
	this.cookiesONvar=false;
    }

    
    ngOnInit() {
        
	this.myFunction();
    }
    /***********************************************/
    //POPUP
    // When the user clicks on <div>, open the popup
    //javascript  is possibly 'null'.  https://timmousk.com/blog/typescript-object-is-possibly-null/
    //typescript document type https://stackoverflow.com/questions/58798640/what-is-documenttype-in-typescript
    myFunction() {
	var popup: HTMLElement  | undefined | null;
	popup = document?.getElementById("myPopup");
	popup?.classList.toggle("show");
    }
    /***********************************************/
 
    clickOnOK(){
	this.cookiesONvar=true;
	console.log("OK");
    } 
 
}
