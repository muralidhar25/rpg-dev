using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class Update_ColumnsCustomDiceImageResults : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Number",
                table: "CustomDiceResults");

            migrationBuilder.RenameColumn(
                name: "Image",
                table: "CustomDiceResults",
                newName: "DisplayContent");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DisplayContent",
                table: "CustomDiceResults",
                newName: "Image");

            migrationBuilder.AddColumn<int>(
                name: "Number",
                table: "CustomDiceResults",
                nullable: false,
                defaultValue: 0);
        }
    }
}
