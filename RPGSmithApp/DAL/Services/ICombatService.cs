using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Models.SPModels;
using NgChatSignalR.Models;

namespace DAL.Services
{
    public interface ICombatService
    {
      Task <Combat_ViewModel> GetCombatDetails(int CampaignId, string UserID);
        Task<CombatSetting> UpdateSettings(CombatSetting model);
    }
}
