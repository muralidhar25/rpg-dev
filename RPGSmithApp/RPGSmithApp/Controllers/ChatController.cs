// ====================================================
// More Templates: https://www.ebenmonney.com/templates
// Email: support@ebenmonney.com
// ====================================================

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using System.IO;
using NgChatSignalR.Models;
using DAL.Services;
using DAL.Models;

namespace RPGSmithApp.Controllers
{
    [Route("api/[controller]")]
    public class ChatController : Controller
    {
        private readonly ICampaignService _campaignService;
        public ChatController(ICampaignService campaignService)
        {
            this._campaignService = campaignService;
        }
        // Sending the userId from the request body as this is just a demo. 
        // On your application you probably want to fetch this from your authentication context and not receive it as a parameter
        [HttpPost("ListFriends")]
        public IActionResult ListFriends([FromBody] dynamic payload)
        {
            GroupChatHub hub = new GroupChatHub(_campaignService);
               var res = hub.ConnectedParticipants((string)payload.currentUserId);
            return Json(res);

            // Use the following for group chats
            // Make sure you have [pollFriendsList] set to true for this simple group chat example to work as
            // broadcasting with group was not implemented here
            // return Json(GroupChatHub.ConnectedParticipants((string)payload.currentUserId));
        }
        
             [HttpGet("leaveChat")]
        public IActionResult leaveChat([FromBody] dynamic payload,string chatConnectonID)
        {
            GroupChatHub hub = new GroupChatHub(_campaignService);
             hub.offlineParticipant(chatConnectonID);
            return Ok();

            // Use the following for group chats
            // Make sure you have [pollFriendsList] set to true for this simple group chat example to work as
            // broadcasting with group was not implemented here
            // return Json(GroupChatHub.ConnectedParticipants((string)payload.currentUserId));
        }
        [HttpPost("getChatHistory")]
        public IActionResult getChatHistory([FromBody] GroupChatParticipantViewModel payload,string currentUserID)
        {
            List<MessageViewModel> messages = new List<MessageViewModel>();
            if (payload.ParticipantType == ChatParticipantTypeEnum.Group)
            {
                ParticipantResponseViewModel user = GroupChatHub.GetParticipantDetails(currentUserID);
                if (user != null)
                {
                    int campaignId = 0;
                    if (user.Participant.CharacterID > 0)
                    {
                        campaignId = user.Participant.CharacterCampaignID;
                    }
                    else
                    {
                        campaignId = user.Participant.CampaignID;
                    }
                    List<ChatMessage> chatMessages = _campaignService.GetChatMessage(campaignId);
                    IList<ChatParticipantViewModel> participantsPresentInChat = payload.ChattingTo;
                    foreach (var message in chatMessages)
                    {
                        var res1 = participantsPresentInChat
                            .Where(x =>
                            ((x.CharacterID == message.SenderCharacterID && x.CharacterCampaignID == message.CampaignID && x.CampaignID == 0)
                            ||
                            (x.CampaignID == message.CampaignID && x.CharacterID == 0 && x.CharacterCampaignID == 0))
                            &&
                            (x.CharacterID == message.SenderCharacterID && x.CampaignID == message.SenderCampaignID)
                            )
                            .ToList();
                        //if (message.SenderCharacterID>0)
                        //{
                        //    res1 = res1.Where(x => x.CharacterID == message.SenderCharacterID).ToList();
                        //}

                        var res = res1.FirstOrDefault();
                        string fromid = "";
                        if (res == null)
                        {
                            if (user.Participant.CharacterID > 0)
                            {
                                fromid = user.Participant.CharacterID.ToString();
                            }
                            else
                            {
                                fromid = user.Participant.CampaignID.ToString();
                            }
                        }
                        else
                        {
                            fromid = res.Id;
                        }

                        MessageViewModel messageView = new MessageViewModel()
                        {
                            Message = message.Message,
                            DateSent = message.DateSent,
                            Type = 1,
                            FromId = fromid,
                            ToId = payload.Id,
                            IsSystemGenerated = message.IsSystemGenerated
                        };
                        messages.Add(messageView);

                    }
                }
            }
            else if(payload.ParticipantType == ChatParticipantTypeEnum.User)
            {

            }
            
            return Json(messages);

            // Use the following for group chats
            // Make sure you have [pollFriendsList] set to true for this simple group chat example to work as
            // broadcasting with group was not implemented here
            // return Json(GroupChatHub.ConnectedParticipants((string)payload.currentUserId));
        }

        [HttpPost("UploadFile")]
        public async Task<IActionResult> UploadFile(IFormFile file, [FromForm(Name = "ng-chat-participant-id")] string userId)
        {
            // Storing file in temp path
            var filePath = Path.Combine(Path.GetTempPath(), file.FileName);

            if (file.Length > 0)
            {
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
            }

            var baseUri = new Uri($"{Request.Scheme}://{Request.Host}{Request.PathBase}");
            var fileUri = new Uri(baseUri, $"Uploads/{file.FileName}");

            return Ok(new
            {
                type = 2, // MessageType.File = 2
                          //fromId: ngChatSenderUserId, fromId will be set by the angular component after receiving the http response
                toId = userId,
                message = file.FileName,
                mimeType = file.ContentType,
                fileSizeInBytes = file.Length,
                downloadUrl = fileUri.ToString()
            });
        }

        [Route("Uploads/{fileName}")]
        public async Task<IActionResult> Uploads(string fileName)
        {
            var filePath = Path.Combine(Path.GetTempPath(), fileName);

            var memory = new MemoryStream();

            using (var stream = new FileStream(filePath, FileMode.Open))
            {
                if (stream == null)
                    return NotFound();

                await stream.CopyToAsync(memory);
            }

            memory.Position = 0;

            return File(memory, "application/octet-stream");
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

    }
}
