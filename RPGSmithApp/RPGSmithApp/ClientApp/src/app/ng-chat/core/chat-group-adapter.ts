import { Group } from "./group";
import { Observable } from "rxjs";
import { Message } from "./message";

export interface IChatGroupAdapter
{
    groupCreated(group: Group): void;
  getMessageHistory(participant: any): Observable<Message[]>;
}
