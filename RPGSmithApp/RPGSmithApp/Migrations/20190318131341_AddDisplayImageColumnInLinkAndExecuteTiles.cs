using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class AddDisplayImageColumnInLinkAndExecuteTiles : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "DisplayLinkImage",
                table: "CharacterLinkTiles",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "DisplayLinkImage",
                table: "CharacterExecuteTiles",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DisplayLinkImage",
                table: "CharacterLinkTiles");

            migrationBuilder.DropColumn(
                name: "DisplayLinkImage",
                table: "CharacterExecuteTiles");
        }
    }
}
