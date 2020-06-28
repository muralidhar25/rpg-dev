using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class CampaignClusterTilecChangesAddTableName : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RulesetCharacterStatClusterTile_CharacterStats_DisplayCharactersCharacterStatID",
                table: "RulesetCharacterStatClusterTile");

            migrationBuilder.DropForeignKey(
                name: "FK_RulesetCharacterStatClusterTile_RulesetTiles_RulesetTileId",
                table: "RulesetCharacterStatClusterTile");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RulesetCharacterStatClusterTile",
                table: "RulesetCharacterStatClusterTile");

            migrationBuilder.RenameTable(
                name: "RulesetCharacterStatClusterTile",
                newName: "RulesetCharacterStatClusterTiles");

            migrationBuilder.RenameIndex(
                name: "IX_RulesetCharacterStatClusterTile_RulesetTileId",
                table: "RulesetCharacterStatClusterTiles",
                newName: "IX_RulesetCharacterStatClusterTiles_RulesetTileId");

            migrationBuilder.RenameIndex(
                name: "IX_RulesetCharacterStatClusterTile_DisplayCharactersCharacterStatID",
                table: "RulesetCharacterStatClusterTiles",
                newName: "IX_RulesetCharacterStatClusterTiles_DisplayCharactersCharacterStatID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RulesetCharacterStatClusterTiles",
                table: "RulesetCharacterStatClusterTiles",
                column: "CharacterStatClusterTileId");

            migrationBuilder.AddForeignKey(
                name: "FK_RulesetCharacterStatClusterTiles_CharacterStats_DisplayCharactersCharacterStatID",
                table: "RulesetCharacterStatClusterTiles",
                column: "DisplayCharactersCharacterStatID",
                principalTable: "CharacterStats",
                principalColumn: "CharacterStatId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RulesetCharacterStatClusterTiles_RulesetTiles_RulesetTileId",
                table: "RulesetCharacterStatClusterTiles",
                column: "RulesetTileId",
                principalTable: "RulesetTiles",
                principalColumn: "RulesetTileId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RulesetCharacterStatClusterTiles_CharacterStats_DisplayCharactersCharacterStatID",
                table: "RulesetCharacterStatClusterTiles");

            migrationBuilder.DropForeignKey(
                name: "FK_RulesetCharacterStatClusterTiles_RulesetTiles_RulesetTileId",
                table: "RulesetCharacterStatClusterTiles");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RulesetCharacterStatClusterTiles",
                table: "RulesetCharacterStatClusterTiles");

            migrationBuilder.RenameTable(
                name: "RulesetCharacterStatClusterTiles",
                newName: "RulesetCharacterStatClusterTile");

            migrationBuilder.RenameIndex(
                name: "IX_RulesetCharacterStatClusterTiles_RulesetTileId",
                table: "RulesetCharacterStatClusterTile",
                newName: "IX_RulesetCharacterStatClusterTile_RulesetTileId");

            migrationBuilder.RenameIndex(
                name: "IX_RulesetCharacterStatClusterTiles_DisplayCharactersCharacterStatID",
                table: "RulesetCharacterStatClusterTile",
                newName: "IX_RulesetCharacterStatClusterTile_DisplayCharactersCharacterStatID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RulesetCharacterStatClusterTile",
                table: "RulesetCharacterStatClusterTile",
                column: "CharacterStatClusterTileId");

            migrationBuilder.AddForeignKey(
                name: "FK_RulesetCharacterStatClusterTile_CharacterStats_DisplayCharactersCharacterStatID",
                table: "RulesetCharacterStatClusterTile",
                column: "DisplayCharactersCharacterStatID",
                principalTable: "CharacterStats",
                principalColumn: "CharacterStatId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RulesetCharacterStatClusterTile_RulesetTiles_RulesetTileId",
                table: "RulesetCharacterStatClusterTile",
                column: "RulesetTileId",
                principalTable: "RulesetTiles",
                principalColumn: "RulesetTileId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
