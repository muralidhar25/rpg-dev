using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class create_BuffAndEffect_Tables : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BuffAndEffects",
                columns: table => new
                {
                    BuffAndEffectId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    RuleSetId = table.Column<int>(nullable: false),
                    Name = table.Column<string>(type: "nvarchar(255)", nullable: false),
                    Command = table.Column<string>(nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Stats = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(2048)", maxLength: 2048, nullable: true),
                    Metatags = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ParentBuffAndEffectId = table.Column<int>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: true),
                    CommandName = table.Column<string>(type: "nvarchar(100)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BuffAndEffects", x => x.BuffAndEffectId);
                    table.ForeignKey(
                        name: "FK_BuffAndEffects_BuffAndEffects_ParentBuffAndEffectId",
                        column: x => x.ParentBuffAndEffectId,
                        principalTable: "BuffAndEffects",
                        principalColumn: "BuffAndEffectId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BuffAndEffects_RuleSets_RuleSetId",
                        column: x => x.RuleSetId,
                        principalTable: "RuleSets",
                        principalColumn: "RuleSetId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BuffAndEffectCommands",
                columns: table => new
                {
                    BuffAndEffectCommandId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Command = table.Column<string>(nullable: true),
                    Name = table.Column<string>(nullable: true),
                    BuffAndEffectId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BuffAndEffectCommands", x => x.BuffAndEffectCommandId);
                    table.ForeignKey(
                        name: "FK_BuffAndEffectCommands_BuffAndEffects_BuffAndEffectId",
                        column: x => x.BuffAndEffectId,
                        principalTable: "BuffAndEffects",
                        principalColumn: "BuffAndEffectId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BuffAndEffectCommands_BuffAndEffectId",
                table: "BuffAndEffectCommands",
                column: "BuffAndEffectId");

            migrationBuilder.CreateIndex(
                name: "IX_BuffAndEffects_ParentBuffAndEffectId",
                table: "BuffAndEffects",
                column: "ParentBuffAndEffectId");

            migrationBuilder.CreateIndex(
                name: "IX_BuffAndEffects_RuleSetId",
                table: "BuffAndEffects",
                column: "RuleSetId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BuffAndEffectCommands");

            migrationBuilder.DropTable(
                name: "BuffAndEffects");
        }
    }
}
