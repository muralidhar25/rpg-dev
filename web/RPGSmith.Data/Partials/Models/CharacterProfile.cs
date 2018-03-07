using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RPGSmith.Data.Models
{
    public partial class CharacterProfile : IUser, IAuthored, IEdited
    {
    }
}
