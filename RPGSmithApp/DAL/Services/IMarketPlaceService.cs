using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;

namespace DAL.Services
{
    public interface IMarketPlaceService
    {
        void UpdateUserToRemoveAds(ApplicationUser applicationUser);
        void AddCharacterSlot(ApplicationUser applicationUser,int qty);
        void AddPlayerSlot(ApplicationUser applicationUser, int qty);
        void AddRuleSetSlot(ApplicationUser applicationUser, int qty);
        void UpdateUserToGMPermanent(string UserID);
        void UpdateUserToGMFor1Year(string UserID,string StripeCustomerId, string StripeSubscriptionId, DateTime GMEndDate);
        Task<List<MarketPlaceItems>> GetList();
    }
}
