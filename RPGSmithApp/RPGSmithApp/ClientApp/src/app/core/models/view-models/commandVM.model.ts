import { VIEW } from '../enums';

export class CommandVM {
    constructor(commandId?: number, command?: string, name?: string) {
        this.commandId = commandId;
        this.command = command;
        this.name = name;
    }

    public commandId: number;
    public command: string;
    public name: string;
}
