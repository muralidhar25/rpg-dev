using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class addedcolumnimage : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "RulesetCharacterStatTiles",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "CharacterCharacterStatTiles",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "RulesetCharacterStatTiles");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "CharacterCharacterStatTiles");
        }
    }
}
