using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class reset_ConditionsTables_update : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CharacterStatConditions_ConditionOperators_ConditionOperatorID",
                table: "CharacterStatConditions");

            migrationBuilder.AlterColumn<int>(
                name: "ConditionOperatorID",
                table: "CharacterStatConditions",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AddForeignKey(
                name: "FK_CharacterStatConditions_ConditionOperators_ConditionOperatorID",
                table: "CharacterStatConditions",
                column: "ConditionOperatorID",
                principalTable: "ConditionOperators",
                principalColumn: "ConditionOperatorId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CharacterStatConditions_ConditionOperators_ConditionOperatorID",
                table: "CharacterStatConditions");

            migrationBuilder.AlterColumn<int>(
                name: "ConditionOperatorID",
                table: "CharacterStatConditions",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_CharacterStatConditions_ConditionOperators_ConditionOperatorID",
                table: "CharacterStatConditions",
                column: "ConditionOperatorID",
                principalTable: "ConditionOperators",
                principalColumn: "ConditionOperatorId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
