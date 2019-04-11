using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using DAL.Models;
using Microsoft.Extensions.Configuration;

namespace DAL.Services
{
    public class MarketPlaceService : IMarketPlaceService
    {
        const int defaultPlayerCount = 5;
        const int defaultCampaignCount = 3;
        protected readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        public MarketPlaceService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            this._configuration = configuration;
        }
        public void AddCharacterSlot(ApplicationUser applicationUser, int qty)
        {
            try
            {
                AddSlotsToUsers(applicationUser.Id, SlotType.CHARACTER_SLOT, qty);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public void AddPlayerSlot(ApplicationUser applicationUser, int qty)
        {
            try
            {
                AddSlotsToUsers(applicationUser.Id, SlotType.PLAYER_SLOT, qty);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public void AddRuleSetSlot(ApplicationUser applicationUser, int qty)
        {
            try
            {
                if (applicationUser.IsGm)
                {
                    AddSlotsToUsers(applicationUser.Id, SlotType.RULESET_SLOT, qty);
                }
                else {
                    AddSlotsToUsers(applicationUser.Id, SlotType.CAMPAIGN_SLOT, qty);
                }
                
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public void UpdateUserToGMPermanent(string UserID)
        {
            try {
                ApplicationUser user = _context.Users.Where(x=>x.Id ==UserID).FirstOrDefault();
                if (user != null)
                {
                    user.IsGm = true;
                    user.IsGmPermanent = true;
                    user.RemoveAds = true;                    
                    _context.SaveChanges();
                    AddSlotsToUsers(UserID, SlotType.PLAYER_SLOT, defaultPlayerCount);
                    AddSlotsToUsers(UserID, SlotType.CAMPAIGN_SLOT, defaultCampaignCount, true);
                }
                
            }
            catch (Exception ex) {
                throw ex;
            }            
        }
        public void UpdateUserToGMFor1Year(string UserID,string StripeCustomerId, string StripeSubscriptionId, DateTime GMEndDate)
        {
            try
            {
                ApplicationUser user = _context.Users.Where(x => x.Id == UserID).FirstOrDefault();
                if (user != null)
                {
                    user.IsGm = true;
                    user.IsGmPermanent = false;
                    user.RemoveAds = true;
                    user.GmEndDate = GMEndDate;
                    user.StripeCustomerId = StripeCustomerId;
                    user.StripeSubscriptionID = StripeSubscriptionId;
                    _context.SaveChanges();
                    AddSlotsToUsers(UserID, SlotType.PLAYER_SLOT, defaultPlayerCount);
                    AddSlotsToUsers(UserID, SlotType.CAMPAIGN_SLOT, defaultCampaignCount, true);
                }

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public void UpdateUserToRemoveAds(ApplicationUser applicationUser)
        {
            try
            {
                ApplicationUser user = _context.Users.Where(x => x.Id == applicationUser.Id).FirstOrDefault();
                if (user != null)
                {
                    user.RemoveAds = true;
                    _context.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }            
        }
        private bool AddSlotsToUsers(string UserID, SlotType slotType,int SlotsCountToAdd,bool isGMCase=false) {
            try
            {
                UserSubscription subs = _context.UserSubscriptions.Where(x => x.UserId == UserID).FirstOrDefault();
                if (subs != null)
                {                    
                    switch (slotType)
                    {
                        case SlotType.RULESET_SLOT:
                            int oldRulesetCount = isGMCase == true ? 0 : subs.RulesetCount;
                            subs.RulesetCount = oldRulesetCount + SlotsCountToAdd;
                            break;
                        case SlotType.CAMPAIGN_SLOT:
                            int oldCampaignCount = isGMCase == true ? 0 : subs.CampaignCount;
                            subs.CampaignCount = oldCampaignCount + SlotsCountToAdd;
                            break;
                        case SlotType.CHARACTER_SLOT:
                            int oldCharacterCount = isGMCase == true ? 0 : subs.CharacterCount;
                            subs.CharacterCount = oldCharacterCount + SlotsCountToAdd;
                            break;
                        case SlotType.PLAYER_SLOT:
                            int oldPlayerCount = isGMCase == true ? 0 : subs.PlayerCount;
                            if (isGMCase && oldPlayerCount >= defaultPlayerCount)
                            {

                            }
                            else
                            {
                                subs.PlayerCount = oldPlayerCount + SlotsCountToAdd;
                            }
                            
                            break;
                        default:
                            break;
                    }
                    _context.SaveChanges();
                    return true;
                }
                return false;
            }
            catch (Exception ex) {
                throw ex;
            }
            
        }
    }
}
