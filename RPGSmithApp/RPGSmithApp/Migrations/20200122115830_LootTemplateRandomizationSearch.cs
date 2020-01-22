using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class LootTemplateRandomizationSearch : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LootTemplateRandomizationSearch",
                columns: table => new
                {
                    RandomizationSearchId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    LootTemplateId = table.Column<int>(nullable: false),
                    Quantity = table.Column<string>(nullable: true),
                    String = table.Column<string>(nullable: true),
                    ItemRecord = table.Column<string>(nullable: true),
                    IsAnd = table.Column<bool>(nullable: false),
                    SortOrder = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LootTemplateRandomizationSearch", x => x.RandomizationSearchId);
                    table.ForeignKey(
                        name: "FK_LootTemplateRandomizationSearch_LootTemplates_LootTemplateId",
                        column: x => x.LootTemplateId,
                        principalTable: "LootTemplates",
                        principalColumn: "LootTemplateId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RandomizationSearchFields",
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
                    table.PrimaryKey("PK_RandomizationSearchFields", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RandomizationSearchFields_LootTemplateRandomizationSearch_RandomizationSearchId",
                        column: x => x.RandomizationSearchId,
                        principalTable: "LootTemplateRandomizationSearch",
                        principalColumn: "RandomizationSearchId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LootTemplateRandomizationSearch_LootTemplateId",
                table: "LootTemplateRandomizationSearch",
                column: "LootTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_RandomizationSearchFields_RandomizationSearchId",
                table: "RandomizationSearchFields",
                column: "RandomizationSearchId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RandomizationSearchFields");

            migrationBuilder.DropTable(
                name: "LootTemplateRandomizationSearch");
        }
    }
}
