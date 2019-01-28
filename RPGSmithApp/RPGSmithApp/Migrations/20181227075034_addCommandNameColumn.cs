using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class addCommandNameColumn : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CommandName",
                table: "Spells",
                type: "nvarchar(100)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CommandName",
                table: "Items",
                type: "nvarchar(100)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CommandName",
                table: "ItemMasters",
                type: "nvarchar(100)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CommandName",
                table: "Abilities",
                type: "nvarchar(100)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CommandName",
                table: "Spells");

            migrationBuilder.DropColumn(
                name: "CommandName",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "CommandName",
                table: "ItemMasters");

            migrationBuilder.DropColumn(
                name: "CommandName",
                table: "Abilities");
        }
    }
}
