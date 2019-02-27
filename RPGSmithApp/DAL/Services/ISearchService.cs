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
using DAL.Models.SPModels;

namespace DAL.Services
{
    public interface ISearchService
    {
        Task<List<Character>> SearchCharacters(string query, string userId);
       SearchFilter getFilters(SearchModel searchModel);
    }
}
