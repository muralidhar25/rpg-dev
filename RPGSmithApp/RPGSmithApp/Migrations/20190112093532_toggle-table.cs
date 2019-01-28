using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class toggletable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CharacterStatToggle",
                columns: table => new
                {
                    CharacterStatToggleId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    YesNo = table.Column<bool>(nullable: false),
                    OnOff = table.Column<bool>(nullable: false),
                    Display = table.Column<bool>(nullable: false),
                    IsCustom = table.Column<bool>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false),
                    CustomToggleId = table.Column<int>(nullable: false),
                    CharacterStatId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CharacterStatToggle", x => x.CharacterStatToggleId);
                    table.ForeignKey(
                        name: "FK_CharacterStatToggle_CharacterStats_CharacterStatId",
                        column: x => x.CharacterStatId,
                        principalTable: "CharacterStats",
                        principalColumn: "CharacterStatId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CustomToggle",
                columns: table => new
                {
                    CustomToggleId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    ToggleText = table.Column<string>(nullable: true),
                    image = table.Column<string>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: false),
                    CharacterStatToggleId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomToggle", x => x.CustomToggleId);
                    table.ForeignKey(
                        name: "FK_CustomToggle_CharacterStatToggle_CharacterStatToggleId",
                        column: x => x.CharacterStatToggleId,
                        principalTable: "CharacterStatToggle",
                        principalColumn: "CharacterStatToggleId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CharacterStatToggle_CharacterStatId",
                table: "CharacterStatToggle",
                column: "CharacterStatId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CustomToggle_CharacterStatToggleId",
                table: "CustomToggle",
                column: "CharacterStatToggleId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CustomToggle");

            migrationBuilder.DropTable(
                name: "CharacterStatToggle");
        }
    }
}
