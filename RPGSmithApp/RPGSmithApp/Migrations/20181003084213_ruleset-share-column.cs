using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class rulesetsharecolumn : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            //migrationBuilder.AlterColumn<bool>(
            //    name: "IsSpellEnabled",
            //    table: "RuleSets",
            //    nullable: false,
            //    oldClrType: typeof(bool),
            //    oldNullable: true);

            //migrationBuilder.AlterColumn<bool>(
            //    name: "IsItemEnabled",
            //    table: "RuleSets",
            //    nullable: false,
            //    oldClrType: typeof(bool),
            //    oldNullable: true);

            //migrationBuilder.AlterColumn<bool>(
            //    name: "IsAbilityEnabled",
            //    table: "RuleSets",
            //    nullable: false,
            //    oldClrType: typeof(bool),
            //    oldNullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsAllowSharing",
                table: "RuleSets",
                nullable: false,
                defaultValue: false);

            //migrationBuilder.AddColumn<Guid>(
            //    name: "ShareCode",
            //    table: "RuleSets",
            //    nullable: false,
            //    defaultValue: Guid.NewGuid().ToString());
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsAllowSharing",
                table: "RuleSets");

            //migrationBuilder.DropColumn(
            //    name: "ShareCode",
            //    table: "RuleSets");

            //migrationBuilder.AlterColumn<bool>(
            //    name: "IsSpellEnabled",
            //    table: "RuleSets",
            //    nullable: false,
            //    oldClrType: typeof(bool));

            //migrationBuilder.AlterColumn<bool>(
            //    name: "IsItemEnabled",
            //    table: "RuleSets",
            //    nullable: false,
            //    oldClrType: typeof(bool));

            //migrationBuilder.AlterColumn<bool>(
            //    name: "IsAbilityEnabled",
            //    table: "RuleSets",
            //    nullable: false,
            //    oldClrType: typeof(bool));
        }
    }
}
