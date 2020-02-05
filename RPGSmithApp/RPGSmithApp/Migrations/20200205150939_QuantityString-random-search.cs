using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class QuantityStringrandomsearch : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "QuantityString",
                table: "MonsterTemplateRandomizationSearch",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "QuantityString",
                table: "LootTemplateRandomizationSearch",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "QuantityString",
                table: "MonsterTemplateRandomizationSearch");

            migrationBuilder.DropColumn(
                name: "QuantityString",
                table: "LootTemplateRandomizationSearch");
        }
    }
}
