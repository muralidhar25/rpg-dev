using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class char_monster_LootPile : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "LootPileCharacterId",
                table: "ItemMasterLoots",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LootPileMonsterId",
                table: "ItemMasterLoots",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LootPileCharacterId",
                table: "ItemMasterLoots");

            migrationBuilder.DropColumn(
                name: "LootPileMonsterId",
                table: "ItemMasterLoots");
        }
    }
}
