using DAL.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
    public interface IContainerService
    {
        List<Container> GetByCharacterId(int characterId);

        List<Container> GetByContainerItemId(int itemId);

        List<Container> GetByCharacterId(int characterId, int page, int pageSize);

        Container GetById(int? id);

         Container GetContainerbyItemId(int itemId);

        Task<Container> InsertContainer(Container container);

        Task<Container> UpdateContainer(Container container);

        int GetCountByCharacterId(int characterId);

        Task<bool> DeleteContainer(int id);

        bool DeleteContainerNotAsync(int id);

        Task<bool> DeleteContainerByItemId(int itemId);

    }
}
