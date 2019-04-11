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
                AddSlotsToUsers(applicationUser.Id, SlotType.RULESET_SLOT, qty);
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
                    AddSlotsToUsers(UserID, SlotType.PLAYER_SLOT, 5);
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
                    AddSlotsToUsers(UserID, SlotType.PLAYER_SLOT, 5);
                    AddSlotsToUsers(UserID, SlotType.CAMPAIGN_SLOT, 3);
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
        private bool AddSlotsToUsers(string UserID, SlotType slotType,int SlotsCountToAdd) {
            try
            {
                UserSubscription subs = _context.UserSubscriptions.Where(x => x.UserId == UserID).FirstOrDefault();
                if (subs != null)
                {
                    switch (slotType)
                    {
                        case SlotType.RULESET_SLOT:
                            subs.RulesetCount = subs.RulesetCount + SlotsCountToAdd;
                            break;
                        case SlotType.CAMPAIGN_SLOT:
                            subs.CampaignCount = subs.CampaignCount + SlotsCountToAdd;
                            break;
                        case SlotType.CHARACTER_SLOT:
                            subs.CharacterCount = subs.CharacterCount + SlotsCountToAdd;
                            break;
                        case SlotType.PLAYER_SLOT:
                            subs.PlayerCount = subs.PlayerCount + SlotsCountToAdd;
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
