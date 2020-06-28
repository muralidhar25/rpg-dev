using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class updateFilterTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsAC",
                table: "SearchFilter",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsAssociatedBE",
                table: "SearchFilter",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsAssociatedItem",
                table: "SearchFilter",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsBuffEffect",
                table: "SearchFilter",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsChallengeRating",
                table: "SearchFilter",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsHandout",
                table: "SearchFilter",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsHealth",
                table: "SearchFilter",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsLoot",
                table: "SearchFilter",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsLootTemplate",
                table: "SearchFilter",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsMonster",
                table: "SearchFilter",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsMonsterTemplate",
                table: "SearchFilter",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsXPValue",
                table: "SearchFilter",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsAC",
                table: "SearchFilter");

            migrationBuilder.DropColumn(
                name: "IsAssociatedBE",
                table: "SearchFilter");

            migrationBuilder.DropColumn(
                name: "IsAssociatedItem",
                table: "SearchFilter");

            migrationBuilder.DropColumn(
                name: "IsBuffEffect",
                table: "SearchFilter");

            migrationBuilder.DropColumn(
                name: "IsChallengeRating",
                table: "SearchFilter");

            migrationBuilder.DropColumn(
                name: "IsHandout",
                table: "SearchFilter");

            migrationBuilder.DropColumn(
                name: "IsHealth",
                table: "SearchFilter");

            migrationBuilder.DropColumn(
                name: "IsLoot",
                table: "SearchFilter");

            migrationBuilder.DropColumn(
                name: "IsLootTemplate",
                table: "SearchFilter");

            migrationBuilder.DropColumn(
                name: "IsMonster",
                table: "SearchFilter");

            migrationBuilder.DropColumn(
                name: "IsMonsterTemplate",
                table: "SearchFilter");

            migrationBuilder.DropColumn(
                name: "IsXPValue",
                table: "SearchFilter");
        }
    }
}
