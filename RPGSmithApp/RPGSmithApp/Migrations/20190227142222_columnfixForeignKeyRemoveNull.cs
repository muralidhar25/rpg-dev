using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class columnfixForeignKeyRemoveNull : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SearchFilter_Characters_CharacterId",
                table: "SearchFilter");

            migrationBuilder.DropForeignKey(
                name: "FK_SearchFilter_RuleSets_RulesetId",
                table: "SearchFilter");

            migrationBuilder.AlterColumn<int>(
                name: "RulesetId",
                table: "SearchFilter",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AlterColumn<int>(
                name: "CharacterId",
                table: "SearchFilter",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AddForeignKey(
                name: "FK_SearchFilter_Characters_CharacterId",
                table: "SearchFilter",
                column: "CharacterId",
                principalTable: "Characters",
                principalColumn: "CharacterId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SearchFilter_RuleSets_RulesetId",
                table: "SearchFilter",
                column: "RulesetId",
                principalTable: "RuleSets",
                principalColumn: "RuleSetId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SearchFilter_Characters_CharacterId",
                table: "SearchFilter");

            migrationBuilder.DropForeignKey(
                name: "FK_SearchFilter_RuleSets_RulesetId",
                table: "SearchFilter");

            migrationBuilder.AlterColumn<int>(
                name: "RulesetId",
                table: "SearchFilter",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "CharacterId",
                table: "SearchFilter",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_SearchFilter_Characters_CharacterId",
                table: "SearchFilter",
                column: "CharacterId",
                principalTable: "Characters",
                principalColumn: "CharacterId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SearchFilter_RuleSets_RulesetId",
                table: "SearchFilter",
                column: "RulesetId",
                principalTable: "RuleSets",
                principalColumn: "RuleSetId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
