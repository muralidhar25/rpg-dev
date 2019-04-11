using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class revertuser : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GmEndDate",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "IsGm",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "IsGmPermanent",
                table: "AspNetUsers");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "GmEndDate",
                table: "AspNetUsers",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsGm",
                table: "AspNetUsers",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsGmPermanent",
                table: "AspNetUsers",
                nullable: false,
                defaultValue: false);
        }
    }
}
