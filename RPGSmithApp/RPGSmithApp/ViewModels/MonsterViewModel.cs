using DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RPGSmithApp.ViewModels
{
    public class MonsterViewModel : Monster
    {
        public List<MonsterCurrency> MonsterCurrency { get; set; }
    }
}
