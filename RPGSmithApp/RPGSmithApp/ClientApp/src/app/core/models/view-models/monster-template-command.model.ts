import { VIEW } from '../enums';

export class MonsterTemplateCommand {
  constructor(monsterTemplateCommandId?: number, command?: string, name?: string,monsterTemplateId?: number) {
    this.monsterTemplateCommandId = monsterTemplateCommandId;
        this.command = command;
        this.name = name;
    this.monsterTemplateId = monsterTemplateId;
    }

  public monsterTemplateCommandId: number;
    public command: string;
    public name: string;
  public monsterTemplateId: number;
}
