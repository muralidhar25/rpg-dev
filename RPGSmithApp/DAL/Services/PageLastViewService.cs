using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Repositories.Interfaces;

namespace DAL.Services
{
    public class PageLastViewService : IPageLastViewService
    {
        private readonly IRepository<PageLastView> _repo;
        protected readonly ApplicationDbContext _context;

        public PageLastViewService(IRepository<PageLastView> repo, ApplicationDbContext context)
        {
            this._repo = repo;
            this._context = context;
        }

        public async Task<PageLastView> Create(PageLastView pageLastView)
        {
            return await _repo.Add(pageLastView);
        }

        public List<PageLastView> GetAllByUserId(string userId)
        {
            return _context.PageLastViews.Where(x => x.UserId == userId).ToList();
        }

        public PageLastView GetByUserIdPageName(string userId, string pageName)
        {
            var _pageLastView = _context.PageLastViews.Where(x => x.PageName == pageName && x.UserId == userId).FirstOrDefault();
            if (_pageLastView == null)
            {
                _pageLastView = new PageLastView
                {
                    PageName = pageName,
                    UserId = userId,
                    ViewType = "Grid"
                };
               _repo.Add(_pageLastView);
            }

            return _pageLastView;
        }

        public void TogglePageLastView(int Id)
        {
            throw new NotImplementedException();
        }

        public async Task<PageLastView> Update(PageLastView pageLastView)
        {
            var plv = await _repo.Get(pageLastView.PageLastViewId);

            if (plv == null)
                return plv;

            plv.PageName = pageLastView.PageName;
            plv.ViewType = pageLastView.ViewType;

            try
            {
                plv =await _repo.Update(plv);  
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return plv;
        }

        public async Task<PageLastView> UpdateByPage(PageLastView pageLastView)
        {
            var _pageLastView = _context.PageLastViews.Where(x => x.PageName == pageLastView.PageName && x.UserId == pageLastView.UserId).FirstOrDefault();

            if (_pageLastView == null)
                return _pageLastView;

            _pageLastView.PageName = pageLastView.PageName;
            _pageLastView.ViewType = pageLastView.ViewType;

            try
            {
                _pageLastView = await _repo.Update(_pageLastView);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return _pageLastView;
        }

        public async Task<bool> CheckDuplicatePageLastView(string pageName, string userId, int? pageLastViewId = 0)
        {
            var items = _repo.GetAll();
            if (items.Result == null || items.Result.Count == 0) return false;         
                return items.Result.Where(x => x.PageName.ToLower() == pageName.ToLower() && x.UserId == userId && x.PageLastViewId != pageLastViewId ).FirstOrDefault() == null ? false : true;
           
        }
    }
}
