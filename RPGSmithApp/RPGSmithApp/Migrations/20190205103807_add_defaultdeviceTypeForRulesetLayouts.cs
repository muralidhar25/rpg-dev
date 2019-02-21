using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class add_defaultdeviceTypeForRulesetLayouts : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDefaultComputer",
                table: "RulesetDashboardLayouts",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDefaultMobile",
                table: "RulesetDashboardLayouts",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDefaultTablet",
                table: "RulesetDashboardLayouts",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsDefaultComputer",
                table: "RulesetDashboardLayouts");

            migrationBuilder.DropColumn(
                name: "IsDefaultMobile",
                table: "RulesetDashboardLayouts");

            migrationBuilder.DropColumn(
                name: "IsDefaultTablet",
                table: "RulesetDashboardLayouts");
        }
    }
}
