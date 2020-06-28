using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class updatedisplayStatforCluster : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CharacterCharacterStatClusterTiles_CharacterStats_DisplayCharacterStatId",
                table: "CharacterCharacterStatClusterTiles");

            migrationBuilder.RenameColumn(
                name: "DisplayCharacterStatId",
                table: "CharacterCharacterStatClusterTiles",
                newName: "DisplayCharactersCharacterStatID");

            migrationBuilder.RenameIndex(
                name: "IX_CharacterCharacterStatClusterTiles_DisplayCharacterStatId",
                table: "CharacterCharacterStatClusterTiles",
                newName: "IX_CharacterCharacterStatClusterTiles_DisplayCharactersCharacterStatID");

            migrationBuilder.AddForeignKey(
                name: "FK_CharacterCharacterStatClusterTiles_CharactersCharacterStats_DisplayCharactersCharacterStatID",
                table: "CharacterCharacterStatClusterTiles",
                column: "DisplayCharactersCharacterStatID",
                principalTable: "CharactersCharacterStats",
                principalColumn: "CharactersCharacterStatId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CharacterCharacterStatClusterTiles_CharactersCharacterStats_DisplayCharactersCharacterStatID",
                table: "CharacterCharacterStatClusterTiles");

            migrationBuilder.RenameColumn(
                name: "DisplayCharactersCharacterStatID",
                table: "CharacterCharacterStatClusterTiles",
                newName: "DisplayCharacterStatId");

            migrationBuilder.RenameIndex(
                name: "IX_CharacterCharacterStatClusterTiles_DisplayCharactersCharacterStatID",
                table: "CharacterCharacterStatClusterTiles",
                newName: "IX_CharacterCharacterStatClusterTiles_DisplayCharacterStatId");

            migrationBuilder.AddForeignKey(
                name: "FK_CharacterCharacterStatClusterTiles_CharacterStats_DisplayCharacterStatId",
                table: "CharacterCharacterStatClusterTiles",
                column: "DisplayCharacterStatId",
                principalTable: "CharacterStats",
                principalColumn: "CharacterStatId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
