using System;
using System.Collections.Generic;
using System.Text;
using DAL.Models;
using DAL.Repositories.Interfaces;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using DAL.Repositories;
using System.Linq.Expressions;

namespace DAL.Services
{
    public class CharacterStatTypeService: ICharacterStatTypeService
    {
        private readonly IRepository<CharacterStatType> _repo;
        protected readonly ApplicationDbContext _context;

        public CharacterStatTypeService(ApplicationDbContext context, IRepository<CharacterStatType> repo)
        {
            _context = context;
            _repo = repo;
        }

        public List<CharacterStatType> GetCharacterStatTypeList()
        {
            return _repo.GetList();
        }
    }
}
