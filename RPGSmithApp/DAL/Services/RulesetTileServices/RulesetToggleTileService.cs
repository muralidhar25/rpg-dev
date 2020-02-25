using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Models.RulesetTileModels;
using DAL.Repositories.Interfaces;

namespace DAL.Services.RulesetTileServices
{
    public class RulesetToggleTileService : IRulesetToggleTileService
    {
        private readonly IRepository<RulesetToggleTile> _repo;
        protected readonly ApplicationDbContext _context;


        public RulesetToggleTileService(ApplicationDbContext context, IRepository<RulesetToggleTile> repo)
        {
            _repo = repo;
            _context = context;

        }

        public async Task<RulesetToggleTile> Create(RulesetToggleTile item)
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

        public async Task<RulesetToggleTile> Update(RulesetToggleTile item)
        {

            var toggleTile = await _repo.Get((int)item.ToggleTileId);

            if (toggleTile == null)
                return toggleTile;

           // toggleTile.Text = item.Text;
            toggleTile.Title = item.Title;

            //imagetile.Color = item.Color;
            //imagetile.BgColor = item.BgColor;
            toggleTile.BodyBgColor = item.BodyBgColor;
            toggleTile.BodyTextColor = item.BodyTextColor;
            toggleTile.TitleBgColor = item.TitleBgColor;
            toggleTile.TitleTextColor = item.TitleTextColor;
            toggleTile.Shape = item.Shape;
            toggleTile.SortOrder = item.SortOrder;
            toggleTile.IsManual = item.IsManual;
            toggleTile.FontSize = item.FontSize;
            try
            {
                await _repo.Update(toggleTile);
                var toggles = _context.TileToggles.Where(x => x.TileToggleId == toggleTile.TileToggleId && x.IsDeleted != true).FirstOrDefault();
                if (toggles != null)
                {
                    toggles.Display = item.TileToggle.Display;
                    toggles.IsCustom = item.TileToggle.IsCustom;
                    toggles.OnOff = item.TileToggle.OnOff;
                    toggles.ShowCheckbox = item.TileToggle.ShowCheckbox;
                    toggles.YesNo = item.TileToggle.YesNo;


                    _context.TileCustomToggles.RemoveRange(_context.TileCustomToggles.Where(x => x.TileToggleId == toggles.TileToggleId && x.IsDeleted != true));
                    _context.SaveChanges();
                    if (item.TileToggle.IsCustom && item.TileToggle.TileCustomToggles.Count > 0)
                    {
                        var records = item.TileToggle.TileCustomToggles.Select(x => new TileCustomToggle()
                        {
                            Image = x.Image,
                            TileToggleId = toggles.TileToggleId,
                            ToggleText = x.ToggleText,

                        });
                        _context.TileCustomToggles.AddRange(records);
                        _context.SaveChanges();
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return toggleTile;
        }
        public async Task updateRulesetToggleTileValues(RulesetToggleTile model)
        {
            var toggleTile = _context.RulesetToggleTiles.Where(x => x.ToggleTileId == model.ToggleTileId).FirstOrDefault();
            if (toggleTile != null)
            {
                toggleTile.YesNo = model.YesNo;
                toggleTile.OnOff = model.OnOff;
                toggleTile.CheckBox = model.CheckBox;
                toggleTile.CustomValue = model.CustomValue;

                await _context.SaveChangesAsync();
            }
        }
    }
}
