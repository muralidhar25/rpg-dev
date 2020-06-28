using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Repositories.Interfaces;
using Microsoft.Extensions.Configuration;

namespace DAL.Services
{
    public class MonsterTemplateCommandService : IMonsterTemplateCommandService
    {

        private readonly IRepository<MonsterTemplateCommand> _repo;
        protected readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        public MonsterTemplateCommandService(ApplicationDbContext context, IRepository<MonsterTemplateCommand> repo, 
            IConfiguration configuration)
        {
            _context = context;
            _repo = repo;
            this._configuration = configuration;
        }

        public async  Task<bool> DeleteMonsterTemplateCommand(int id)
        {
            // return await _repo.Remove(id);
            var ac = await  _repo.Get(id);

            if (ac == null)
                return false;

            try
            {

                ac.IsDeleted = true;
                _context.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public bool DeleteMonsterTemplateCommandNotAsync(int id)
        {
           // return _repo.RemoveNotAsync(id);

            var ac = _context.MonsterTemplateCommands.Find(id);

            if (ac == null)
                return false;

            try
            {
                
                ac.IsDeleted = true;
                _context.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
               throw ex;
            }
        }

        public async Task<MonsterTemplateCommand> InsertMonsterTemplateCommand(MonsterTemplateCommand monsterTemplateCommand)
        {
            //try
            //{
            //    string consString = _configuration.GetSection("ConnectionStrings").GetSection("DefaultConnection").Value;
            //    try
            //    {
            //        using (SqlConnection con = new SqlConnection(consString))
            //        {
            //            using (SqlCommand cmd = new SqlCommand("InsertMonsterTemplateCommands"))
            //            {
            //                cmd.CommandType = CommandType.StoredProcedure;
            //                cmd.Connection = con;
            //                cmd.Parameters.AddWithValue("@Command", monsterTemplateCommand.Command);
            //                cmd.Parameters.AddWithValue("@Name", monsterTemplateCommand.Name);
            //                cmd.Parameters.AddWithValue("@MonsterTemplateId", monsterTemplateCommand.MonsterTemplateId);
            //                cmd.Parameters.AddWithValue("@IsDeleted", monsterTemplateCommand.IsDeleted);
            //                con.Open();
            //                var res= cmd.ExecuteScalar();
            //                int commandId = Convert.ToInt32(res);
            //                monsterTemplateCommand.MonsterTemplateCommandId = commandId;
            //                con.Close();
            //            }
            //        }
            //    }
            //    catch (Exception ex)
            //    {
            //        throw ex;
            //    }
            //    //await _context.MonsterTemplateCommands.AddAsync(new MonsterTemplateCommand() {
            //    //    Command= monsterTemplateCommand.Command,
            //    //    IsDeleted=monsterTemplateCommand.IsDeleted,
            //    //    MonsterTemplateId= monsterTemplateCommand.MonsterTemplateId,
            //    //    Name= monsterTemplateCommand.Name,
            //    //});// _repo.Add(itemMasterCommand);
            //    //await _context.SaveChangesAsync();
            //    return monsterTemplateCommand;
            //    //_context.MonsterTemplateCommands.Add(monsterTemplateCommand);
            //    //_context.SaveChanges();
            //    //return monsterTemplateCommand;
            //}
            //catch (Exception ex)
            //{
            //    return monsterTemplateCommand;
            //    // throw;
            //}
            try
            {
                return await _repo.Add(monsterTemplateCommand);
            }
            catch (Exception ex)
            {

                throw;
            }
            
        }

        public async Task<MonsterTemplateCommand> InsertMonsterTemplateCommandImport(MonsterTemplateCommand monsterTemplateCommand)
        {           
            try
            {                
                return await _repo.Add(monsterTemplateCommand);
            }
            catch (Exception ex)
            {

                throw;
            }
            
        }

        public async Task<MonsterTemplateCommand> UdateMonsterTemplateCommand(MonsterTemplateCommand monsterTemplateCommand)
        {
            var ac = _context.MonsterTemplateCommands.Find(monsterTemplateCommand.MonsterTemplateCommandId);

            if (ac == null)
                return monsterTemplateCommand;
            try
            {
                ac.Command = monsterTemplateCommand.Command;
                ac.Name = monsterTemplateCommand.Name;
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return ac;
        }
        public async Task DeleteMonsterTemplateAllCommands(int monsterTemplateId) {
            _context.MonsterTemplateCommands.RemoveRange(_context.MonsterTemplateCommands.Where(x => x.MonsterTemplateId == monsterTemplateId));
            await _context.SaveChangesAsync();
        }
    }
}
