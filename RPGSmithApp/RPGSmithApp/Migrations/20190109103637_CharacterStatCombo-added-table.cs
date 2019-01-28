using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class CharacterStatComboaddedtable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
           
            migrationBuilder.CreateTable(
                name: "CharacterStatCombos",
                columns: table => new
                {
                    CharacterStatComboId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Maximum = table.Column<int>(nullable: true),
                    Minimum = table.Column<int>(nullable: true),
                    DefaultValue = table.Column<int>(nullable: false),
                    CharacterStatId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CharacterStatCombos", x => x.CharacterStatComboId);
                    table.ForeignKey(
                        name: "FK_CharacterStatCombos_CharacterStats_CharacterStatId",
                        column: x => x.CharacterStatId,
                        principalTable: "CharacterStats",
                        principalColumn: "CharacterStatId",
                        onDelete: ReferentialAction.Cascade);
                });

           
            migrationBuilder.CreateIndex(
                name: "IX_CharacterStatCombos_CharacterStatId",
                table: "CharacterStatCombos",
                column: "CharacterStatId");

          
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CharacterStatCombos");

        }
    }
}
