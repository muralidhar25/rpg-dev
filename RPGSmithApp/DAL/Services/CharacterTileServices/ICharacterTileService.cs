using DAL.Models.CharacterTileModels;
using DAL.Models.SPModels;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services.CharacterTileServices
{
    public interface ICharacterTileService
    {
        CharacterTile GetById(int? id);
        Task<CharacterTile> Create(CharacterTile item);
        Task<CharacterTile> Update(CharacterTile item);
        Task<bool> Delete(int id);
        List<CharacterTile> GetByPageIdCharacterId(int pageId, int characterId);
        int GetCountByPageIdCharacterId(int pageId, int characterId);
        Task<CharacterTile> UpdateSortOrder(int id, int sortOrder);
        List<CharacterTile> GetByPageIdCharacterId_sp(int pageId, int characterId);
        SP_CharactersCharacterStat GetCharactersCharacterStats_sp(int characterId);
    }
}
