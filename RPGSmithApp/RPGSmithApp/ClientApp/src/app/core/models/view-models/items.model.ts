import { VIEW } from '../enums';
import { Characters } from '../view-models/characters.model';
import { ItemMaster } from '../view-models/item-master.model';

export class Items {

    constructor(
        itemId?: number, characterId?: number, itemMasterId?: number, containedIn?: number, contains?: string, quantity?: number, totalWeight?: number,
        isIdentified?: boolean, isVisible?: boolean, isEquipped?: boolean, characters?: Characters, itemMaster?: ItemMaster,
        name?: string, description?: string, itemImage?: string, view?: VIEW, showIcon?: boolean,
      multiItemMasters?: number[], multiItemMasterBundles?: number[],
        isContainer?: boolean, isConsumable?: boolean, isMagical?: boolean,
        itemCalculation?: string, metatags?: string,
        rarity?: string, value?: number, volume?: number,
        weight?: number, containerItems?:any[]
    ) {

        this.itemId = itemId;
        this.name = name;
        this.description = description;
        this.characterId = characterId;
        this.itemMasterId = itemMasterId;
        this.itemImage = itemImage;
        this.containedIn = containedIn;
        this.contains = contains;
        this.quantity = quantity;
        this.totalWeight = totalWeight;
        this.isIdentified = isIdentified;
        this.isVisible = isVisible;
        this.isEquipped = isEquipped;
        this.characters = characters;
        this.itemMaster = itemMaster;

        this.isContainer = isContainer;
        this.isConsumable = isConsumable;
        this.isMagical = isMagical;
        this.itemCalculation = itemCalculation;
        this.metatags = metatags;
        this.rarity = rarity;
        this.value = value;
        this.volume = volume;
        this.weight = weight;

        this.view = view;
        this.showIcon = showIcon;
        this.multiItemMasters = multiItemMasters;
      this.multiItemMasterBundles = multiItemMasterBundles ? multiItemMasterBundles:[];
        this.containerItems = containerItems
    }

    public itemId: number;
    public name: string;
    public description: string;
    public itemImage: string;
    public characterId: number;
    public itemMasterId: number;
    public containedIn: number;
    public contains: string;
    public quantity: number;
    public totalWeight: number;
    public isIdentified: boolean;
    public isVisible: boolean;
    public isEquipped: boolean;

    public isContainer: boolean;
    public isConsumable: boolean;
    public isMagical: boolean;
    public itemCalculation: string;
    public metatags: string;
    public rarity: string;
    public value: number;
    public volume: number;
    public weight: number;

    public characters: Characters;
    public itemMaster: ItemMaster;

    public view: VIEW;
    public showIcon: boolean;
    public multiItemMasters: number[];
  public multiItemMasterBundles: number[];
    public containerItems:any[]
}


