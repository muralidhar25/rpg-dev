using System;
using System.Collections.Generic;
using System.Text;

namespace RPGSmith.Data
{
    public interface IAuthored
    {
        DateTime Authored { get; set; }
    }

    public interface IEdited
    {
        DateTime? Edited { get; set; }
    }

    public interface IUser
    {
        string UserId { get; set; }
       // int CampaignId { get; set; }
    }
}
