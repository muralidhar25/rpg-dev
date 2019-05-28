// ====================================================
// More Templates: https://www.ebenmonney.com/templates
// Email: support@ebenmonney.com
// ====================================================

using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using DAL;
using DAL.Models;
using System.Net;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using AutoMapper;
using Newtonsoft.Json;
using DAL.Core;
using DAL.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using RPGSmithApp.ViewModels;
using RPGSmithApp.Helpers;
using RPGSmithApp.Authorization;
using AspNet.Security.OpenIdConnect.Primitives;
using AspNet.Security.OAuth.Validation;
using Microsoft.AspNetCore.Identity;
using Swashbuckle.AspNetCore.Swagger;
using AppPermissions = DAL.Core.ApplicationPermissions;
using DAL.Services;
using DAL.Repositories;
using DAL.Repositories.Interfaces;
using Microsoft.AspNetCore.Http.Features;
using DAL.Services.CharacterTileServices;
using DAL.Services.RulesetTileServices;
using RPGSmithApp.Helpers.CoreRuleset;
using Newtonsoft.Json.Serialization;

namespace RPGSmithApp
{
    public class Startup
    {
        public IConfiguration Configuration { get; }
        //private readonly IHostingEnvironment _hostingEnvironment;

        public Startup(IConfiguration configuration/*, IHostingEnvironment env*/)
        {
            Configuration = configuration;
            //_hostingEnvironment = env;
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseSqlServer(Configuration["ConnectionStrings:DefaultConnection"], b => b.MigrationsAssembly("RPGSmithApp"));
                options.UseOpenIddict();
            });

            // add identity
            services.AddIdentity<ApplicationUser, ApplicationRole>()
                .AddEntityFrameworkStores<ApplicationDbContext>()
                .AddDefaultTokenProviders();

            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.AddSingleton<IConfiguration>(Configuration);

            // Configure Identity options and password complexity here
            services.Configure<IdentityOptions>(options =>
            {
                // User settings
                options.User.RequireUniqueEmail = true;
                //options.User.AllowedUserNameCharacters = true;
                //options.User.

                // Password settings
                options.Password.RequireDigit = false;
                options.Password.RequiredLength = 8;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireUppercase = false;
                options.Password.RequireLowercase = false;

                // Lockout settings
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(1);
                options.Lockout.MaxFailedAccessAttempts = 5;

                options.ClaimsIdentity.UserNameClaimType = OpenIdConnectConstants.Claims.Name;
                options.ClaimsIdentity.UserIdClaimType = OpenIdConnectConstants.Claims.Subject;
                options.ClaimsIdentity.RoleClaimType = OpenIdConnectConstants.Claims.Role;
            });

