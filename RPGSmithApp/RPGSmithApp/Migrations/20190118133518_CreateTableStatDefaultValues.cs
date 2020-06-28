using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class CreateTableStatDefaultValues : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CharacterStatDefaultValues",
                columns: table => new
                {
                    CharacterStatDefaultValueId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CharacterStatId = table.Column<int>(nullable: false),
                    DefaultValue = table.Column<string>(nullable: true),
                    Maximum = table.Column<int>(nullable: false),
                    Minimum = table.Column<int>(nullable: false),
                    Type = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CharacterStatDefaultValues", x => x.CharacterStatDefaultValueId);
                    table.ForeignKey(
                        name: "FK_CharacterStatDefaultValues_CharacterStats_CharacterStatId",
                        column: x => x.CharacterStatId,
                        principalTable: "CharacterStats",
                        principalColumn: "CharacterStatId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CharacterStatDefaultValues_CharacterStatId",
                table: "CharacterStatDefaultValues",
                column: "CharacterStatId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CharacterStatDefaultValues");
        }
    }
}
