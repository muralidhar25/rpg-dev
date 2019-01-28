using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class CharacterSideToggle : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CustomToggleId",
                table: "CharactersCharacterStats",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Display",
                table: "CharactersCharacterStats",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsCustom",
                table: "CharactersCharacterStats",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ShowCheckbox",
                table: "CharactersCharacterStats",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "CharacterCustomToggle",
                columns: table => new
                {
                    CustomToggleId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    ToggleText = table.Column<string>(nullable: true),
                    Image = table.Column<string>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CharacterCustomToggle", x => x.CustomToggleId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CharactersCharacterStats_CustomToggleId",
                table: "CharactersCharacterStats",
                column: "CustomToggleId");

            migrationBuilder.AddForeignKey(
                name: "FK_CharactersCharacterStats_CharacterCustomToggle_CustomToggleId",
                table: "CharactersCharacterStats",
                column: "CustomToggleId",
                principalTable: "CharacterCustomToggle",
                principalColumn: "CustomToggleId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CharactersCharacterStats_CharacterCustomToggle_CustomToggleId",
                table: "CharactersCharacterStats");

            migrationBuilder.DropTable(
                name: "CharacterCustomToggle");

            migrationBuilder.DropIndex(
                name: "IX_CharactersCharacterStats_CustomToggleId",
                table: "CharactersCharacterStats");

            migrationBuilder.DropColumn(
                name: "CustomToggleId",
                table: "CharactersCharacterStats");

            migrationBuilder.DropColumn(
                name: "Display",
                table: "CharactersCharacterStats");

            migrationBuilder.DropColumn(
                name: "IsCustom",
                table: "CharactersCharacterStats");

            migrationBuilder.DropColumn(
                name: "ShowCheckbox",
                table: "CharactersCharacterStats");
        }
    }
}
