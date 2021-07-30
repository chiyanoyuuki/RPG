import { Component, OnInit } from '@angular/core';
import { PNJ, Familier, Personnage, Data, Entite, Lieu, Quete, Combat, Tournoi, Boutique, Objet } from './model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as DATA from '../assets/data.json';
import * as PNJS from '../assets/pnjs.json';
import * as CATACOMBESFJORH from '../assets/catacombesFjorh.json';
import { Angular2Txt } from 'angular2-txt/Angular2-txt';
import { of } from 'rxjs';
import { CdkDragEnd } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit
{
  private setting = {element: {dynamicDownload: null as HTMLElement}}
  public data : Data      = DATA["default"];
  public pnjs : PNJ[]     = PNJS["default"];
  public catacombesFjorh : string[][] = CATACOMBESFJORH["default"];

  public personnages : Personnage[]                         = this.data.personnages;
  public familiers : Familier[]                             = this.data.familiers;
  public amisActuels : PNJ[]                                = this.data.amisActuels;
  public quetesprincipales                                  = this.data.quetesprincipales;
  public quetessecondaires                                  = this.data.quetessecondaires;
  public lieuActuel2:string                                 = this.data.lieuActuel;
  public lieuActuel:Lieu;
  public boutiques:Boutique[]                               = this.data.boutiques;
  public lieux : Lieu[]                                     = this.data.lieux;
  public ennemisActuels:PNJ[]                               = [];

  public friends : [Personnage[],Familier[],PNJ[]] = [this.personnages,this.familiers,this.amisActuels];
  public hostiles : [PNJ[]] = [[]];

  public focus;
  
  public personnageClicked : Personnage = this.personnages[0];
  public familier : Familier;

  public selectParticipant:Entite = null;
  public selectEnnemi:PNJ = this.pnjs[0];
  public selectAmi:PNJ = this.pnjs[0];
  public selectForme:string[] = [];

  public clicked=undefined;
  public obj;public pvx;public manax;
  public sauveg=false;
  public page = "Personnages";
  public anciennepage = "Personnages";
  public boutique: Boutique = this.boutiques[0];
  public journal = false;
  public tournoi = false;
  public tournament : Entite[] = this.pnjs.filter(p=>p.tournoi==true);
  public solo = 'F';
  public tournoidemare = false;
  public TOURNOI : Tournoi = {tour16:[],tour8:[],tour4:[],tour2:[]};

  constructor(private http: HttpClient) { }

  ngOnInit() 
  {
    this.personnageClicked = this.personnages[0];
    this.familier = this.familiers.find(fam=>fam.nom==this.personnageClicked.familier);
    this.obj = new Array(20).fill(false,0,20);
    this.pvx = new Array(40).fill(false,0,40);
    this.manax = new Array(40).fill(false,0,40);

    this.lieux.sort((a:Lieu,b:Lieu)=>{
      return a.nom>b.nom?1:-1;
    });
    this.pnjs.sort((a:PNJ,b:PNJ)=>{
      return a.nom>b.nom?1:-1;
    });

    this.selectEnnemi = this.pnjs[0];
    this.selectAmi = this.pnjs[0];

    this.findLieuActuel(this.lieux);

    this.lieuActuel.pnjs.forEach(pnj=>{
      let p = this.pnjs.find(p=>p.id==pnj.id);
      p.xcombat = pnj.x;
      p.ycombat = pnj.y;
      this.addEnnemi(p);
    })

    //this.page='Combat';
    //this.lieuActuel = this.lieux.find(l=>l.nom=="Dusk").inside[0];
    //this.tournoi = true;
  }

  public findLieuActuel(lieu:Lieu[])
  {
    lieu.forEach(l=>
    {
      if(l.id==this.lieuActuel2){this.lieuActuel=l;}
      else{this.findLieuActuel(l.inside)}
    })
  }

  public changePage(page:string)
  {
      this.anciennepage = this.page;
      this.page = page;
  }

  public clickCase(i:number,j:number)
  {
    if(i>0){this.catacombesFjorh[i-1][j] = this.setCase(this.catacombesFjorh[i-1][j]);}
    if(j>0){this.catacombesFjorh[i][j-1] = this.setCase(this.catacombesFjorh[i][j-1]);}
    if(i<9){this.catacombesFjorh[i+1][j] = this.setCase(this.catacombesFjorh[i+1][j]);}
    if(j<9){this.catacombesFjorh[i][j+1] = this.setCase(this.catacombesFjorh[i][j+1]);}
    this.catacombesFjorh[i][j] = 'O';
  }

  public setCase(s:string)
  {
    if(s==' '){return ".";}
    else if(s=='O'){return "-";}
    else if(s=='X'){return "x";}
    return s;
  }

  public get(nb){return nb+"px";}
  public calculerPDV(nb,nbmax){return ((nb/nbmax)*92)+'%';}
  public calculerMANA(nb,nbmax){return ((nb/nbmax)*92)+'%';}
  public getPnjs(){return this.solo=='T'?this.pnjs.filter(p=>p.solo==true):this.pnjs.filter(p=>p.solo==false);}
  public getPnjs2()
  {
    let retour : Entite[] = [];
    if(this.solo=='T')
    {
      retour = retour.concat(this.pnjs.filter(p=>p.solo==true));
      retour = retour.concat(this.friends[0]);
    }
    else if(this.solo=='F')
    {
      retour = retour.concat(this.pnjs.filter(p=>p.solo==false));
    }
    this.tournament.forEach(p=>{if(retour.find(e=>e.nom==p.nom)){retour.splice(retour.indexOf(retour.find(e=>e.nom==p.nom)),1)}});
    retour.sort((a:Entite,b:Entite)=>{
      return a.nom>b.nom?1:-1;
    });
    return retour;
  }

  public desac()
  {
    if(this.personnages[0].actif==true){this.friends.forEach(f=>{f.forEach(p=>p.actif=false)});}
    else {this.friends.forEach(f=>{f.forEach(p=>p.actif=true)});}
  }

  public test(){console.log("caca");}

  public clickLieu(lieu : Lieu)
  {
    this.reinitialiserStrategie();
    //if(lieu.desac==true){this.friends.forEach(f=>{f.forEach(p=>p.actif=false)});}
    //else {this.friends.forEach(f=>{f.forEach(p=>p.actif=true)});}
    
    if(lieu.image.startsWith("retour:"))
    {
      this.lieuActuel = this.lieux.find(l=>l.nom==lieu.image.substring(lieu.image.indexOf(":")+1));
      this.data.lieuActuel = this.lieuActuel.id;
    }
    else if(lieu.image.startsWith("Shop"))
    {
      this.anciennepage=this.page;
      this.boutique = this.boutiques.find(b=>b.nom==lieu.image);
      this.boutique.objets.sort((a:Objet,b:Objet)=>{
        return a.nom>b.nom?1:-1;
      });
      this.lieuActuel = lieu;
      this.data.lieuActuel = this.lieuActuel.id;
      this.page='Combat';
    }
    else if(lieu.image=="TOURNOI")
    {
      this.tournoi = true;
    }
    else if(lieu.image=="MAP")
    {
      this.page='Map';
    }
    else
    {
      this.lieuActuel = lieu;
      this.data.lieuActuel = this.lieuActuel.id;
      this.page='Combat';
    }

    this.ennemisActuels = [];
    this.hostiles[0] = [];

    this.lieuActuel.pnjs.forEach(pnj=>{
      let p = this.pnjs.find(p=>p.id==pnj.id);
      p.xcombat = pnj.x;
      p.ycombat = pnj.y;
      this.addEnnemi(p);
    })
  }
  
  public reinitialiserStrategie()
  {
    let y = 0;
    let cpt = 0;
    this.friends.forEach(data=>{
      cpt = 0;
      data.forEach(perso=>{
        perso.xcombat = -107;
        perso.ycombat = (y * 120)-15;
        y = y + 1;
        cpt = cpt + 1;
      })
    })
  }

  public getPosTop(x:number,i:number)
  {
    if(x==0)return (45+(i*120))+'px';
    else if(x==1)return (45+(this.personnages.length*120)+(i*120))+'px';
    else if(x==2)return (45+(this.personnages.length*120)+(this.familiers.length*120)+(i*120))+'px';
  }

  public addEnnemi(p?:PNJ)
  {
    let e = this.selectEnnemi;
    if(p!=undefined)e=p;
    if(e.solo)
    {
      let i = this.amisActuels.find(a=>a.nom==e.nom)==null && this.ennemisActuels.find(a=>a.nom==e.nom)==null;
      if(!i)return;
    }
    let ennemi = this.clone(e);
    if(!e.solo)
    {
      let plus = 1;
      let nom = ennemi.nom + ' ' + plus;
      while(this.ennemisActuels.find(a=>a.nom==nom)!=null)
      {
        plus = plus + 1;
        nom = ennemi.nom + ' ' + plus;
      }
      ennemi.nom = nom;
    }
    ennemi.team=false;
    this.ennemisActuels.push(ennemi);
    this.hostiles[0] = this.ennemisActuels;
    if(p==undefined)
    {
      let lieu = this.findLieu();
      lieu.pnjs.push({id:ennemi.id,x:ennemi.xcombat,y:ennemi.ycombat});
    }
  }

  public addAmi()
  {
    let e = this.selectAmi;
    if(e.solo)
    {
      let i = this.amisActuels.find(a=>a.nom==e.nom)==null && this.ennemisActuels.find(a=>a.nom==e.nom)==null;
      if(!i)return;
    }
    let ami = this.clone(e);
    if(!e.solo)
    {
      let plus = 1;
      let nom = ami.nom + ' ' + plus;
      while(this.amisActuels.find(a=>a.nom==nom)!=null)
      {
        plus = plus + 1;
        nom = ami.nom + ' ' + plus;
      }
      ami.nom = nom;
    }
    ami.team=true;
    this.amisActuels.push(ami);
  }

  public buyObjet(objet:Objet)
  {
    if(this.personnageClicked.argent>=objet.prix&&objet.qte>0)
    {
      objet.qte = objet.qte - 1;
      this.personnageClicked.argent = this.personnageClicked.argent - objet.prix;

      let obj = this.personnageClicked.inventaire.find(o=>o.nom==objet.nom);

      if(obj!=undefined)
      {
        obj.qte = obj.qte + 1;
      }
      else
      {
        obj = this.personnageClicked.inventaire.find(o=>o.qte==0);
        obj.nom = objet.nom;
        obj.qte = obj.qte + 1;
      }
    }
  }

  public clickPerso(perso:Personnage)
  {
    this.personnageClicked = perso;
    this.familier = this.familiers.find(fam=>fam.nom==this.personnageClicked.familier);
  }

  public clickPerso2(perso:Personnage)
  {
    this.clickPerso(perso);
    this.page='Personnages';
  }

  public qteObjet(nb:number,index:number)
  {
    let obj = this.personnageClicked.inventaire[index];
    if(nb==1)
    {
      obj.qte=obj.qte+1;
    }
    else 
    {
      if(obj.qte==1)
      {
        obj.nom="";
        obj.qte=0;
      }
      else
      {
        obj.qte=obj.qte-1;
      }
    }
  }

  public delete(ennemi:boolean, perso:PNJ)
  {
    if(ennemi)
    {
      let lieu = this.findLieu();
      lieu.pnjs.splice(lieu.pnjs.indexOf(lieu.pnjs.find(p=>p.id==perso.id&&p.x==perso.xcombat&&p.y==perso.ycombat)),1);
      this.ennemisActuels.splice(this.ennemisActuels.indexOf(perso),1);
      this.hostiles[0] = this.ennemisActuels;
    }
    else
    {
      this.amisActuels.splice(this.amisActuels.indexOf(perso),1);
      this.friends[2] = this.amisActuels;
    }
  }

  public show(perso:PNJ,i:number)
  {
    //let tmp = document.getElementById(perso.nom+i+perso.team);
    let tmp2 = document.getElementById(perso.nom+'combat'+i+perso.team);
    //let rect = tmp.getBoundingClientRect();
    let rect2 = tmp2.getBoundingClientRect();

    console.log(perso.nom);
    console.log("x : "+(rect2.left-212.5));
    console.log("y : "+(rect2.top-167.5));
  }

  public changeside(ennemi:boolean,perso:PNJ)
  {
    if(ennemi)
    {
      let lieu = this.findLieu();
      lieu.pnjs.splice(lieu.pnjs.indexOf(lieu.pnjs.find(p=>p.id==perso.id&&p.x==perso.xcombat&&p.y==perso.ycombat)),1);
      this.ennemisActuels.splice(this.ennemisActuels.indexOf(perso),1);
      this.hostiles[0] = this.ennemisActuels;

      if(!perso.solo)
      {
        perso.nom = perso.image;

        let plus = 1;
        let nom = perso.nom + ' ' + plus;
        while(this.amisActuels.find(a=>a.nom==nom)!=null)
        {
          plus = plus + 1;
          nom = perso.nom + ' ' + plus;
        }
        perso.nom = nom;
      }

      this.amisActuels.push(perso);
      this.friends[2] = this.amisActuels;
    }
    else
    {
      this.amisActuels.splice(this.amisActuels.indexOf(perso),1);
      this.friends[2] = this.amisActuels;

      if(!perso.solo)
      {
        perso.nom = perso.image;

        let plus = 1;
        let nom = perso.nom + ' ' + plus;
        while(this.ennemisActuels.find(a=>a.nom==nom)!=null)
        {
          plus = plus + 1;
          nom = perso.nom + ' ' + plus;
        }
        perso.nom = nom;
      }

      let lieu = this.findLieu();
      lieu.pnjs.push({id:perso.id,x:perso.xcombat,y:perso.ycombat});
      this.ennemisActuels.push(perso);
      this.hostiles[0] = this.ennemisActuels;

      
    }
  }

  public dragEnd($event: CdkDragEnd, id: string, map: boolean, entite: Entite, saveLieu?:boolean,i?:number) {
    let tmp = $event.source.getFreeDragPosition();
    if(map==true)
    {
      entite.x = entite.x + tmp.x;
      entite.y = entite.y + tmp.y;;   
    }
    else
    {
      entite.xcombat = entite.xcombat + tmp.x;
      entite.ycombat = entite.ycombat + tmp.y;; 
    }
    if(saveLieu==true)
    {
      let lieu = this.findLieu();
      lieu.pnjs[i].x = entite.xcombat;
      lieu.pnjs[i].y = entite.ycombat;
    }
    $event.source._dragRef.reset();
  }

  public findLieu(): Lieu
  {
    let retour : Lieu = undefined;
    this.lieux.forEach(lieu=>{
      if(lieu.id==this.lieuActuel.id){retour = lieu;}
      else{
        lieu.inside.forEach(i=>{
          if(i.id==this.lieuActuel.id){retour = i;}
          else{
            i.inside.forEach(ins=>{
              if(ins.id==this.lieuActuel.id){retour = ins;}
            })
          }
        })
      }
    })
    return retour;
  }

  public sauvegarde()
  {
    this.fakeValidateUserData().subscribe((res) => {
      this.dyanmicDownloadByHtmlTag({
        fileName: 'My Report',
        text: JSON.stringify(res)
      });
    });
  }

  private fakeValidateUserData() {
    let sauvegarde = JSON.stringify(this.data);
    return of(sauvegarde);
  }

  private dyanmicDownloadByHtmlTag(arg: {
    fileName: string,
    text: string
  }) {
    if (!this.setting.element.dynamicDownload) {
      this.setting.element.dynamicDownload = document.createElement('a');
    }
    const element = this.setting.element.dynamicDownload;
    const fileType = arg.fileName.indexOf('.json') > -1 ? 'text/json' : 'text/plain';
    element.setAttribute('href', `data:${fileType};charset=utf-8,${encodeURIComponent(arg.text)}`);
    element.setAttribute('download', arg.fileName);

    var event = new MouseEvent("click");
    element.dispatchEvent(event);
  }

  public clone(obj:any) 
  {
    let keys = Object.keys(obj);
    let retour:any={};
    keys.forEach(k=>{
      retour[k]=obj[k];
    })
    return retour;
  }


  //=======================TOURNOI======================================
  
  public deleteParticipant(participant:Entite)
  {
    this.tournament.splice(this.tournament.indexOf(participant),1);
  }

  public addParticipant()
  {
    if(!this.tournament.find(p=>p.nom==this.selectParticipant.nom))
    {
      this.tournament.push(this.selectParticipant);
    }
  }

  public validerTournoi()
  {
    this.tournoidemare=true;
    let max = this.tournament.length/2;
    for(let i=0;i<max;i++)
    {
      let add : Combat = {p1:undefined,p2:undefined};
      let nb = Math.floor(Math.random()*this.tournament.length);
      let participant = this.tournament[nb];
      add.p1 = participant;
      this.tournament.splice(nb,1);

      nb = Math.floor(Math.random()*this.tournament.length);
      participant = this.tournament[nb];
      add.p2 = participant;
      this.tournament.splice(nb,1);

      this.TOURNOI.tour16.push(add);
    }
  }

  public win16(p1:Entite,p2:Entite,i:number)
  {
    if(p1["win16"]==undefined)
    {
      p1["win16"]=true;
      p2["win16"]=false;
      if(i%2==0)
      {
        let add : Combat = {p1:p1,p2:undefined};
        this.TOURNOI.tour8.push(add);
      }
      else
      {
        let add : Combat = this.TOURNOI.tour8[this.TOURNOI.tour8.length-1];
        add.p2 = p1;
      }
    }
  }

  public win8(p1:Entite,p2:Entite,i:number)
  {
    if(p1["win8"]==undefined)
    {
      p1["win8"]=true;
    p2["win8"]=false;
    if(i%2==0)
    {
      let add : Combat = {p1:p1,p2:undefined};
      this.TOURNOI.tour4.push(add);
    }
    else
    {
      let add : Combat = this.TOURNOI.tour4[this.TOURNOI.tour4.length-1];
      add.p2 = p1;
    }
    }
  }

  public win4(p1:Entite,p2:Entite,i:number)
  {
    if(p1["win4"]==undefined)
    {
      p1["win4"]=true;
      p2["win4"]=false;
      if(i%2==0)
      {
        let add : Combat = {p1:p1,p2:undefined};
        this.TOURNOI.tour2.push(add);
      }
      else
      {
        let add : Combat = this.TOURNOI.tour2[this.TOURNOI.tour2.length-1];
        add.p2 = p1;
      }
    }
  }
  //==========================FIN TOURNOI==============================
}
