using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DAL.Core.Interfaces;
using DAL.Models;
using DAL.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using RPGSmithApp.Helpers;
using RPGSmithApp.ViewModels;
using Stripe;

namespace RPGSmithApp.Controllers
{
    [Route("api/[controller]")]
    public class MarketPlaceController : Controller
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAccountManager _accountManager;
        private readonly IMarketPlaceService _marketPlace;
        private readonly StripeConfig _stripeConfig;

        public MarketPlaceController(IHttpContextAccessor httpContextAccessor, IPageLastViewService pageLastViewService
            , IAccountManager accountManager, IOptions<StripeConfig> stripeConfig,IMarketPlaceService marketPlace)
        {
            this._httpContextAccessor = httpContextAccessor;            
            this._accountManager = accountManager;
            this._stripeConfig = stripeConfig.Value;
            this._marketPlace = marketPlace;
        }
        [HttpGet("GetMarketPlaceList")]
        public async Task<IActionResult> GetMarketPlaceList()
        {
            try
            {
                ApplicationUser user = GetUser();
                List<MarketPlaceItems> results = await _marketPlace.GetList();
                if (user.IsGm)
                {

                    if (user.IsGmPermanent)
                    {
                        results = results.Where(x => x.MarketPlaceId != MarketPlaceType.GMPERMANENT || x.MarketPlaceId != MarketPlaceType.GM_1_YEAR).ToList();
                    }
                    else
                    {
                        results = results.Where(x => x.MarketPlaceId != MarketPlaceType.GM_1_YEAR).ToList();
                    }
                }
                else {
                    results = results.Where(x => x.MarketPlaceId != MarketPlaceType.PLAYER_SLOT).ToList();
                }
                              
                return Ok(results);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost("ChargePayment")]
        public async Task<IActionResult> ChargePayment([FromBody] MarketPlace model)
        {
            bool paymentSuccess = false;
            bool updateUserDetailSuccess = false;
            try {
                StripeConfiguration.SetApiKey(_stripeConfig.SecretKey);
                if (model.MarketPlaceId == MarketPlaceType.GM_1_YEAR)
                {
                    ApplicationUser user = GetUser();
                    var options = new CustomerCreateOptions
                    {
                        Email = user.Email,
                        SourceToken = model.SourceToken,
                    };
                    var service = new CustomerService();
                    Customer customer = service.Create(options);

                    var items = new List<SubscriptionItemOption> {
                        new SubscriptionItemOption {PlanId = _stripeConfig.PlanID}
                        };
                    var Subsoptions = new SubscriptionCreateOptions
                    {
                        CustomerId = customer.Id,
                        Items = items,
                    };
                    var SubsService = new SubscriptionService();
                    Subscription subscription = SubsService.Create(Subsoptions);
                    paymentSuccess = true;
                    if (subscription.Status == "active")
                    {
                        UpdateUser_GmFor1Year(customer.Id, subscription.Id,subscription.CurrentPeriodEnd);
                        updateUserDetailSuccess = true;
                    }
                }
                else
                {
                    var options = new ChargeCreateOptions
                    {
                        Amount = Convert.ToInt64(model.Price * 100),
                        Currency = "usd",
                        Description = model.Description,
                        SourceId = model.SourceToken // obtained with Stripe.js,
                    };
                    var service = new ChargeService();
                    Charge charge = service.Create(options);

                    if (charge.Status == "succeeded")
                    {
                        paymentSuccess = true;
                        switch (model.MarketPlaceId)
                        {
                            case MarketPlaceType.GMPERMANENT:
                                UpdateUser_GmPermanently();
                                break;
                            case MarketPlaceType.CAMPAIGN_RULE_SET:
                                UpdateUser_AddRuleSetSlot(1);
                                break;
                            case MarketPlaceType.PLAYER_SLOT:
                                UpdateUser_AddPlayerSlot(1);
                                break;
                            case MarketPlaceType.CHARACTER_SLOT:
                                UpdateUser_AddCharacterSlot(1);
                                break;
                            case MarketPlaceType.REMOVE_ADDS:
                                UpdateUser_RemoveAds();
                                break;
                            case MarketPlaceType.ADDITIONAL_STORAGE:
                                UpdateUser_AddStorage(1);
                                break;
                            case MarketPlaceType.BUY_US_A_COFFEE:
                                break;
                            default:
                                break;
                        }
                        updateUserDetailSuccess = true;
                    }
                }
                

               
            } catch (Exception ex) {
                string message = "Payment successful.";
                if (!paymentSuccess)
                {
                    message = "Payment not successful.";
                }
                else if (!updateUserDetailSuccess)
                {
                    message = "Payment successful but some error occured while updating the entries.";
                }
                return Ok(new { paymentSuccessed = paymentSuccess, userUpdated = updateUserDetailSuccess, message = message });                
            }
            return Ok(new { paymentSuccessed = true, userUpdated = true ,message="Payment Successful."});
        }

        private void UpdateUser_GmFor1Year(string StripeCustomerId,string StripeSubscriptionId,DateTime? GMEndDate)
        {
            _marketPlace.UpdateUserToGMFor1Year(GetUserId(), StripeCustomerId, StripeSubscriptionId, Convert.ToDateTime(GMEndDate==null?new DateTime(): GMEndDate));
        }

        private void UpdateUser_AddStorage(int qty)
        {
            throw new NotImplementedException();
        }

        private void UpdateUser_RemoveAds()
        {
            _marketPlace.UpdateUserToRemoveAds(GetUser());
        }

        private void UpdateUser_AddCharacterSlot(int qty)
        {
            _marketPlace.AddCharacterSlot(GetUser(), qty);
        }

        private void UpdateUser_AddPlayerSlot(int qty)
        {
            _marketPlace.AddPlayerSlot(GetUser(), qty);
        }

        private void UpdateUser_AddRuleSetSlot(int qty)
        {
            _marketPlace.AddRuleSetSlot(GetUser(), qty);
        }

        private void UpdateUser_GmPermanently()
        {            
            _marketPlace.UpdateUserToGMPermanent(GetUserId());
        }

        private string GetUserId()
        {
            string userName = _httpContextAccessor.HttpContext.User.Identities.Select(x => x.Name).FirstOrDefault();
            ApplicationUser appUser = _accountManager.GetUserByUserNameAsync(userName).Result;
            return appUser.Id;
        }

        private ApplicationUser GetUser()
        {
            string userName = _httpContextAccessor.HttpContext.User.Identities.Select(x => x.Name).FirstOrDefault();
            return _accountManager.GetUserByUserNameAsync(userName).Result;
        }
    }
}