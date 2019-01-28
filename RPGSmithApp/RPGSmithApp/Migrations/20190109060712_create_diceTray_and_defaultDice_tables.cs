using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class create_diceTray_and_defaultDice_tables : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DefaultDices",
                columns: table => new
                {
                    DefaultDiceId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(type: "nvarchar(100)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DefaultDices", x => x.DefaultDiceId);
                });

            migrationBuilder.CreateTable(
                name: "DiceTrays",
                columns: table => new
                {
                    DiceTrayId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(type: "nvarchar(100)", nullable: true),
                    CustomDiceId = table.Column<int>(nullable: true),
                    DefaultDiceId = table.Column<int>(nullable: true),
                    IsCustomDice = table.Column<bool>(nullable: false),
                    IsDefaultDice = table.Column<bool>(nullable: false),
                    RuleSetId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DiceTrays", x => x.DiceTrayId);
                    table.ForeignKey(
                        name: "FK_DiceTrays_CustomDices_CustomDiceId",
                        column: x => x.CustomDiceId,
                        principalTable: "CustomDices",
                        principalColumn: "CustomDiceId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DiceTrays_DefaultDices_DefaultDiceId",
                        column: x => x.DefaultDiceId,
                        principalTable: "DefaultDices",
                        principalColumn: "DefaultDiceId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DiceTrays_RuleSets_RuleSetId",
                        column: x => x.RuleSetId,
                        principalTable: "RuleSets",
                        principalColumn: "RuleSetId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DiceTrays_CustomDiceId",
                table: "DiceTrays",
                column: "CustomDiceId");

            migrationBuilder.CreateIndex(
                name: "IX_DiceTrays_DefaultDiceId",
                table: "DiceTrays",
                column: "DefaultDiceId");

            migrationBuilder.CreateIndex(
                name: "IX_DiceTrays_RuleSetId",
                table: "DiceTrays",
                column: "RuleSetId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DiceTrays");

            migrationBuilder.DropTable(
                name: "DefaultDices");
        }
    }
}
