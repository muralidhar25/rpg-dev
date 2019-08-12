using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class add_toggletile_columns_tosaveValues : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_RulesetToggleTiles_RulesetTileId",
                table: "RulesetToggleTiles");

            migrationBuilder.DropIndex(
                name: "IX_CharacterToggleTiles_CharacterTileId",
                table: "CharacterToggleTiles");

            migrationBuilder.AddColumn<bool>(
                name: "CheckBox",
                table: "RulesetToggleTiles",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "CustomValue",
                table: "RulesetToggleTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "OnOff",
                table: "RulesetToggleTiles",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "YesNo",
                table: "RulesetToggleTiles",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CheckBox",
                table: "CharacterToggleTiles",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "CustomValue",
                table: "CharacterToggleTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "OnOff",
                table: "CharacterToggleTiles",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "YesNo",
                table: "CharacterToggleTiles",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_RulesetToggleTiles_RulesetTileId",
                table: "RulesetToggleTiles",
                column: "RulesetTileId",
                unique: true,
                filter: "[RulesetTileId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterToggleTiles_CharacterTileId",
                table: "CharacterToggleTiles",
                column: "CharacterTileId",
                unique: true,
                filter: "[CharacterTileId] IS NOT NULL");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_RulesetToggleTiles_RulesetTileId",
                table: "RulesetToggleTiles");

            migrationBuilder.DropIndex(
                name: "IX_CharacterToggleTiles_CharacterTileId",
                table: "CharacterToggleTiles");

            migrationBuilder.DropColumn(
                name: "CheckBox",
                table: "RulesetToggleTiles");

            migrationBuilder.DropColumn(
                name: "CustomValue",
                table: "RulesetToggleTiles");

            migrationBuilder.DropColumn(
                name: "OnOff",
                table: "RulesetToggleTiles");

            migrationBuilder.DropColumn(
                name: "YesNo",
                table: "RulesetToggleTiles");

            migrationBuilder.DropColumn(
                name: "CheckBox",
                table: "CharacterToggleTiles");

            migrationBuilder.DropColumn(
                name: "CustomValue",
                table: "CharacterToggleTiles");

            migrationBuilder.DropColumn(
                name: "OnOff",
                table: "CharacterToggleTiles");

            migrationBuilder.DropColumn(
                name: "YesNo",
                table: "CharacterToggleTiles");

            migrationBuilder.CreateIndex(
                name: "IX_RulesetToggleTiles_RulesetTileId",
                table: "RulesetToggleTiles",
                column: "RulesetTileId");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterToggleTiles_CharacterTileId",
                table: "CharacterToggleTiles",
                column: "CharacterTileId");
        }
    }
}
