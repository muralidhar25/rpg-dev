using AutoMapper;
using DAL.Core.Interfaces;
using DAL.Models;
using DAL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RPGSmithApp.Helpers;
using RPGSmithApp.ViewModels;
using RPGSmithApp.ViewModels.EditModels;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace RPGSmithApp.Controllers
{

    // [Authorize]
    [Route("api/[controller]")]
    public class SearchController : Controller
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAccountManager _accountManager;
        private readonly ISearchService _searchService;
        private readonly BlobService bs = new BlobService();

        public SearchController(IHttpContextAccessor httpContextAccessor, IAccountManager accountManager,
            ISearchService searchService)
        {
            _httpContextAccessor = httpContextAccessor;
            _accountManager = accountManager;
            _searchService = searchService;
        }

        [HttpGet("SearchCharacter")]
        public async Task<IEnumerable<Character>> SearchCharacter(string q,string userId)
        {
            var list = _searchService.SearchCharacters(q, userId).Result;
            return list;
        }

    }
}
