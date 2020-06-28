using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class rulesetcurrencyfields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "CurrencyBaseUnit",
                table: "RuleSets",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "CurrencyName",
                table: "RuleSets",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "CurrencyWeight",
                table: "RuleSets",
                nullable: false,
                defaultValue: 0m);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CurrencyBaseUnit",
                table: "RuleSets");

            migrationBuilder.DropColumn(
                name: "CurrencyName",
                table: "RuleSets");

            migrationBuilder.DropColumn(
                name: "CurrencyWeight",
                table: "RuleSets");
        }
    }
}
