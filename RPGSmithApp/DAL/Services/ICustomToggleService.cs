using DAL.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Services
{
    public interface ICustomToggleService
    {
        Task<CustomToggle> InsertCustomToggle(CustomToggle customToggle);
        Task<CustomToggle> UpdateCustomToggle(CustomToggle customToggle);
        Task<bool> DeleteCustomToggle(int id);
        List<CustomToggle> GetByIds(string selectedIds);
    }
}
