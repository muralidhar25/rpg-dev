using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class _938commandcolumns : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            //migrationBuilder.DropForeignKey(
            //    name: "FK_MonsterTemplateMonsters_MonsterTemplates_AssociateMonsterTemplateId",
            //    table: "MonsterTemplateMonsters");

            //migrationBuilder.DropIndex(
            //    name: "IX_MonsterTemplateMonsters_AssociateMonsterTemplateId",
            //    table: "MonsterTemplateMonsters");

            migrationBuilder.AddColumn<bool>(
                name: "IsCommandChecked",
                table: "CharacterCommandTiles",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "CommandTileId",
                table: "CharacterCommands",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsCommandChecked",
                table: "CharacterCommandTiles");

            migrationBuilder.DropColumn(
                name: "CommandTileId",
                table: "CharacterCommands");

            //migrationBuilder.CreateIndex(
            //    name: "IX_MonsterTemplateMonsters_AssociateMonsterTemplateId",
            //    table: "MonsterTemplateMonsters",
            //    column: "AssociateMonsterTemplateId");

            //migrationBuilder.AddForeignKey(
            //    name: "FK_MonsterTemplateMonsters_MonsterTemplates_AssociateMonsterTemplateId",
            //    table: "MonsterTemplateMonsters",
            //    column: "AssociateMonsterTemplateId",
            //    principalTable: "MonsterTemplates",
            //    principalColumn: "MonsterTemplateId",
            //    onDelete: ReferentialAction.Cascade);
        }
    }
}
