using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class Update_Column_ShareCode_Nullable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_RuleSets_ShareCode",
                table: "RuleSets");

            migrationBuilder.AlterColumn<Guid>(
                name: "ShareCode",
                table: "RuleSets",
                nullable: true,
                oldClrType: typeof(Guid));

            migrationBuilder.CreateIndex(
                name: "IX_RuleSets_ShareCode",
                table: "RuleSets",
                column: "ShareCode",
                unique: true,
                filter: "[ShareCode] IS NOT NULL");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_RuleSets_ShareCode",
                table: "RuleSets");

            migrationBuilder.AlterColumn<Guid>(
                name: "ShareCode",
                table: "RuleSets",
                nullable: false,
                oldClrType: typeof(Guid),
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_RuleSets_ShareCode",
                table: "RuleSets",
                column: "ShareCode",
                unique: true);
        }
    }
}
