using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class reset_ConditionsTables_create : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ConditionOperators",
                columns: table => new
                {
                    ConditionOperatorId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(nullable: false),
                    Symbol = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConditionOperators", x => x.ConditionOperatorId);
                });

            migrationBuilder.CreateTable(
                name: "CharacterStatConditions",
                columns: table => new
                {
                    CharacterStatConditionId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    IfClauseStatId = table.Column<int>(nullable: true),
                    ConditionOperatorID = table.Column<int>(nullable: false),
                    CompareValue = table.Column<string>(nullable: true),
                    Result = table.Column<string>(nullable: true),
                    SortOrder = table.Column<int>(nullable: false),
                    CharacterStatId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CharacterStatConditions", x => x.CharacterStatConditionId);
                    table.ForeignKey(
                        name: "FK_CharacterStatConditions_CharacterStats_CharacterStatId",
                        column: x => x.CharacterStatId,
                        principalTable: "CharacterStats",
                        principalColumn: "CharacterStatId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CharacterStatConditions_ConditionOperators_ConditionOperatorID",
                        column: x => x.ConditionOperatorID,
                        principalTable: "ConditionOperators",
                        principalColumn: "ConditionOperatorId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CharacterStatConditions_CharacterStats_IfClauseStatId",
                        column: x => x.IfClauseStatId,
                        principalTable: "CharacterStats",
                        principalColumn: "CharacterStatId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CharacterStatConditions_CharacterStatId",
                table: "CharacterStatConditions",
                column: "CharacterStatId");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterStatConditions_ConditionOperatorID",
                table: "CharacterStatConditions",
                column: "ConditionOperatorID");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterStatConditions_IfClauseStatId",
                table: "CharacterStatConditions",
                column: "IfClauseStatId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CharacterStatConditions");

            migrationBuilder.DropTable(
                name: "ConditionOperators");
        }
    }
}
