using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class update_PlayerInvite : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsAnswerLater",
                table: "PlayerInvites",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeclined",
                table: "PlayerInvites",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsSendToUserName",
                table: "PlayerInvites",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsAnswerLater",
                table: "PlayerInvites");

            migrationBuilder.DropColumn(
                name: "IsDeclined",
                table: "PlayerInvites");

            migrationBuilder.DropColumn(
                name: "IsSendToUserName",
                table: "PlayerInvites");
        }
    }
}
