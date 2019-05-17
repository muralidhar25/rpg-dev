using DAL.Models;
using DAL.Services;
using Microsoft.AspNetCore.SignalR;
using NgChatSignalR.Models;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class GroupChatHub : Hub
{
    private readonly ICampaignService _campaignService;
    public GroupChatHub(ICampaignService campaignService)
    {
        this._campaignService = campaignService;
        if (AllConnectedParticipants.Count==0)
        {
            AllConnectedParticipants = _campaignService.getChatParticipantList();// new List<ParticipantResponseViewModel>();
        }
       
    }
    private static List<ParticipantResponseViewModel> AllConnectedParticipants { get; set; } = new List<ParticipantResponseViewModel>();
    private static List<ParticipantResponseViewModel> DisconnectedParticipants { get; set; } = new List<ParticipantResponseViewModel>();
    private static List<GroupChatParticipantViewModel> AllGroupParticipants { get; set; } = new List<GroupChatParticipantViewModel>();
    private object ParticipantsConnectionLock = new object();

    private static IEnumerable<ParticipantResponseViewModel> FilteredGroupParticipants(string currentUserId)
    {
        var res= AllConnectedParticipants
            .Where(p => p.Participant.ParticipantType == ChatParticipantTypeEnum.User 
                   || AllGroupParticipants.Any(g => g.Id == p.Participant.Id && g.ChattingTo.Any(u => u.Id == currentUserId))
            );
        return res;
    }

    public static IEnumerable<ParticipantResponseViewModel> ConnectedParticipants(string currentUserId)
    {
        return FilteredGroupParticipants(currentUserId).Where(x => x.Participant.Id != currentUserId);
    }
    public static ParticipantResponseViewModel GetParticipantDetails(string currentUserId)
    {
        return AllConnectedParticipants.Where(x => x.Participant.Id == currentUserId).FirstOrDefault();
    }

    public void Join(UserModel user)
    {
        lock (ParticipantsConnectionLock)
        {
            //try
            //{
            //    if (Convert.ToInt32(user.id) > 0)
            //    {
            //        user.id = user.CharacterId;
            //    }
            //}
            //catch (Exception ex) {

            //}

            //AllConnectedParticipants.Remove(AllConnectedParticipants.Where(x => x.Participant.Id == user.id).FirstOrDefault());
            ParticipantResponseViewModel model =null;
            if (user.CharacterID>0)
            {
                model = AllConnectedParticipants.Where(x => x.Participant.CharacterID == user.CharacterID).FirstOrDefault();
            }
            else if (user.CampaignID > 0)
            {
                model = AllConnectedParticipants.Where(x => x.Participant.CampaignID == user.CampaignID).FirstOrDefault();
                //model.Participant.DisplayName = model.Participant.UserDisplayName;
                //model.Participant.Avatar = model.Participant.UserAvatar;
            }
            if (model != null)
            {
                model.Participant.Id = Context.ConnectionId;
                model.IsConnectionIDProvided = true;
                model.Participant.Status = 0;
            }
            else {
                AllConnectedParticipants.Add(new ParticipantResponseViewModel()
                {
                    Metadata = new ParticipantMetadataViewModel()
                    {
                        TotalUnreadMessages = 0
                    },
                    Participant = new ChatParticipantViewModel()
                    {
                        DisplayName = user.userName,
                        Id = Context.ConnectionId,
                        Avatar = user.profileImage,
                        Status = 0
                    },
                    IsConnectionIDProvided = true
                });
            }
            

            // This will be used as the user's unique ID to be used on ng-chat as the connected user.
            // You should most likely use another ID on your application
            Clients.Caller.SendAsync("generatedUserId", Context.ConnectionId);
            Clients.All.SendAsync("friendsListChanged", AllConnectedParticipants);
        }
    }

    public void GroupCreated(GroupChatParticipantViewModel group)
    {
        AllGroupParticipants.Add(group);

        // Pushing the current user to the "chatting to" list to keep track of who's created the group as well.
        // In your application you'll probably want a more sofisticated group persistency and management
        ChatParticipantViewModel currenUserToAddInChat = new ChatParticipantViewModel()
        {
            Id = Context.ConnectionId
        };
        var rec = AllConnectedParticipants.Where(x => x.Participant.Id == Context.ConnectionId).FirstOrDefault();
        if (rec!=null)
        {
            group.CampaignID = rec.Participant.CampaignID;
            group.CharacterCampaignID = rec.Participant.CharacterCampaignID;
            group.CharacterID = rec.Participant.CharacterID;

            currenUserToAddInChat.Avatar = rec.Participant.Avatar;
            currenUserToAddInChat.CampaignID = rec.Participant.CampaignID;
            currenUserToAddInChat.CharacterCampaignID = rec.Participant.CharacterCampaignID;
            currenUserToAddInChat.CharacterID = rec.Participant.CharacterID;
            currenUserToAddInChat.DisplayName = rec.Participant.DisplayName;
            currenUserToAddInChat.ParticipantType = rec.Participant.ParticipantType;
            currenUserToAddInChat.UserId = rec.Participant.UserId;
            currenUserToAddInChat.Status = rec.Participant.Status;
        }
        
        group.ChattingTo.Add(currenUserToAddInChat);

        AllConnectedParticipants.Add(new ParticipantResponseViewModel()
        {
            Metadata = new ParticipantMetadataViewModel()
            {
                TotalUnreadMessages = 0
            },
            Participant = group
        });

        Clients.All.SendAsync("friendsListChanged", AllConnectedParticipants);
    }

    public void SendMessage(MessageViewModel message)
    {
        var sender = AllConnectedParticipants.Find(x => x.Participant.Id == message.FromId);

        
        if (sender != null)
        {
            var groupDestinatary = AllGroupParticipants.Where(x => x.Id == message.ToId).FirstOrDefault();

            if (groupDestinatary != null)
            {
                // Notify all users in the group except the sender
                var usersInGroupToNotify = AllConnectedParticipants
                                           .Where(p => p.Participant.Id != sender.Participant.Id
                                                  && groupDestinatary.ChattingTo.Any(g => g.Id == p.Participant.Id)
                                           )
                                           .Select(g => g.Participant.Id);

                var MessageSender = AllConnectedParticipants.Where(x => x.Participant.Id == message.FromId).FirstOrDefault();
                if (MessageSender != null)
                {
                    var ChatMessageModel = new ChatMessage()
                    {
                        Message = message.Message,
                        DateSent = DateTime.UtcNow,
                        IsSystemGenerated=message.IsSystemGenerated,
                    };
                    if (MessageSender.Participant.CharacterID > 0)
                    {
                        ChatMessageModel.CampaignID = MessageSender.Participant.CharacterCampaignID;
                        ChatMessageModel.SenderCharacterID = MessageSender.Participant.CharacterID;
                    }
                    else
                    {
                        ChatMessageModel.CampaignID = MessageSender.Participant.CampaignID;
                        ChatMessageModel.SenderCampaignID = MessageSender.Participant.CampaignID;
                    }
                    try
                    {
                        _campaignService.SaveChatMessage(ChatMessageModel);
                    }
                    catch (Exception ex)
                    {

                    }

                }

                Clients.Clients(usersInGroupToNotify.ToList()).SendAsync("messageReceived", groupDestinatary, message);
                

            }
            else
            {
                //GroupChatHub.AllConnectedParticipants
                Clients.Client(message.ToId).SendAsync("messageReceived", sender.Participant, message);
                //message.Message = message.Message + "--broadcast";
                //Clients.All.SendAsync("messageReceived", sender.Participant, message);
            }
        }
    }

    public override Task OnDisconnectedAsync(Exception exception)
    {
        lock (ParticipantsConnectionLock)
        {
            var connectionIndex = AllConnectedParticipants.FindIndex(x => x.Participant.Id == Context.ConnectionId);

            if (connectionIndex >= 0)
            {
                var participant = AllConnectedParticipants.ElementAt(connectionIndex);

                var groupsParticipantIsIn = AllGroupParticipants.Where(x => x.ChattingTo.Any(u => u.Id == participant.Participant.Id));

                //AllConnectedParticipants.RemoveAll(x => groupsParticipantIsIn.Any(g => g.Id == x.Participant.Id));
                //AllGroupParticipants.RemoveAll(x => groupsParticipantIsIn.Any(g => g.Id == x.Id));

                //AllConnectedParticipants.Remove(participant);
                DisconnectedParticipants.Add(participant);

                Clients.All.SendAsync("friendsListChanged", AllConnectedParticipants);
            }

            return base.OnDisconnectedAsync(exception);
        }
    }

    public override Task OnConnectedAsync()
    {
        lock (ParticipantsConnectionLock)
        {
            var connectionIndex = DisconnectedParticipants.FindIndex(x => x.Participant.Id == Context.ConnectionId);

            if (connectionIndex >= 0)
            {
                var participant = DisconnectedParticipants.ElementAt(connectionIndex);

                DisconnectedParticipants.Remove(participant);
                AllConnectedParticipants.Add(participant);

                Clients.All.SendAsync("friendsListChanged", AllConnectedParticipants);
            }

            return base.OnConnectedAsync();
        }
    }
}
