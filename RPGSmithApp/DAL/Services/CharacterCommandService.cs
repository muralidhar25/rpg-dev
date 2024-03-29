﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Repositories.Interfaces;

namespace DAL.Services
{
    public class CharacterCommandService : ICharacterCommandService
    {
        private readonly IRepository<CharacterCommand> _repo;
        protected readonly ApplicationDbContext _context;

        public CharacterCommandService(ApplicationDbContext context, IRepository<CharacterCommand> repo)
        {
            _repo = repo;
            _context = context;
        }

        public async Task<bool> CheckDuplicateCharacterCommand(string value, int? characterId, int? characterCommandId = 0)
        {
            var items = await _repo.GetAll();
            if (items == null && items.Count == 0) return false;

            var item = items.Where(x => x.CharacterId == characterId && x.CharacterCommandId != characterCommandId && x.IsDeleted != true).FirstOrDefault();
            if (item == null) return false;

            return item.Name == null ? false : (item.Name.ToLower() == value.ToLower() ? true : false);
        }

        public async Task<CharacterCommand> Create(CharacterCommand item)
        {
            return await _repo.Add(item);
        }

        public async Task<bool> Delete(int id)
        {
            // Remove CharacterCommand
            var cc = await _repo.Get(id);

            if (cc == null)
                return false;

            cc.IsDeleted = true;

            try
            {
                _context.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
        public async Task<bool> DeleteByCommandTileId(int id)
        {
            // Remove CharacterCommand
            var charactercommand =  GetByCommandTileId(id);

           
            if (charactercommand == null)
                return false;

            charactercommand.IsDeleted = true;
            charactercommand.CommandTileId = null;
            try
            {
                _context.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
        public List<CharacterCommand> GetByCharacterId(int characterId)
        {
            List<CharacterCommand> characterCommands = _context.CharacterCommands
               .Where(x => x.CharacterId == characterId && x.IsDeleted != true).OrderByDescending(x => x.UpdatedOn).ToList();

            return characterCommands;
        }

        public CharacterCommand GetById(int? id)
        {
            CharacterCommand characterCommand = _context.CharacterCommands
               .Where(x => x.CharacterCommandId == id && x.IsDeleted != true).SingleOrDefault();

            return characterCommand;
        }
        public CharacterCommand GetByCommandTileId(int? commandtileId)
        {
            CharacterCommand characterCommand = _context.CharacterCommands
               .Where(x => x.CommandTileId == commandtileId && x.IsDeleted != true).SingleOrDefault();
            return characterCommand;
        }
          
    public async Task<CharacterCommand> Update(CharacterCommand item)
        {
            CharacterCommand characterCommand = await _repo.Get(item.CharacterCommandId);

            if (characterCommand == null)
                return characterCommand;

            characterCommand.Name = item.Name;
            characterCommand.UpdatedOn = item.UpdatedOn;
            characterCommand.Command = item.Command;


            try
            {
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return characterCommand;
        }
        public async Task<CharacterCommand> UpdateByCommandTile(CharacterCommand item)
        {
            CharacterCommand characterCommand =  GetByCommandTileId(item.CommandTileId);

            if (characterCommand == null)
                return characterCommand;

            characterCommand.Name = item.Name;
            characterCommand.Command = item.Command;
            characterCommand.UpdatedOn = DateTime.Now;

            try
            {
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return characterCommand;
        }

    }
}
