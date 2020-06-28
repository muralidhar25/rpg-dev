using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class Add_Column_SelectedChoiceCharacterStatId : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SelectedChoiceCharacterStatId",
                table: "CharacterStats",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_CharacterStats_SelectedChoiceCharacterStatId",
                table: "CharacterStats",
                column: "SelectedChoiceCharacterStatId");

            migrationBuilder.AddForeignKey(
                name: "FK_CharacterStats_CharacterStats_SelectedChoiceCharacterStatId",
                table: "CharacterStats",
                column: "SelectedChoiceCharacterStatId",
                principalTable: "CharacterStats",
                principalColumn: "CharacterStatId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CharacterStats_CharacterStats_SelectedChoiceCharacterStatId",
                table: "CharacterStats");

            migrationBuilder.DropIndex(
                name: "IX_CharacterStats_SelectedChoiceCharacterStatId",
                table: "CharacterStats");

            migrationBuilder.DropColumn(
                name: "SelectedChoiceCharacterStatId",
                table: "CharacterStats");
        }
    }
}
