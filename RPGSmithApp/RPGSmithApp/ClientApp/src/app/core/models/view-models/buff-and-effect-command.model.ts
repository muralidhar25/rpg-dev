import { VIEW } from '../enums';

export class BuffAndEffectCommand {
  constructor(buffAndEffectCommandId?: number, command?: string, name?: string, buffAndEffectId?: number) {
    this.buffAndEffectCommandId = buffAndEffectCommandId;
        this.command = command;
        this.name = name;
    this.buffAndEffectId = buffAndEffectId;
    }

  public buffAndEffectCommandId: number;
    public command: string;
    public name: string;
  public buffAndEffectId: number;
}
