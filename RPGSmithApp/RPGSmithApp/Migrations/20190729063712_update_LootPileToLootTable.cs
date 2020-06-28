using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class update_LootPileToLootTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsLootPile",
                table: "ItemMasterLoots",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LootPileId",
                table: "ItemMasterLoots",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsLootPile",
                table: "ItemMasterLoots");

            migrationBuilder.DropColumn(
                name: "LootPileId",
                table: "ItemMasterLoots");
        }
    }
}
