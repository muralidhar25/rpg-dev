using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class monster_associateItem_update : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "ItemMasterMonsterItems",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "MonsterId",
                table: "ItemMasterMonsterItems",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_ItemMasterMonsterItems_MonsterId",
                table: "ItemMasterMonsterItems",
                column: "MonsterId");

            migrationBuilder.AddForeignKey(
                name: "FK_ItemMasterMonsterItems_Monsters_MonsterId",
                table: "ItemMasterMonsterItems",
                column: "MonsterId",
                principalTable: "Monsters",
                principalColumn: "MonsterId",
                onDelete: ReferentialAction.NoAction);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ItemMasterMonsterItems_Monsters_MonsterId",
                table: "ItemMasterMonsterItems");

            migrationBuilder.DropIndex(
                name: "IX_ItemMasterMonsterItems_MonsterId",
                table: "ItemMasterMonsterItems");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "ItemMasterMonsterItems");

            migrationBuilder.DropColumn(
                name: "MonsterId",
                table: "ItemMasterMonsterItems");
        }
    }
}
