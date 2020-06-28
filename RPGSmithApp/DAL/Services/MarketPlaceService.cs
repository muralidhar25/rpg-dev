using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
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
        public async Task<List<MarketPlaceItems>> GetList()
        {
            List<MarketPlaceItems> res = new List<MarketPlaceItems>();
            res.Add(new MarketPlaceItems {
                Id=1,
                MarketPlaceId = MarketPlaceType.GMPERMANENT,
                Title = "Base GM Account",
                Image = "https://rpgsmithsa.blob.core.windows.net/stock-marketplace/gm.jpg",
                Description = "Purchase a Base GM Account that lasts forever. Any and all Rule Sets currently on your player account are automatically converted to Campaigns in the GM account. This purchase also Removes Ads.",
                Price = 50,
                Tag = "Permanent",
                Subscribed = false,
                Qty=1

            });
            res.Add(new MarketPlaceItems
            {
                Id = 2,
                MarketPlaceId = MarketPlaceType.GM_1_YEAR,
                Title = "Base GM Account (Free Trial / 1-Year Subscription)",
                Image = "https://rpgsmithsa.blob.core.windows.net/stock-marketplace/gm.jpg",
                Description = "Sign up with this option and get a free month to try before you’re charged. You can cancel before 30 days from now to prevent any charges to your card from the Account Settings screen. Auto-renews annually at the current rate.",
                Price = 20,
                Tag = "1 Year",
                Subscribed = false,
                Qty = 1

            });
            res.Add(new MarketPlaceItems
            {
                Id = 3,
                MarketPlaceId = MarketPlaceType.CAMPAIGN_SLOT,
                Title = "+1 Campaign / Rule Set",
                Image = "https://rpgsmithsa.blob.core.windows.net/stock-marketplace/campaign.jpg",
                Description = "Add a permanent Campaign / Rule Set for this account. For GMs you get an extra Campaign slot, for Player accounts you’ll get another Rule Set slot. Now you can play all kinds of different games. Permanent on this account.",
                Price = 5,
                Tag = "Permanent",
                Subscribed = false,
                Qty = 1
            });
            res.Add(new MarketPlaceItems
            {
                Id = 9,
                MarketPlaceId = MarketPlaceType.RULESET_SLOT,
                Title = "+1 Campaign / Rule Set",
                Image = "https://rpgsmithsa.blob.core.windows.net/stock-marketplace/campaign.jpg",
                Description = "Add a permanent Campaign / Rule Set for this account. For GMs you get an extra Campaign slot, for Player accounts you’ll get another Rule Set slot. Now you can play all kinds of different games. Permanent on this account.",
                Price = 5,
                Tag = "Permanent",
                Subscribed = false,
                Qty = 1
            });
            res.Add(new MarketPlaceItems
            {
                Id = 4,
                MarketPlaceId = MarketPlaceType.PLAYER_SLOT,
                Title = "+1 Player Slot (GM Account Required)",
                Image = "https://rpgsmithsa.blob.core.windows.net/stock-marketplace/player.jpg",
                Description = "Want to invite even more player accounts to join in your campaign, purchase an extra player slot to get them in on the action. This will add another player slot for each campaign on your account. Permanent.",
                Price = 5,
                Tag = "Permanent",
                Subscribed = false,
                Qty = 1
            });
            res.Add(new MarketPlaceItems
            {
                Id = 5,
                MarketPlaceId = MarketPlaceType.CHARACTER_SLOT,
                Title = "+1 Character Slot",
                Image = "https://rpgsmithsa.blob.core.windows.net/stock-marketplace/character.jpg",
                Description = "This allows you to create another character for use with any of your Rule Sets (Player accounts) or Campaigns (GM Accounts). Don’t get this confused with “Player Slots”. This allows an additional character to be created. If you’re a GM and need to invite an additional person to your campaign you’ll need an available Player Slot to do so.",
                Price = 3,
                Tag = "Permanent",
                Subscribed = false,
                Qty = 1
            });
            res.Add(new MarketPlaceItems
            {
                Id = 6,
                MarketPlaceId = MarketPlaceType.REMOVE_ADDS,
                Title = "Remove Ads",
                Image = "https://rpgsmithsa.blob.core.windows.net/stock-marketplace/adremove.jpg",
                Description = "Don’t want to see ads? Yea it pains us to have to put those in the app in the first place. For 5 bucks you won’t have to see one ever again in RPGSmith.",
                Price = 5,
                Tag = "Permanent",
                Subscribed = false,
                Qty = 1
            });
            res.Add(new MarketPlaceItems
            {
                Id = 7,
                MarketPlaceId = MarketPlaceType.ADDITIONAL_STORAGE,
                Title = "+1 Gigabyte of Storage Space",
                Image = "https://rpgsmithsa.blob.core.windows.net/stock-marketplace/storage.jpg",
                Description = "Need more room to store your handouts, images, and other content? Purchase an extra gig of space and now you won’t have to clean up your storage contents. You probably should anyways though, it’s just a good habit. Permanent.",
                Price = 5,
                Tag = "Permanent",
                Subscribed = false,
                Qty = 1
            });
            res.Add(new MarketPlaceItems
            {
                Id = 8,
                MarketPlaceId = MarketPlaceType.BUY_US_A_COFFEE,
                Title = "Buy us a Coffee",
                Image = "https://rpgsmithsa.blob.core.windows.net/stock-marketplace/coffee.jpg",
                Description = "Please don’t be offended if we use any donations you kick our way on something other than coffee. Some of us would prefer a muffin instead.",
                Price = 0,
                Tag = "",
                Subscribed = false,
                Qty = 1
            });
            
            return res;
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
        public void AddCampaignSlot(ApplicationUser applicationUser, int qty)
        {
            try
            {
                AddSlotsToUsers(applicationUser.Id, SlotType.CAMPAIGN_SLOT, qty);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public void AddStorageSpace(ApplicationUser applicationUser, int qty)
        {
            try
            {
                AddSlotsToUsers(applicationUser.Id, SlotType.STORAGE_SPACE, qty);
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
                    //user.RemoveAds = true;                    
                    _context.SaveChanges();
                    AddSlotsToUsers(UserID, SlotType.PLAYER_SLOT, defaultPlayerCount);
                    UserSubscription subs = _context.UserSubscriptions.Where(x => x.UserId == UserID).FirstOrDefault();
                    int CampaignCount = defaultCampaignCount;
                    if (subs!=null)
                    {
                        CampaignCount = subs.RulesetCount;
                    }
                    AddSlotsToUsers(UserID, SlotType.CAMPAIGN_SLOT, CampaignCount, true);
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
                    //user.RemoveAds = true;
                    user.GmEndDate = GMEndDate;
                    user.StripeCustomerId = StripeCustomerId;
                    user.StripeSubscriptionID = StripeSubscriptionId;
                    _context.SaveChanges();
                    AddSlotsToUsers(UserID, SlotType.PLAYER_SLOT, defaultPlayerCount);
                    UserSubscription subs = _context.UserSubscriptions.Where(x => x.UserId == UserID).FirstOrDefault();
                    int CampaignCount = defaultCampaignCount;
                    if (subs != null)
                    {
                        CampaignCount = subs.RulesetCount;
                    }
                    AddSlotsToUsers(UserID, SlotType.CAMPAIGN_SLOT, CampaignCount, true);
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
                   // user.RemoveAdPurchased = IsRemoveAdPurchased;
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
                        case SlotType.STORAGE_SPACE:
                            //int oldCharacterCount = isGMCase == true ? 0 : subs.CharacterCount;
                            subs.StorageSpaceInMB = subs.StorageSpaceInMB + (SlotsCountToAdd*1000);
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
