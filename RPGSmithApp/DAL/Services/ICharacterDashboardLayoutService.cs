using DAL.Models;
using RPGSmithApp.ViewModels.EditModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
   public interface ICharacterDashboardLayoutService
    {
         CharacterDashboardLayout GetById(int? id);
        Task<CharacterDashboardLayout> Create(CharacterDashboardLayout item);
        Task<CharacterDashboardLayout> Update(CharacterDashboardLayout item);
        Task<bool> Delete(int id);
        //List<CharacterDashboardLayout> GetByCharacterId(int characterId, int page, int pageSize);
        Task<List<CharacterDashboardLayout>> GetByCharacterId(int characterId, int page = -1, int pageSize = -1);
        int GetCountByCharacterId(int characterId);
        int GetMaximumSortOrdertByCharacterId(int? characterId);
        Task<bool> CheckDuplicate(string value, int? characterId, int? Id = 0);
        void SetDefaultPage(int Id,int PageId);
        void UpdateSortOrder(List<SortOrderEditModel> sortOrderList);
        void UpdateDefaultLayout(int layoutId);
        void UpdateDefaultLayoutPage(int layoutId, int pageId);
    }
}
