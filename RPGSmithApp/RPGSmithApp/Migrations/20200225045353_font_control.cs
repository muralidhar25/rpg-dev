using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class font_control : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FontSize",
                table: "RulesetToggleTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsManual",
                table: "RulesetToggleTiles",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "FontSizeText",
                table: "RulesetTextTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "FontSizeTitle",
                table: "RulesetTextTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsManualText",
                table: "RulesetTextTiles",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsManualTitle",
                table: "RulesetTextTiles",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "FontSize",
                table: "RulesetNoteTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsManual",
                table: "RulesetNoteTiles",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "FontSize",
                table: "RulesetImageTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsManual",
                table: "RulesetImageTiles",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "FontSize",
                table: "RulesetCurrencyTypeTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsManual",
                table: "RulesetCurrencyTypeTiles",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "FontSize",
                table: "RulesetCounterTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsManual",
                table: "RulesetCounterTiles",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "FontSize",
                table: "RulesetCommandTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsManual",
                table: "RulesetCommandTiles",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "FontSize",
                table: "RulesetCharacterStatTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsManual",
                table: "RulesetCharacterStatTiles",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "FontSize",
                table: "RulesetCharacterStatClusterTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsManual",
                table: "RulesetCharacterStatClusterTiles",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "FontSize",
                table: "RulesetBuffAndEffectTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsManual",
                table: "RulesetBuffAndEffectTiles",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "FontSize",
                table: "CharacterToggleTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsManual",
                table: "CharacterToggleTiles",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "FontSizeText",
                table: "CharacterTextTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "FontSizeTitle",
                table: "CharacterTextTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsManualText",
                table: "CharacterTextTiles",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsManualTitle",
                table: "CharacterTextTiles",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "FontSize",
                table: "CharacterNoteTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsManual",
                table: "CharacterNoteTiles",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "FontSize",
                table: "CharacterLinkTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsManual",
                table: "CharacterLinkTiles",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "FontSize",
                table: "CharacterImageTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsManual",
                table: "CharacterImageTiles",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "FontSize",
                table: "CharacterExecuteTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsManual",
                table: "CharacterExecuteTiles",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "FontSize",
                table: "CharacterCurrencyTypeTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsManual",
                table: "CharacterCurrencyTypeTiles",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "FontSize",
                table: "CharacterCounterTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsManual",
                table: "CharacterCounterTiles",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "FontSize",
                table: "CharacterCommandTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsManual",
                table: "CharacterCommandTiles",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "FontSize",
                table: "CharacterCharacterStatTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsManual",
                table: "CharacterCharacterStatTiles",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "FontSize",
                table: "CharacterCharacterStatClusterTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsManual",
                table: "CharacterCharacterStatClusterTiles",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "FontSize",
                table: "CharacterBuffAndEffectTiles",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsManual",
                table: "CharacterBuffAndEffectTiles",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FontSize",
                table: "RulesetToggleTiles");

            migrationBuilder.DropColumn(
                name: "IsManual",
                table: "RulesetToggleTiles");

            migrationBuilder.DropColumn(
                name: "FontSizeText",
                table: "RulesetTextTiles");

            migrationBuilder.DropColumn(
                name: "FontSizeTitle",
                table: "RulesetTextTiles");

            migrationBuilder.DropColumn(
                name: "IsManualText",
                table: "RulesetTextTiles");

            migrationBuilder.DropColumn(
                name: "IsManualTitle",
                table: "RulesetTextTiles");

            migrationBuilder.DropColumn(
                name: "FontSize",
                table: "RulesetNoteTiles");

            migrationBuilder.DropColumn(
                name: "IsManual",
                table: "RulesetNoteTiles");

            migrationBuilder.DropColumn(
                name: "FontSize",
                table: "RulesetImageTiles");

            migrationBuilder.DropColumn(
                name: "IsManual",
                table: "RulesetImageTiles");

            migrationBuilder.DropColumn(
                name: "FontSize",
                table: "RulesetCurrencyTypeTiles");

            migrationBuilder.DropColumn(
                name: "IsManual",
                table: "RulesetCurrencyTypeTiles");

            migrationBuilder.DropColumn(
                name: "FontSize",
                table: "RulesetCounterTiles");

            migrationBuilder.DropColumn(
                name: "IsManual",
                table: "RulesetCounterTiles");

            migrationBuilder.DropColumn(
                name: "FontSize",
                table: "RulesetCommandTiles");

            migrationBuilder.DropColumn(
                name: "IsManual",
                table: "RulesetCommandTiles");

            migrationBuilder.DropColumn(
                name: "FontSize",
                table: "RulesetCharacterStatTiles");

            migrationBuilder.DropColumn(
                name: "IsManual",
                table: "RulesetCharacterStatTiles");

            migrationBuilder.DropColumn(
                name: "FontSize",
                table: "RulesetCharacterStatClusterTiles");

            migrationBuilder.DropColumn(
                name: "IsManual",
                table: "RulesetCharacterStatClusterTiles");

            migrationBuilder.DropColumn(
                name: "FontSize",
                table: "RulesetBuffAndEffectTiles");

            migrationBuilder.DropColumn(
                name: "IsManual",
                table: "RulesetBuffAndEffectTiles");

            migrationBuilder.DropColumn(
                name: "FontSize",
                table: "CharacterToggleTiles");

            migrationBuilder.DropColumn(
                name: "IsManual",
                table: "CharacterToggleTiles");

            migrationBuilder.DropColumn(
                name: "FontSizeText",
                table: "CharacterTextTiles");

            migrationBuilder.DropColumn(
                name: "FontSizeTitle",
                table: "CharacterTextTiles");

            migrationBuilder.DropColumn(
                name: "IsManualText",
                table: "CharacterTextTiles");

            migrationBuilder.DropColumn(
                name: "IsManualTitle",
                table: "CharacterTextTiles");

            migrationBuilder.DropColumn(
                name: "FontSize",
                table: "CharacterNoteTiles");

            migrationBuilder.DropColumn(
                name: "IsManual",
                table: "CharacterNoteTiles");

            migrationBuilder.DropColumn(
                name: "FontSize",
                table: "CharacterLinkTiles");

            migrationBuilder.DropColumn(
                name: "IsManual",
                table: "CharacterLinkTiles");

            migrationBuilder.DropColumn(
                name: "FontSize",
                table: "CharacterImageTiles");

            migrationBuilder.DropColumn(
                name: "IsManual",
                table: "CharacterImageTiles");

            migrationBuilder.DropColumn(
                name: "FontSize",
                table: "CharacterExecuteTiles");

            migrationBuilder.DropColumn(
                name: "IsManual",
                table: "CharacterExecuteTiles");

            migrationBuilder.DropColumn(
                name: "FontSize",
                table: "CharacterCurrencyTypeTiles");

            migrationBuilder.DropColumn(
                name: "IsManual",
                table: "CharacterCurrencyTypeTiles");

            migrationBuilder.DropColumn(
                name: "FontSize",
                table: "CharacterCounterTiles");

            migrationBuilder.DropColumn(
                name: "IsManual",
                table: "CharacterCounterTiles");

            migrationBuilder.DropColumn(
                name: "FontSize",
                table: "CharacterCommandTiles");

            migrationBuilder.DropColumn(
                name: "IsManual",
                table: "CharacterCommandTiles");

            migrationBuilder.DropColumn(
                name: "FontSize",
                table: "CharacterCharacterStatTiles");

            migrationBuilder.DropColumn(
                name: "IsManual",
                table: "CharacterCharacterStatTiles");

            migrationBuilder.DropColumn(
                name: "FontSize",
                table: "CharacterCharacterStatClusterTiles");

            migrationBuilder.DropColumn(
                name: "IsManual",
                table: "CharacterCharacterStatClusterTiles");

            migrationBuilder.DropColumn(
                name: "FontSize",
                table: "CharacterBuffAndEffectTiles");

            migrationBuilder.DropColumn(
                name: "IsManual",
                table: "CharacterBuffAndEffectTiles");
        }
    }
}
