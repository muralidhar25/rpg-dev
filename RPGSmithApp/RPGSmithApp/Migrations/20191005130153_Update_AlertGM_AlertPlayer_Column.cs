using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class Update_AlertGM_AlertPlayer_Column : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AlertToGM",
                table: "LogStatUpdates",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "AlertToPlayer",
                table: "LogStatUpdates",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AlertToGM",
                table: "LogStatUpdates");

            migrationBuilder.DropColumn(
                name: "AlertToPlayer",
                table: "LogStatUpdates");
        }
    }
}
