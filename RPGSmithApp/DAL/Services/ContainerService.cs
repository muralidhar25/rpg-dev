using DAL.Models;
using DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
    public class ContainerService : IContainerService
    {
        private readonly IRepository<Container> _repo;
        protected readonly ApplicationDbContext _context;

        public ContainerService(ApplicationDbContext context, IRepository<Container> repo)
        {
            _context = context;
            _repo = repo;
        }

        public List<Container> GetByCharacterId(int characterId)
        {
            return _context.Containers.Where(x => x.CharacterId == characterId && x.IsDeleted!=true).ToList();
        }

        public List<Container> GetByContainerItemId(int itemId)
        {
            return _context.Containers.Where(x => x.ItemId == itemId && x.IsDeleted != true).ToList();
        }

        public List<Container> GetByCharacterId(int characterId, int page, int pageSize)
        {
            return _context.Containers
                .Where(x => x.CharacterId == characterId && x.IsDeleted != true).Skip(pageSize * (page - 1)).Take(pageSize).ToList();
        }

        public Container GetById(int? id)
        {
            return _context.Containers.FirstOrDefault(x => x.ContainerId == id && x.IsDeleted != true);
        }

        public async Task<Container> InsertContainer(Container container)
        {
            await _repo.Add(container);
            return container;
        }

        public async Task<Container> UpdateContainer(Container container)
        {
            var containerObj = _context.Containers.Find(container.ContainerId);
            try
            {
                if (containerObj == null) return containerObj;

                containerObj.ContainerId = container.ContainerId;
                containerObj.ItemId = container.ItemId;
                containerObj.CharacterId = container.CharacterId;

                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return containerObj;
        }

        public int GetCountByCharacterId(int characterId)
        {
            return _context.Containers.Where(x => x.CharacterId == characterId && x.IsDeleted != true).Count();
        }

        public async Task<bool> DeleteContainer(int id)
        {

            var con = await _repo.Get(id);

            if (con == null)
                return false;

                con.IsDeleted = true;

            try
            {
                _context.SaveChanges();
                return true;
            }
            catch(Exception ex)
            {
                throw ex;
            }
          
        }

        public async Task<bool> DeleteContainerByItemId(int itemId)
        {
          var containers=_context.Containers.Where(x => x.ItemId == itemId && x.IsDeleted!=true);

            foreach(Container con in containers)
            {
                con.IsDeleted = true;
            }

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

        public bool DeleteContainerNotAsync(int id)
        {
            var con = _context.Containers.Where(x => x.ContainerId == id).SingleOrDefault();

            if (con == null)
                return false;

            con.IsDeleted = true;

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

        public Container GetContainerbyItemId(int itemId)
        {
            return _context.Containers.Where(x => x.ItemId == itemId && x.IsDeleted!=true).SingleOrDefault();
        }
    }
}
