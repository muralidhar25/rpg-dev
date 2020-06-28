using DAL.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
   public interface ITileTypeService
    {
        TileType GetById(int? id);
        Task<TileType> Create(TileType item);
        Task<TileType> Update(TileType item);
        Task<bool> Delete(int id);
        List<TileType> GetAll();
        int GetCount();
        Task<bool> CheckDuplicate(string value, int? Id = 0);

    }
}
