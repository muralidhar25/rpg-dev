using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class guidcharstat : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {  
            
            migrationBuilder.AddColumn<Guid>(
                name: "StatIdentifier",
                table: "CharacterStats",
                nullable: true);     
            
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            
            migrationBuilder.DropColumn(
                name: "StatIdentifier",
                table: "CharacterStats");
            
        }
    }
}
