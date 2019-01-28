using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Models.RulesetTileModels;
using DAL.Repositories.Interfaces;

namespace DAL.Services.RulesetTileServices
{
    public class RulesetTextTileService : IRulesetTextTileService
    {
        private readonly IRepository<RulesetTextTile> _repo;
        protected readonly ApplicationDbContext _context;


        public RulesetTextTileService(ApplicationDbContext context, IRepository<RulesetTextTile> repo)
        {
            _repo = repo;
            _context = context;

        }

        public async Task<RulesetTextTile> Create(RulesetTextTile item)
        {
            return await _repo.Add(item);
        }

        public Task<bool> Delete(int id)
        {
            throw new NotImplementedException();
        }

        //public RulesetImageTile GetById(int? id)
        //{
        //    throw new NotImplementedException();
        //}

        public async Task<RulesetTextTile> Update(RulesetTextTile item)
        {

            var textTile = await _repo.Get((int)item.TextTileId);

            if (textTile == null)
                return textTile;

            textTile.Text = item.Text;
            textTile.Title = item.Title;

            //imagetile.Color = item.Color;
            //imagetile.BgColor = item.BgColor;
            textTile.BodyBgColor = item.BodyBgColor;
            textTile.BodyTextColor = item.BodyTextColor;
            textTile.TitleBgColor = item.TitleBgColor;
            textTile.TitleTextColor = item.TitleTextColor;
            textTile.Shape = item.Shape;
            textTile.SortOrder = item.SortOrder;
            try
            {
                await _repo.Update(textTile);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return textTile;
        }
    }
}