            // Register the OpenIddict services.
            services.AddOpenIddict(options =>
            {
                options.AddEntityFrameworkCoreStores<ApplicationDbContext>();
                options.AddMvcBinders();
                options.EnableTokenEndpoint("/connect/token");
                options.AllowPasswordFlow();
                options.AllowRefreshTokenFlow();
                options.AllowCustomFlow("urn:ietf:params:oauth:grant-type:facebook_identity_token");
                options.AllowCustomFlow("urn:ietf:params:oauth:grant-type:google_identity_token");
                //if (_hostingEnvironment.IsDevelopment()) //Uncomment to only disable Https during development
                options.DisableHttpsRequirement();

                //options.UseRollingTokens(); //Uncomment to renew refresh tokens on every refreshToken request
                //options.AddSigningKey(new SymmetricSecurityKey(System.Text.Encoding.ASCII.GetBytes(Configuration["STSKey"])));
            });


            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = OAuthValidationDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = OAuthValidationDefaults.AuthenticationScheme;
            }).AddOAuthValidation();



            // Add cors
            services.AddCors();
            services
                .AddSignalR()
                .AddAzureSignalR(Configuration.GetSection("SignalRConnectionString").Value)
                .AddJsonProtocol(options => {
                    options.PayloadSerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
                });
            // Add framework services.
            services.AddMvc().AddJsonOptions(options =>
            {
                //options.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
                options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
            });


            // In production, the Angular files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/dist";
            });


            // Enforce https during production. To quickly enable ssl during development. Go to: Project Properties->Debug->Enable SSL
            //if (!_hostingEnvironment.IsDevelopment())
            //    services.Configure<MvcOptions>(options => options.Filters.Add(new RequireHttpsAttribute()));


            //Todo: ***Using DataAnnotations for validation until Swashbuckle supports FluentValidation***
            //services.AddFluentValidation(fv => fv.RegisterValidatorsFromAssemblyContaining<Startup>());


            //.AddJsonOptions(opts =>
            //{
            //    opts.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
            //});



            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new Info { Title = "RPGSmithApp API", Version = "v1" });

                c.AddSecurityDefinition("OpenID Connect", new OAuth2Scheme
                {
                    Type = "oauth2",
                    Flow = "password",
                    TokenUrl = "/connect/token"
                });
            });
            services.ConfigureSwaggerGen(options =>
            {
                // UseFullTypeNameInSchemaIds replacement for .NET Core
                options.CustomSchemaIds(x => x.FullName);
            });


            services.AddAuthorization(options =>
            {
                options.AddPolicy(Authorization.Policies.ViewAllUsersPolicy, policy => policy.RequireClaim(CustomClaimTypes.Permission, AppPermissions.ViewUsers));
                options.AddPolicy(Authorization.Policies.ManageAllUsersPolicy, policy => policy.RequireClaim(CustomClaimTypes.Permission, AppPermissions.ManageUsers));

                options.AddPolicy(Authorization.Policies.ViewAllRolesPolicy, policy => policy.RequireClaim(CustomClaimTypes.Permission, AppPermissions.ViewRoles));
                options.AddPolicy(Authorization.Policies.ViewRoleByRoleNamePolicy, policy => policy.Requirements.Add(new ViewRoleAuthorizationRequirement()));
                options.AddPolicy(Authorization.Policies.ManageAllRolesPolicy, policy => policy.RequireClaim(CustomClaimTypes.Permission, AppPermissions.ManageRoles));

                options.AddPolicy(Authorization.Policies.AssignAllowedRolesPolicy, policy => policy.Requirements.Add(new AssignRolesAuthorizationRequirement()));
                //options.AddPolicy("FacebookAuthentication", policy => policy.Requirements.Add(new FacebookRequirement()));
            });

            Mapper.Initialize(cfg =>
            {
                cfg.AddProfile<AutoMapperProfile>();
            });



            // Configurations
            services.Configure<SmtpConfig>(Configuration.GetSection("SmtpConfig"));
            services.Configure<StripeConfig>(Configuration.GetSection("StripeConfig"));
            // DB Creation and Seeding
            services.AddTransient<IDatabaseInitializer, DatabaseInitializer>();
            // Auth Handlers
            services.AddSingleton<IAuthorizationHandler, ViewUserAuthorizationHandler>();
            services.AddSingleton<IAuthorizationHandler, ManageUserAuthorizationHandler>();
            services.AddSingleton<IAuthorizationHandler, ViewRoleAuthorizationHandler>();
            services.AddSingleton<IAuthorizationHandler, AssignRolesAuthorizationHandler>();

            // Business Services
            services.AddScoped<IEmailer, Emailer>();

            // CoreRuleSet/copy from CoreeRuleSet Services
            services.AddScoped<ICoreRuleset, CoreRuleset>();
            services.AddScoped<ICommonFuncsCoreRuleSet, CommonFuncsCoreRuleSet>();

            // Repositories
            services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
            services.AddScoped<IUnitOfWork, HttpUnitOfWork>();
            services.AddScoped<IAccountManager, AccountManager>();
            services.AddScoped<IRuleSetService, RuleSetService>();
            services.AddScoped<ICharacterStatService, CharacterStatService>();
            services.AddScoped<ICharacterStatCalcService, CharacterStatCalcService>();
            services.AddScoped<ICharacterStatChoiceService, CharacterStatChoiceService>();
            services.AddScoped<ICharacterStatComboService, CharacterStatComboService>();
            services.AddScoped<ICharacterService, CharacterService>();
            services.AddScoped<ICharacterStatTypeService, CharacterStatTypeService>();
            services.AddScoped<ICharacterStatToggleService, CharacterStatToggleService>();
            services.AddScoped<ICharacterStatDefaultValueService, CharacterStatDefaultValueService>();
            services.AddScoped<ICharacterStatConditionService, CharacterStatConditionService>();
            
            services.AddScoped<ICustomToggleService, CustomToggleService>();
            services.AddScoped<IItemMasterBundleService, ItemMasterBundleService>();

            services.AddScoped<IItemMasterService, ItemMasterService>();
            services.AddScoped<IAbilityService, AbilityService>();
            services.AddScoped<ISpellService, SpellService>();
            services.AddScoped<IItemMasterCommandService, ItemMasterCommandService>();
            services.AddScoped<ISpellCommandService, SpellCommandService>();
            services.AddScoped<IAbilityCommandService, AbilityCommandService>();
            services.AddScoped<ICharacterAbilityService, CharacterAbilityService>();
            services.AddScoped<ICharacterSpellService, CharacterSpellService>();
            services.AddScoped<IItemService, ItemService>();
            //services.AddScoped<IContainerService, ContainerService>();
            services.AddScoped<IPageLastViewService, PageLastViewService>();
            services.AddScoped<ICharacterCommandService, CharacterCommandService>();
            services.AddScoped<IItemCommandService, ItemCommandService>();
            services.AddScoped<ICharactersCharacterStatService, CharactersCharacterStatService>();
            services.AddScoped<ICharacterDashboardLayoutService, CharacterDashboardLayoutService>();
            services.AddScoped<ICharacterDashboardPageService, CharacterDashboardPageService>();
            services.AddScoped<IImageService, ImageService>();
            services.AddScoped<ISearchService, SearchService>();
            services.AddScoped<IColorService, ColorService>();
            services.AddScoped<ITileConfigService, TileConfigService>();

            //Ruleset tiles
            services.AddScoped<IRulesetTileService, RulesetTileService>();
            services.AddScoped<IRulesetCharacterStatTileService, RulesetCharacterStatTileService>();
            services.AddScoped<IRulesetCommandTileService, RulesetCommandTileService>();
            services.AddScoped<IRulesetCounterTileService, RulesetCounterTileService>();
            services.AddScoped<IRulesetNoteTileService, RulesetNoteTileService>();
            services.AddScoped<IRulesetImageTileService, RulesetImageTileService>();
            services.AddScoped<IRulesetTextTileService, RulesetTextTileService>();
            services.AddScoped<IRulesetTileColorService, RulesetTileColorService>();
            services.AddScoped<IRulesetTileConfigService, RulesetTileConfigService>();
            services.AddScoped<IRulesetDashboardLayoutService, RulesetDashboardLayoutService>();
            services.AddScoped<IRulesetDashboardPageService, RulesetDashboardPageService>();

            services.AddScoped<ICharacterTileService, CharacterTileService>();
            services.AddScoped<DAL.Services.CharacterTileServices.ICharacterStatTileService, DAL.Services.CharacterTileServices.CharacterStatTileService>();
            services.AddScoped<DAL.Services.CharacterTileServices.ICommandTileService, DAL.Services.CharacterTileServices.CommandTileService>();
            services.AddScoped<DAL.Services.CharacterTileServices.ICounterTileService, DAL.Services.CharacterTileServices.CounterTileService>();
            services.AddScoped<DAL.Services.CharacterTileServices.INoteTileService, DAL.Services.CharacterTileServices.NoteTileService>();
            services.AddScoped<DAL.Services.CharacterTileServices.IImageTileService, DAL.Services.CharacterTileServices.ImageTileService>();
            services.AddScoped<DAL.Services.CharacterTileServices.ITextTileService, DAL.Services.CharacterTileServices.TextTileService>();
            services.AddScoped<DAL.Services.CharacterTileServices.ILinkTileService, DAL.Services.CharacterTileServices.LinkTileService>();
            services.AddScoped<DAL.Services.CharacterTileServices.IExecuteTileService, DAL.Services.CharacterTileServices.ExecuteTileService>();

            services.AddScoped<IMarketPlaceService, MarketPlaceService>();
            services.AddScoped<ICampaignService, CampaignService>();

            // Register Hosted Services
            services.AddSingleton<Microsoft.Extensions.Hosting.IHostedService, BackgroundProcesses>();

            services.Configure<FormOptions>(x =>
            {
                x.ValueLengthLimit = int.MaxValue;
                x.MultipartBodyLengthLimit = int.MaxValue;
                x.MultipartHeadersLengthLimit = int.MaxValue;
                x.ValueCountLimit = int.MaxValue;
            });

            
        }


        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {

            //using (var serviceScope = app.ApplicationServices.GetService<IServiceScopeFactory>().CreateScope())
            //{
            //    var context = serviceScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            //    context.Database.Migrate();
            //}



            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug(LogLevel.Warning);
            loggerFactory.AddFile(Configuration.GetSection("Logging"));

            Utilities.ConfigureLogger(loggerFactory);
            EmailTemplates.Initialize(env);

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                // Enforce https during production
                //var rewriteOptions = new RewriteOptions()
                //    .AddRedirectToHttps();
                //app.UseRewriter(rewriteOptions);
                app.UseMiddleware<ErrorHandlingMiddleware>();

                app.UseExceptionHandler("/Home/Error");
            }


            //Configure Cors
            app.UseCors(builder => builder
                .AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod());


            app.UseMiddleware<ErrorHandlingMiddleware>();
            app.UseStaticFiles();
            app.UseSpaStaticFiles();
            app.UseAuthentication();


            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "RPGSmithApp API V1");
            });

            app.UseAzureSignalR(routes =>
            {
                routes.MapHub<ChatHub>("/chat");
                routes.MapHub<GroupChatHub>("/groupchat");
            });

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller}/{action=Index}/{id?}");
            });

            app.UseSpa(spa =>
            {
                // To learn more about options for serving an Angular SPA from ASP.NET Core,
                // see https://go.microsoft.com/fwlink/?linkid=864501

                spa.Options.SourcePath = "ClientApp";

                if (env.IsDevelopment())
                {
                    spa.Options.StartupTimeout = new TimeSpan(0, 0, 80);
                    spa.UseAngularCliServer(npmScript: "start");
                }
            });
        }
    }

}
