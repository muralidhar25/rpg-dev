using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class currencycmdfield : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Command",
                table: "MonsterTemplateCurrency",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Command",
                table: "MonsterCurrency",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Command",
                table: "LootTemplateCurrency",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Command",
                table: "ItemMasterLootCurrency",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Command",
                table: "CharacterCurrency",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Command",
                table: "MonsterTemplateCurrency");

            migrationBuilder.DropColumn(
                name: "Command",
                table: "MonsterCurrency");

            migrationBuilder.DropColumn(
                name: "Command",
                table: "LootTemplateCurrency");

            migrationBuilder.DropColumn(
                name: "Command",
                table: "ItemMasterLootCurrency");

            migrationBuilder.DropColumn(
                name: "Command",
                table: "CharacterCurrency");
        }
    }
}
