using DAL.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
    public interface ICharacterStatTypeService
    {
        List<CharacterStatType> GetCharacterStatTypeList();
    }
}
