using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class BuffEffectPlayerControl : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "PauseBuffAndEffectAdd",
                table: "PlayerControls",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "PauseBuffAndEffectCreate",
                table: "PlayerControls",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PauseBuffAndEffectAdd",
                table: "PlayerControls");

            migrationBuilder.DropColumn(
                name: "PauseBuffAndEffectCreate",
                table: "PlayerControls");
        }
    }
}
