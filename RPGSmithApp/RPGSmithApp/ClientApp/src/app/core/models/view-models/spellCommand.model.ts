import { VIEW } from '../enums';

export class spellCommand {
    constructor(spellCommandId?: number, command?: string, name?: string, spellId?: number) {
        this.spellCommandId = spellCommandId;
        this.command = command;
        this.name = name;
        this.spellId = spellId;
    }

    public spellCommandId: number;
    public command: string;
    public name: string;
    public spellId: number;
}
