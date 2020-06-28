import { Guid } from "./guid";
import { User } from "./user";
import { ChatParticipantStatus } from "./chat-participant-status.enum";
import { IChatParticipant } from "./chat-participant";
import { ChatParticipantType } from "./chat-participant-type.enum";

export class Group implements IChatParticipant
{
  constructor(participants: User[], grpName, imageUrl) {
    this.chattingTo = participants;
    this.status = ChatParticipantStatus.Online;

    // TODO: Add some customization for this in future releases
    this.displayName = participants.map((p) => p.displayName).sort((first, second) => second > first ? -1 : 1).join(", ");
    if (grpName) {
      this.displayName = grpName;
    }
    if (imageUrl) {
      this.avatar = imageUrl;
    }
  }

    public id: string = Guid.newGuid();
    public chattingTo: User[];

    public readonly participantType: ChatParticipantType = ChatParticipantType.Group;

    public status: ChatParticipantStatus;
    public avatar: string | null;
    public displayName: string;
}
