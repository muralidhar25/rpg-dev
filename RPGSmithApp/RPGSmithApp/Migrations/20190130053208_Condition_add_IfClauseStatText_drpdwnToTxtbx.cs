using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class Condition_add_IfClauseStatText_drpdwnToTxtbx : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CharacterStatConditions_CharacterStats_IfClauseStatId",
                table: "CharacterStatConditions");

            migrationBuilder.DropIndex(
                name: "IX_CharacterStatConditions_IfClauseStatId",
                table: "CharacterStatConditions");

            migrationBuilder.DropColumn(
                name: "IfClauseStatId",
                table: "CharacterStatConditions");

            migrationBuilder.DropColumn(
                name: "IfClauseStattype",
                table: "CharacterStatConditions");

            migrationBuilder.AddColumn<string>(
                name: "IfClauseStatText",
                table: "CharacterStatConditions",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IfClauseStatText",
                table: "CharacterStatConditions");

            migrationBuilder.AddColumn<int>(
                name: "IfClauseStatId",
                table: "CharacterStatConditions",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "IfClauseStattype",
                table: "CharacterStatConditions",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_CharacterStatConditions_IfClauseStatId",
                table: "CharacterStatConditions",
                column: "IfClauseStatId");

            migrationBuilder.AddForeignKey(
                name: "FK_CharacterStatConditions_CharacterStats_IfClauseStatId",
                table: "CharacterStatConditions",
                column: "IfClauseStatId",
                principalTable: "CharacterStats",
                principalColumn: "CharacterStatId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
