using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class RuleSetFeaturecol : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsAbilityEnabled",
                table: "RuleSets",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsItemEnabled",
                table: "RuleSets",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsSpellEnabled",
                table: "RuleSets",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Minimum",
                table: "CharacterCounterTiles",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AlterColumn<int>(
                name: "Maximum",
                table: "CharacterCounterTiles",
                nullable: true,
                oldClrType: typeof(int));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsAbilityEnabled",
                table: "RuleSets");

            migrationBuilder.DropColumn(
                name: "IsItemEnabled",
                table: "RuleSets");

            migrationBuilder.DropColumn(
                name: "IsSpellEnabled",
                table: "RuleSets");

            migrationBuilder.AlterColumn<int>(
                name: "Minimum",
                table: "CharacterCounterTiles",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Maximum",
                table: "CharacterCounterTiles",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);
        }
    }
}
