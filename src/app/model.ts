
export class Data {
	public personnages: Personnage[];
	public familiers: Familier[];
	public amisActuels: PNJ[];
	public quetesprincipales:Quete[];
	public quetessecondaires:Quete[];
	public lieuActuel:string;
	public boutiques: Boutique[];
	public lieux: Lieu[];
}

export class Boutique {
	public nom: string;
	public objets: Objet[];
}

export class Objet {
	public nom: string;
	public qte: number;
	public prix: number;
}

export class Entite {
	public x: number;
	public y: number;
	public xcombat: number;
	public ycombat: number;
	public nom: string;
	public etat: string;
	public niveau: number;
	public pdvmax: number;
	public pdv: number;
	public manamax: number;
	public mana: number;
	public image: string;
	public team: boolean;
	public actif: boolean;
}

export class Personnage extends Entite {
	public histoire: string;
	public classe: string;
	public stats: { nom: string, qte: number }[];
	public arme1: string;
	public arme2: string;
	public sorts: string[]
	public stuff: string[];
	public familier: string;
	public argent: number;
	public inventaire: { nom: string, qte: number }[];
	public formes: string[];
	public forme: string;
}

export class Familier extends Entite {
	public resistance: number;
	public puissance: number;
	public agilite: number;
	public intelligence: number;
	public style: number;
	public sort1: string;
	public sort2: string;
	public sort3: string;
	public sort4: string;
	public sort5: string;
}

export class PNJ extends Entite {
	public solo: boolean;
	public tournoi: boolean;
	public id: string;
	public type: string;
}

export class Quete {
	public nom: string;
	public description: string;
	public etat: string;
	public etape: number;
}

export class Lieu {
	public id: string;
	public nom: string;
	public image: string;
	public x: number;
	public y: number;
	public finx: number;
	public finy: number;
	public inside: Lieu[];
	public pnjs: PNJ2[];
	public desac: boolean;
}

export class PNJ2 {
	public id: string;
	public x: number;
	public y: number;
}

export class Combat {
	public p1: Entite;
	public p2: Entite;
}

export class Tournoi {
	public tour16: Combat[];
	public tour8: Combat[];
	public tour4: Combat[];
	public tour2: Combat[];
}