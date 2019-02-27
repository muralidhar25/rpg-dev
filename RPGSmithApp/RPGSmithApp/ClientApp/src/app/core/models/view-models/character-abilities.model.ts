import { VIEW } from '../enums';
import { Characters } from '../view-models/characters.model';
import { Ability } from '../view-models/ability.model';

export class CharacterAbilities {
    constructor(characterAbilityId?: number, characterId?: number, isEnabled?: boolean, abilityId?: number,
        ability?: Ability, search?: string, multiAbilities?: number[]) {

        this.characterAbilityId = characterAbilityId;
        this.characterId = characterId;
        this.isEnabled = isEnabled;
        this.abilityId = abilityId;
        this.search = search;
        this.ability = ability;
        this.multiAbilities = multiAbilities;
    }

    public characterAbilityId: number;
    public characterId: number;
    public isEnabled: boolean;
    public abilityId: number;
    public search: string;

    public multiAbilities: number[];

    public ability: Ability;
}

