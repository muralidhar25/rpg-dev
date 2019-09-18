using DAL.Models;
using RPGSmithApp.ViewModels.EditModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
   public  interface ICharacterDashboardPageService
    {
        CharacterDashboardPage GetById(int? id);
        Task<CharacterDashboardPage> Create(CharacterDashboardPage item);
        Task<CharacterDashboardPage> Update(CharacterDashboardPage item);
        Task<bool> Delete(int id);
        List<CharacterDashboardPage> GetByCharacterId(int characterId);
        List<CharacterDashboardPage> GetByLayoutId(int layoutId, int page = 1, int pageSize = 10);
        int GetCountByCharacterId(int characterId);
        int GetCountByLayoutId(int characterId);
        int GetMaximumSortOrdertByLayoutId(int? layoutId);
        Task<bool> CheckDuplicate(string value, int? characterId, int? layoutId, int? Id = 0);
        void UpdateSortOrder(List<SortOrderEditModel> sortOrderList);
        void Create_sp(CharacterDashboardPage characterDashboardPage, string UserID);
    }
}
