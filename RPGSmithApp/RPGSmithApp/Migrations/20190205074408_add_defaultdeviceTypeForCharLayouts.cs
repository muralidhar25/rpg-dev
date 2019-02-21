using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class add_defaultdeviceTypeForCharLayouts : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DefaultDevice",
                table: "CharacterDashboardLayouts",
                type: "nvarchar(8)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DefaultDevice",
                table: "CharacterDashboardLayouts");
        }
    }
}
