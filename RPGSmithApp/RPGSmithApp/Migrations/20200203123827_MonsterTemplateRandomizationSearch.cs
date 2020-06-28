using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class MonsterTemplateRandomizationSearch : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MonsterTemplateRandomizationSearch",
                columns: table => new
                {
                    RandomizationSearchId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    MonsterTemplateId = table.Column<int>(nullable: false),
                    Quantity = table.Column<string>(nullable: true),
                    String = table.Column<string>(nullable: true),
                    ItemRecord = table.Column<string>(nullable: true),
                    IsAnd = table.Column<bool>(nullable: false),
                    SortOrder = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MonsterTemplateRandomizationSearch", x => x.RandomizationSearchId);
                    table.ForeignKey(
                        name: "FK_MonsterTemplateRandomizationSearch_MonsterTemplates_MonsterTemplateId",
                        column: x => x.MonsterTemplateId,
                        principalTable: "MonsterTemplates",
                        principalColumn: "MonsterTemplateId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MonsterTemplateRandomizationSearchFields",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: false),
                    RandomizationSearchId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MonsterTemplateRandomizationSearchFields", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MonsterTemplateRandomizationSearchFields_MonsterTemplateRandomizationSearch_RandomizationSearchId",
                        column: x => x.RandomizationSearchId,
                        principalTable: "MonsterTemplateRandomizationSearch",
                        principalColumn: "RandomizationSearchId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MonsterTemplateRandomizationSearch_MonsterTemplateId",
                table: "MonsterTemplateRandomizationSearch",
                column: "MonsterTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_MonsterTemplateRandomizationSearchFields_RandomizationSearchId",
                table: "MonsterTemplateRandomizationSearchFields",
                column: "RandomizationSearchId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MonsterTemplateRandomizationSearchFields");

            migrationBuilder.DropTable(
                name: "MonsterTemplateRandomizationSearch");
        }
    }
}
