using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class QuantityStringColumn : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "QuantityString",
                table: "RandomizationEngines",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "QuantityString",
                table: "LootTemplateRandomizationEngines",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "QuantityString",
                table: "RandomizationEngines");

            migrationBuilder.DropColumn(
                name: "QuantityString",
                table: "LootTemplateRandomizationEngines");
        }
    }
}
