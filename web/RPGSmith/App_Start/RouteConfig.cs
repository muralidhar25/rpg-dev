using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace RPGSmith
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
             name: "Account",
             url: "api/Account/{action}/{id}",
              defaults: new { controller = "Account", id = "" }
            );

            routes.MapRoute(
name: "Profile",
url: "api/Profile/{action}/{id}",
defaults: new { controller = "Profile", id = "" }
);

            routes.MapRoute(
              name: "Character",
              url: "api/Character/{action}/{id}",
               defaults: new { controller = "Character", id = "" }
            );

            routes.MapRoute(
             name: "Layout",
             url: "api/Layout/{action}/{id}",
              defaults: new { controller = "Layout", id = "" }
           );

            routes.MapRoute(
             name: "RuleSet",
             url: "api/RuleSet/{action}/{id}",
              defaults: new { controller = "RuleSet", id = "" }
           );

            routes.MapRoute(
        name: "Tab",
        url: "api/Tab/{action}/{id}",
         defaults: new { controller = "Tab", id = "" }
      );

            routes.MapRoute(
    name: "Tile",
    url: "api/Tile/{action}/{id}",
     defaults: new { controller = "Tile", id = "" }
  );

            routes.MapRoute(
   name: "RPGSmithType",
   url: "api/RPGSmithType/{action}/{id}",
    defaults: new { controller = "RPGSmithType", id = "" }
 );


            routes.MapRoute(
              name: "RuleSetImportExport",
              url: "api/RuleSetImportExport/{action}/{id}",
              defaults: new { controller = "RuleSetImportExport", id = "" }
              );


            routes.MapRoute(
            name: "CharecterRuleSetImportExport",
            url: "api/CharecterRuleSetImportExport/{action}/{id}",
            defaults: new { controller = "CharecterRuleSetImportExport", id = "" }
            );


            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}
