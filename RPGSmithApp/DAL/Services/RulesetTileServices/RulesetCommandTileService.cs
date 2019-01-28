using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Models.RulesetTileModels;
using DAL.Repositories.Interfaces;

namespace DAL.Services.RulesetTileServices
{
    public class RulesetCommandTileService : IRulesetCommandTileService
    {
        private readonly IRepository<RulesetCommandTile> _repo;
        protected readonly ApplicationDbContext _context;


        public RulesetCommandTileService(ApplicationDbContext context, IRepository<RulesetCommandTile> repo)
        {
            _repo = repo;
            _context = context;

        }

        public async  Task<RulesetCommandTile> Create(RulesetCommandTile item)
        {
            return await _repo.Add(item);
        }

        public Task<bool> Delete(int id)
        {
            throw new NotImplementedException();
        }

        public RulesetCommandTile GetById(int? id)
        {
            throw new NotImplementedException();
        }

        public async Task<RulesetCommandTile> Update(RulesetCommandTile item)
        {

            var ctile = await _repo.Get((int)item.CommandTileId);

            if (ctile == null)
                return ctile;

            ctile.Command = item.Command;
            ctile.Title = item.Title;
            ctile.ImageUrl = item.ImageUrl;

            //ctile.Color = item.Color;
            //ctile.BgColor = item.BgColor;
            ctile.BodyBgColor = item.BodyBgColor;
            ctile.BodyTextColor = item.BodyTextColor;
            ctile.TitleBgColor = item.TitleBgColor;
            ctile.TitleTextColor = item.TitleTextColor;
            ctile.Shape = item.Shape;
            ctile.SortOrder = item.SortOrder;

            try
            {
                await _repo.Update(ctile);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return ctile;
        }
    }
}
