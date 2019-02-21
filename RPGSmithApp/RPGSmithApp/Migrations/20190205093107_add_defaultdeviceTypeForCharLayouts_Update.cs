using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class add_defaultdeviceTypeForCharLayouts_Update : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DefaultDevice",
                table: "CharacterDashboardLayouts");

            migrationBuilder.AddColumn<bool>(
                name: "IsDefaultComputer",
                table: "CharacterDashboardLayouts",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDefaultMobile",
                table: "CharacterDashboardLayouts",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDefaultTablet",
                table: "CharacterDashboardLayouts",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsDefaultComputer",
                table: "CharacterDashboardLayouts");

            migrationBuilder.DropColumn(
                name: "IsDefaultMobile",
                table: "CharacterDashboardLayouts");

            migrationBuilder.DropColumn(
                name: "IsDefaultTablet",
                table: "CharacterDashboardLayouts");

            migrationBuilder.AddColumn<string>(
                name: "DefaultDevice",
                table: "CharacterDashboardLayouts",
                type: "nvarchar(8)",
                nullable: true);
        }
    }
}
