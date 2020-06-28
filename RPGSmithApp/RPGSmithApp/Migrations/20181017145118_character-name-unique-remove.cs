using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class characternameuniqueremove : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "UIX_Characters_UserId_CharacterName",
                table: "Characters");

            migrationBuilder.CreateIndex(
                name: "IX_Characters_UserId",
                table: "Characters",
                column: "UserId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Characters_UserId",
                table: "Characters");

            migrationBuilder.CreateIndex(
                name: "UIX_Characters_UserId_CharacterName",
                table: "Characters",
                columns: new[] { "UserId", "CharacterName", "IsDeleted" },
                unique: true,
                filter: "[IsDeleted] IS NOT NULL");
        }
    }
}
