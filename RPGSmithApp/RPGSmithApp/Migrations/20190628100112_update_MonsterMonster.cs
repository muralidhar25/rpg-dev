using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class update_MonsterMonster : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MonsterMonsters_Monsters_AssociateMonsterId",
                table: "MonsterMonsters");

            migrationBuilder.AddForeignKey(
                name: "FK_MonsterMonsters_MonsterTemplates_AssociateMonsterId",
                table: "MonsterMonsters",
                column: "AssociateMonsterId",
                principalTable: "MonsterTemplates",
                principalColumn: "MonsterTemplateId",
                onDelete: ReferentialAction.NoAction);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MonsterMonsters_MonsterTemplates_AssociateMonsterId",
                table: "MonsterMonsters");

            migrationBuilder.AddForeignKey(
                name: "FK_MonsterMonsters_Monsters_AssociateMonsterId",
                table: "MonsterMonsters",
                column: "AssociateMonsterId",
                principalTable: "Monsters",
                principalColumn: "MonsterId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
