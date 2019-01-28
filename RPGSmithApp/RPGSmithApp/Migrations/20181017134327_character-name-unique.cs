using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class characternameunique : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "UIX_Characters_UserId_CharacterName",
                table: "Characters");

            migrationBuilder.CreateIndex(
                name: "UIX_Characters_UserId_CharacterName",
                table: "Characters",
                columns: new[] { "UserId", "CharacterName", "IsDeleted" },
                unique: true,
                filter: "[IsDeleted] IS NOT NULL");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "UIX_Characters_UserId_CharacterName",
                table: "Characters");

            migrationBuilder.CreateIndex(
                name: "UIX_Characters_UserId_CharacterName",
                table: "Characters",
                columns: new[] { "UserId", "CharacterName" },
                unique: true);
        }
    }
}
