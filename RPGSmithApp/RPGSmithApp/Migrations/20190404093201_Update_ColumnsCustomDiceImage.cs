using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class Update_ColumnsCustomDiceImage : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CustomDicetype",
                table: "CustomDices",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Image",
                table: "CustomDiceResults",
                type: "nvarchar(2048)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Number",
                table: "CustomDiceResults",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CustomDicetype",
                table: "CustomDices");

            migrationBuilder.DropColumn(
                name: "Image",
                table: "CustomDiceResults");

            migrationBuilder.DropColumn(
                name: "Number",
                table: "CustomDiceResults");
        }
    }
}
