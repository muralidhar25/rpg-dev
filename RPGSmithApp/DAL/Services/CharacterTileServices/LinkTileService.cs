﻿using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Models.CharacterTileModels;
using DAL.Repositories.Interfaces;

namespace DAL.Services.CharacterTileServices
{
    public class LinkTileService : ILinkTileService
    {
          private readonly IRepository<CharacterLinkTile> _repo;
        protected readonly ApplicationDbContext _context;


        public LinkTileService(ApplicationDbContext context, IRepository<CharacterLinkTile> repo)
        {
            _repo = repo;
            _context = context;

        }

        public CharacterLinkTile GetById(int? id)
        {
            throw new NotImplementedException();
        }

        public async Task<CharacterLinkTile> Create(CharacterLinkTile item)
        {
            return await _repo.Add(item);
        }

        public async Task<CharacterLinkTile> Update(CharacterLinkTile item)
        {
            var linktile = await _repo.Get((int)item.LinkTileId);

            if (linktile == null)
                return linktile;

            linktile.ShowTitle = item.ShowTitle;
            linktile.DisplayLinkImage = item.DisplayLinkImage;
            linktile.LinkType = item.LinkType;
            linktile.AbilityId = item.AbilityId ;
            linktile.BuffAndEffectId = item.BuffAndEffectId ;
            linktile.SpellId = item.SpellId;
            linktile.ItemId = item.ItemId;
            linktile.AllyId = item.AllyId;

            //linktile.Color = item.Color;
            //linktile.BgColor = item.BgColor;
            linktile.BodyBgColor = item.BodyBgColor;
            linktile.BodyTextColor = item.BodyTextColor;
            linktile.TitleBgColor = item.TitleBgColor;
            linktile.TitleTextColor = item.TitleTextColor;
            linktile.Shape = item.Shape;
            linktile.SortOrder = item.SortOrder;
            linktile.IsManual = item.IsManual;
            linktile.FontSize = item.FontSize;
            linktile.FontSizeTitle = item.FontSizeTitle;
            try
            {
                await _repo.Update(linktile);
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return linktile;
        }

        public Task<bool> Delete(int id)
        {
            throw new NotImplementedException();
        }
    }
}
