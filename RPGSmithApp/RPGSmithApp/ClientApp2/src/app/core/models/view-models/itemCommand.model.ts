import { VIEW } from '../enums';

export class ItemCommand {
    constructor(itemCommandId?: number, command?: string, name?: string, itemId?: number) {
        this.itemCommandId = itemCommandId;
        this.command = command;
        this.name = name;
        this.itemId = itemId;
    }

    public itemCommandId: number;
    public command: string;
    public name: string;
    public itemId: number;
}
