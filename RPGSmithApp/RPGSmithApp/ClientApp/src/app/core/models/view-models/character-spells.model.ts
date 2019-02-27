import { VIEW } from '../enums';
import { Characters } from '../view-models/characters.model';
import { Ability } from '../view-models/ability.model';
import { Spell } from './spell.model';

export class CharacterSpells {
    constructor(characterSpellId?: number, characterId?: number, isMemorized?: boolean, spellId?: number,
        spell?: Spell, search?: string, multiSpells?: number[]) {

        this.characterSpellId = characterSpellId;
        this.characterId = characterId;
        this.isMemorized = isMemorized;
        this.spellId = spellId;
        this.spell = spell;
        this.search = search;

        this.multiSpells = multiSpells;
    }

    public characterSpellId: number;
    public characterId: number;
    public isMemorized: boolean;
    public spellId: number;
    public search: string;
    public spell: Spell;

    public multiSpells: number[];
}

