import { VIEW } from '../enums';

export class abilityCommand {
    constructor(abilityCommandId?: number, command?: string, name?: string, abilityId?: number) {
        this.abilityCommandId = abilityCommandId;
        this.command = command;
        this.name = name;
        this.abilityId = abilityId;
    }

    public abilityCommandId: number;
    public command: string;
    public name: string;
    public abilityId: number;
}
