using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class fontControl_Title : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FontSizeTitle",
                table: "RulesetToggleTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "FontSizeTitle",
                table: "RulesetNoteTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "FontSizeTitle",
                table: "RulesetImageTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "FontSizeTitle",
                table: "RulesetCurrencyTypeTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "FontSizeTitle",
                table: "RulesetCounterTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "FontSizeTitle",
                table: "RulesetCommandTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "FontSizeTitle",
                table: "RulesetCharacterStatTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "FontSizeTitle",
                table: "RulesetCharacterStatClusterTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "FontSizeTitle",
                table: "RulesetBuffAndEffectTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "FontSizeTitle",
                table: "CharacterToggleTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "FontSizeTitle",
                table: "CharacterNoteTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "FontSizeTitle",
                table: "CharacterLinkTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "FontSizeTitle",
                table: "CharacterImageTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "FontSizeTitle",
                table: "CharacterExecuteTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "FontSizeTitle",
                table: "CharacterCurrencyTypeTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "FontSizeTitle",
                table: "CharacterCounterTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "FontSizeTitle",
                table: "CharacterCommandTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "FontSizeTitle",
                table: "CharacterCharacterStatTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "FontSizeTitle",
                table: "CharacterCharacterStatClusterTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "FontSizeTitle",
                table: "CharacterBuffAndEffectTiles",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FontSizeTitle",
                table: "RulesetToggleTiles");

            migrationBuilder.DropColumn(
                name: "FontSizeTitle",
                table: "RulesetNoteTiles");

            migrationBuilder.DropColumn(
                name: "FontSizeTitle",
                table: "RulesetImageTiles");

            migrationBuilder.DropColumn(
                name: "FontSizeTitle",
                table: "RulesetCurrencyTypeTiles");

            migrationBuilder.DropColumn(
                name: "FontSizeTitle",
                table: "RulesetCounterTiles");

            migrationBuilder.DropColumn(
                name: "FontSizeTitle",
                table: "RulesetCommandTiles");

            migrationBuilder.DropColumn(
                name: "FontSizeTitle",
                table: "RulesetCharacterStatTiles");

            migrationBuilder.DropColumn(
                name: "FontSizeTitle",
                table: "RulesetCharacterStatClusterTiles");

            migrationBuilder.DropColumn(
                name: "FontSizeTitle",
                table: "RulesetBuffAndEffectTiles");

            migrationBuilder.DropColumn(
                name: "FontSizeTitle",
                table: "CharacterToggleTiles");

            migrationBuilder.DropColumn(
                name: "FontSizeTitle",
                table: "CharacterNoteTiles");

            migrationBuilder.DropColumn(
                name: "FontSizeTitle",
                table: "CharacterLinkTiles");

            migrationBuilder.DropColumn(
                name: "FontSizeTitle",
                table: "CharacterImageTiles");

            migrationBuilder.DropColumn(
                name: "FontSizeTitle",
                table: "CharacterExecuteTiles");

            migrationBuilder.DropColumn(
                name: "FontSizeTitle",
                table: "CharacterCurrencyTypeTiles");

            migrationBuilder.DropColumn(
                name: "FontSizeTitle",
                table: "CharacterCounterTiles");

            migrationBuilder.DropColumn(
                name: "FontSizeTitle",
                table: "CharacterCommandTiles");

            migrationBuilder.DropColumn(
                name: "FontSizeTitle",
                table: "CharacterCharacterStatTiles");

            migrationBuilder.DropColumn(
                name: "FontSizeTitle",
                table: "CharacterCharacterStatClusterTiles");

            migrationBuilder.DropColumn(
                name: "FontSizeTitle",
                table: "CharacterBuffAndEffectTiles");
        }
    }
}
