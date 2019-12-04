using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class autodeletecolumn : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AutoDeleteItems",
                table: "RuleSets",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "SortOrder",
                table: "CurrencyTypes",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AutoDeleteItems",
                table: "RuleSets");

            migrationBuilder.DropColumn(
                name: "SortOrder",
                table: "CurrencyTypes");
        }
    }
}
