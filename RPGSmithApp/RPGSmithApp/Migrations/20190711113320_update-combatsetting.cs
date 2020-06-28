using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class updatecombatsetting : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CombatSettings_Combats_CombatId",
                table: "CombatSettings");

            migrationBuilder.DropIndex(
                name: "IX_CombatSettings_CombatId",
                table: "CombatSettings");

            migrationBuilder.DropColumn(
                name: "CombatId",
                table: "CombatSettings");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CombatId",
                table: "CombatSettings",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_CombatSettings_CombatId",
                table: "CombatSettings",
                column: "CombatId",
                unique: true,
                filter: "[CombatId] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_CombatSettings_Combats_CombatId",
                table: "CombatSettings",
                column: "CombatId",
                principalTable: "Combats",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
