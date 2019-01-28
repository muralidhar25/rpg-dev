using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class create_CustomDice_Tables : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CustomDices",
                columns: table => new
                {
                    CustomDiceId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(type: "nvarchar(100)", nullable: false),
                    Icon = table.Column<string>(type: "nvarchar(50)", nullable: false),
                    IsNumeric = table.Column<bool>(nullable: false),
                    RuleSetId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomDices", x => x.CustomDiceId);
                    table.ForeignKey(
                        name: "FK_CustomDices_RuleSets_RuleSetId",
                        column: x => x.RuleSetId,
                        principalTable: "RuleSets",
                        principalColumn: "RuleSetId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CustomDiceResults",
                columns: table => new
                {
                    CustomDiceResultId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(type: "nvarchar(100)", nullable: false),
                    CustomDiceId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomDiceResults", x => x.CustomDiceResultId);
                    table.ForeignKey(
                        name: "FK_CustomDiceResults_CustomDices_CustomDiceId",
                        column: x => x.CustomDiceId,
                        principalTable: "CustomDices",
                        principalColumn: "CustomDiceId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CustomDiceResults_CustomDiceId",
                table: "CustomDiceResults",
                column: "CustomDiceId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomDices_RuleSetId",
                table: "CustomDices",
                column: "RuleSetId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CustomDiceResults");

            migrationBuilder.DropTable(
                name: "CustomDices");
        }
    }
}
