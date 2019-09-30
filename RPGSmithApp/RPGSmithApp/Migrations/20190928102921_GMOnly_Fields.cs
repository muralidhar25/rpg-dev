using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class GMOnly_Fields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "gmOnly",
                table: "Spells",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "gmOnly",
                table: "MonsterTemplates",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "gmOnly",
                table: "MonsterTemplateBundles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "gmOnly",
                table: "Monsters",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "gmOnly",
                table: "LootTemplates",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "gmOnly",
                table: "Items",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "gmOnly",
                table: "ItemMasters",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "gmOnly",
                table: "ItemMasterLoots",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "gmOnly",
                table: "ItemMasterBundles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "gmOnly",
                table: "BuffAndEffects",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "gmOnly",
                table: "Abilities",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "gmOnly",
                table: "Spells");

            migrationBuilder.DropColumn(
                name: "gmOnly",
                table: "MonsterTemplates");

            migrationBuilder.DropColumn(
                name: "gmOnly",
                table: "MonsterTemplateBundles");

            migrationBuilder.DropColumn(
                name: "gmOnly",
                table: "Monsters");

            migrationBuilder.DropColumn(
                name: "gmOnly",
                table: "LootTemplates");

            migrationBuilder.DropColumn(
                name: "gmOnly",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "gmOnly",
                table: "ItemMasters");

            migrationBuilder.DropColumn(
                name: "gmOnly",
                table: "ItemMasterLoots");

            migrationBuilder.DropColumn(
                name: "gmOnly",
                table: "ItemMasterBundles");

            migrationBuilder.DropColumn(
                name: "gmOnly",
                table: "BuffAndEffects");

            migrationBuilder.DropColumn(
                name: "gmOnly",
                table: "Abilities");
        }
    }
}
