using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class clustertile_listInCharacterTile : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CharacterCharacterStatClusterTiles_CharacterTileId",
                table: "CharacterCharacterStatClusterTiles");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterCharacterStatClusterTiles_CharacterTileId",
                table: "CharacterCharacterStatClusterTiles",
                column: "CharacterTileId",
                unique: true,
                filter: "[CharacterTileId] IS NOT NULL");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CharacterCharacterStatClusterTiles_CharacterTileId",
                table: "CharacterCharacterStatClusterTiles");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterCharacterStatClusterTiles_CharacterTileId",
                table: "CharacterCharacterStatClusterTiles",
                column: "CharacterTileId");
        }
    }
}
