using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class NotificationStatUpdateschanges : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "CharacterStatValue",
                table: "NotificationStatUpdates",
                nullable: false,
                oldClrType: typeof(int));

            migrationBuilder.AlterColumn<string>(
                name: "CharacterStatName",
                table: "NotificationStatUpdates",
                nullable: false,
                oldClrType: typeof(int));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "CharacterStatValue",
                table: "NotificationStatUpdates",
                nullable: false,
                oldClrType: typeof(string));

            migrationBuilder.AlterColumn<int>(
                name: "CharacterStatName",
                table: "NotificationStatUpdates",
                nullable: false,
                oldClrType: typeof(string));
        }
    }
}
