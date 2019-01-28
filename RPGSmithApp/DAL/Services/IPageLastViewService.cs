using DAL.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
  public interface IPageLastViewService
    {
        PageLastView GetByUserIdPageName(string userId,string pageName);
        List<PageLastView> GetAllByUserId(string userId);
        Task<PageLastView> Create(PageLastView pageLastView);
        Task<PageLastView> Update(PageLastView pageLastView);
        Task<bool> CheckDuplicatePageLastView(string pageName, string userId, int? pageLastViewId = 0);
        void TogglePageLastView(int Id);
        Task<PageLastView> UpdateByPage(PageLastView pageLastView);
    }
}
