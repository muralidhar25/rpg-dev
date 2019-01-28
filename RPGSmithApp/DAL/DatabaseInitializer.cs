// ====================================================
// More Templates: https://www.ebenmonney.com/templates
// Email: support@ebenmonney.com
// ====================================================

using DAL.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Core;
using DAL.Core.Interfaces;

namespace DAL
{
    public interface IDatabaseInitializer
    {
        Task SeedAsync();
    }




    public class DatabaseInitializer : IDatabaseInitializer
    {
        private readonly ApplicationDbContext _context;
        private readonly IAccountManager _accountManager;
        private readonly ILogger _logger;

        public DatabaseInitializer(ApplicationDbContext context, IAccountManager accountManager, ILogger<DatabaseInitializer> logger)
        {
            _accountManager = accountManager;
            _context = context;
            _logger = logger;
        }

        public async Task SeedAsync()
        {
            await _context.Database.MigrateAsync().ConfigureAwait(false);

            if (!await _context.Users.AnyAsync())
            {
                _logger.LogInformation("Generating inbuilt accounts");

                const string adminRoleName = "administrator";
                const string userRoleName = "user";

                await EnsureRoleAsync(adminRoleName, "Default administrator", ApplicationPermissions.GetAllPermissionValues());
                await EnsureRoleAsync(userRoleName, "Default user", new string[] { });

                await CreateUserAsync("admin", "Admin@123", "Inbuilt Administrator", "admin@ebenmonney.com", "+1 (123) 000-0000", new string[] { adminRoleName });
                await CreateUserAsync("user", "tempP@ss123", "Inbuilt Standard User", "user@ebenmonney.com", "+1 (123) 000-0001", new string[] { userRoleName });
                //await CreateUserAsync("admin", "tempP@ss123", "Inbuilt Administrator", "admin@ebenmonney.com", "+1 (123) 000-0000", new string[] { adminRoleName });
                //await CreateUserAsync("user", "tempP@ss123", "Inbuilt Standard User", "user@ebenmonney.com", "+1 (123) 000-0001", new string[] { userRoleName });

                _logger.LogInformation("Inbuilt account generation completed");
            }

            if (!await _context.DefaultDices.AnyAsync())
            {
                List<DefaultDice> defaultDices = new List<DefaultDice>();
                defaultDices.Add(new DefaultDice() { Name = "D4", Icon= "icon-d4-thin" });
                defaultDices.Add(new DefaultDice() { Name = "D6",  Icon= "icon-d6-thin" });
                defaultDices.Add(new DefaultDice() { Name = "D8",  Icon= "icon-d8-thin" });
                defaultDices.Add(new DefaultDice() { Name = "D10", Icon= "icon-d10-thin" });
                defaultDices.Add(new DefaultDice() { Name = "D12", Icon= "icon-d12-thin" });
                defaultDices.Add(new DefaultDice() { Name = "D20", Icon = "icon-d20-thin" });
                defaultDices.Add(new DefaultDice() { Name = "D100", Icon = "icon-d100-thin" });
                _context.DefaultDices.AddRange(defaultDices);
                await _context.SaveChangesAsync();
            }
            if (!await _context.ConditionOperators.AnyAsync())
            {
                List<ConditionOperator> conditionOperators = new List<ConditionOperator>();
                conditionOperators.Add(new ConditionOperator() { IsNumeric=false, Symbol = "==", Name = "Equals" });
                conditionOperators.Add(new ConditionOperator() { IsNumeric=false, Symbol = "!=", Name = "Not equals" });
                conditionOperators.Add(new ConditionOperator() { IsNumeric=false, Symbol = "", Name = "Is blank" });
                conditionOperators.Add(new ConditionOperator() { IsNumeric=false, Symbol = "", Name = "Is not blank" });
                conditionOperators.Add(new ConditionOperator() { IsNumeric=false, Symbol = "", Name = "Contains" });
                conditionOperators.Add(new ConditionOperator() { IsNumeric=false, Symbol = "", Name = "Does not contain" });
                conditionOperators.Add(new ConditionOperator() { IsNumeric=true, Symbol = ">", Name = "Greater than" });
                conditionOperators.Add(new ConditionOperator() { IsNumeric= true, Symbol = ">=", Name = "Equal to or greater than" });
                conditionOperators.Add(new ConditionOperator() { IsNumeric= true, Symbol = "<", Name = "Less than" });
                conditionOperators.Add(new ConditionOperator() { IsNumeric = true, Symbol = "<=", Name = "Equal to or less than" });
                _context.ConditionOperators.AddRange(conditionOperators);
                await _context.SaveChangesAsync();
            }
        }



        private async Task EnsureRoleAsync(string roleName, string description, string[] claims)
        {
            if ((await _accountManager.GetRoleByNameAsync(roleName)) == null)
            {
                ApplicationRole applicationRole = new ApplicationRole(roleName, description);

                var result = await this._accountManager.CreateRoleAsync(applicationRole, claims);

                if (!result.Item1)
                    throw new Exception($"Seeding \"{description}\" role failed. Errors: {string.Join(Environment.NewLine, result.Item2)}");
            }
        }

        private async Task<ApplicationUser> CreateUserAsync(string userName, string password, string fullName, string email, string phoneNumber, string[] roles)
        {
            ApplicationUser applicationUser = new ApplicationUser
            {
                UserName = userName,
                FullName = fullName,
                Email = email,
                PhoneNumber = phoneNumber,
                EmailConfirmed = true,
                IsEnabled = true
            };

            var result = await _accountManager.CreateUserAsync(applicationUser, roles, password);

            if (!result.Item1)
                throw new Exception($"Seeding \"{userName}\" user failed. Errors: {string.Join(Environment.NewLine, result.Item2)}");


            return applicationUser;
        }
    }
}
