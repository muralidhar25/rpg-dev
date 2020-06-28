using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class monster_ally_CharacterAssociation : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CharacterId",
                table: "Monsters",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Monsters_CharacterId",
                table: "Monsters",
                column: "CharacterId");

            migrationBuilder.AddForeignKey(
                name: "FK_Monsters_Characters_CharacterId",
                table: "Monsters",
                column: "CharacterId",
                principalTable: "Characters",
                principalColumn: "CharacterId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Monsters_Characters_CharacterId",
                table: "Monsters");

            migrationBuilder.DropIndex(
                name: "IX_Monsters_CharacterId",
                table: "Monsters");

            migrationBuilder.DropColumn(
                name: "CharacterId",
                table: "Monsters");
        }
    }
}
