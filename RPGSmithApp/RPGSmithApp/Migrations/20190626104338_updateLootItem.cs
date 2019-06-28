using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class updateLootItem : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Command",
                table: "ItemMasterLoots",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CommandName",
                table: "ItemMasterLoots",
                type: "nvarchar(100)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ContainerVolumeMax",
                table: "ItemMasterLoots",
                type: "decimal(18, 8)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "ContainerWeightMax",
                table: "ItemMasterLoots",
                type: "decimal(18, 3)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "ContainerWeightModifier",
                table: "ItemMasterLoots",
                type: "varchar(50)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsConsumable",
                table: "ItemMasterLoots",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsContainer",
                table: "ItemMasterLoots",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "ItemMasterLoots",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsMagical",
                table: "ItemMasterLoots",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ItemCalculation",
                table: "ItemMasterLoots",
                type: "nvarchar(255)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ItemImage",
                table: "ItemMasterLoots",
                type: "nvarchar(2048)",
                maxLength: 2048,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ItemName",
                table: "ItemMasterLoots",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ItemStats",
                table: "ItemMasterLoots",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ItemVisibleDesc",
                table: "ItemMasterLoots",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Metatags",
                table: "ItemMasterLoots",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ParentLootId",
                table: "ItemMasterLoots",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PercentReduced",
                table: "ItemMasterLoots",
                type: "decimal(18, 3)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Rarity",
                table: "ItemMasterLoots",
                type: "nvarchar(20)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RuleSetId",
                table: "ItemMasterLoots",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalWeightWithContents",
                table: "ItemMasterLoots",
                type: "decimal(18, 3)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Value",
                table: "ItemMasterLoots",
                type: "decimal(18, 8)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Volume",
                table: "ItemMasterLoots",
                type: "decimal(18, 8)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Weight",
                table: "ItemMasterLoots",
                type: "decimal(18, 3)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "ItemMasterLootAbilitys",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    ItemMasterLootId = table.Column<int>(nullable: false),
                    AbilityId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemMasterLootAbilitys", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ItemMasterLootAbilitys_Abilities_AbilityId",
                        column: x => x.AbilityId,
                        principalTable: "Abilities",
                        principalColumn: "AbilityId",
                        onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(
                        name: "FK_ItemMasterLootAbilitys_ItemMasterLoots_ItemMasterLootId",
                        column: x => x.ItemMasterLootId,
                        principalTable: "ItemMasterLoots",
                        principalColumn: "LootId",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateTable(
                name: "ItemMasterLootBuffAndEffects",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    ItemMasterLootId = table.Column<int>(nullable: false),
                    BuffAndEffectId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemMasterLootBuffAndEffects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ItemMasterLootBuffAndEffects_BuffAndEffects_BuffAndEffectId",
                        column: x => x.BuffAndEffectId,
                        principalTable: "BuffAndEffects",
                        principalColumn: "BuffAndEffectId",
                        onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(
                        name: "FK_ItemMasterLootBuffAndEffects_ItemMasterLoots_ItemMasterLootId",
                        column: x => x.ItemMasterLootId,
                        principalTable: "ItemMasterLoots",
                        principalColumn: "LootId",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateTable(
                name: "ItemMasterLootCommands",
                columns: table => new
                {
                    ItemMasterLootCommandId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Command = table.Column<string>(nullable: true),
                    Name = table.Column<string>(nullable: true),
                    ItemMasterLootId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemMasterLootCommands", x => x.ItemMasterLootCommandId);
                    table.ForeignKey(
                        name: "FK_ItemMasterLootCommands_ItemMasterLoots_ItemMasterLootId",
                        column: x => x.ItemMasterLootId,
                        principalTable: "ItemMasterLoots",
                        principalColumn: "LootId",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateTable(
                name: "ItemMasterLootSpells",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    ItemMasterLootId = table.Column<int>(nullable: false),
                    SpellId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemMasterLootSpells", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ItemMasterLootSpells_ItemMasterLoots_ItemMasterLootId",
                        column: x => x.ItemMasterLootId,
                        principalTable: "ItemMasterLoots",
                        principalColumn: "LootId",
                        onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(
                        name: "FK_ItemMasterLootSpells_Spells_SpellId",
                        column: x => x.SpellId,
                        principalTable: "Spells",
                        principalColumn: "SpellId",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ItemMasterLoots_ParentLootId",
                table: "ItemMasterLoots",
                column: "ParentLootId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemMasterLoots_RuleSetId",
                table: "ItemMasterLoots",
                column: "RuleSetId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemMasterLootAbilitys_AbilityId",
                table: "ItemMasterLootAbilitys",
                column: "AbilityId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemMasterLootAbilitys_ItemMasterLootId",
                table: "ItemMasterLootAbilitys",
                column: "ItemMasterLootId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemMasterLootBuffAndEffects_BuffAndEffectId",
                table: "ItemMasterLootBuffAndEffects",
                column: "BuffAndEffectId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemMasterLootBuffAndEffects_ItemMasterLootId",
                table: "ItemMasterLootBuffAndEffects",
                column: "ItemMasterLootId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemMasterLootCommands_ItemMasterLootId",
                table: "ItemMasterLootCommands",
                column: "ItemMasterLootId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemMasterLootSpells_ItemMasterLootId",
                table: "ItemMasterLootSpells",
                column: "ItemMasterLootId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemMasterLootSpells_SpellId",
                table: "ItemMasterLootSpells",
                column: "SpellId");

            migrationBuilder.AddForeignKey(
                name: "FK_ItemMasterLoots_ItemMasterLoots_ParentLootId",
                table: "ItemMasterLoots",
                column: "ParentLootId",
                principalTable: "ItemMasterLoots",
                principalColumn: "LootId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ItemMasterLoots_RuleSets_RuleSetId",
                table: "ItemMasterLoots",
                column: "RuleSetId",
                principalTable: "RuleSets",
                principalColumn: "RuleSetId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ItemMasterLoots_ItemMasterLoots_ParentLootId",
                table: "ItemMasterLoots");

            migrationBuilder.DropForeignKey(
                name: "FK_ItemMasterLoots_RuleSets_RuleSetId",
                table: "ItemMasterLoots");

            migrationBuilder.DropTable(
                name: "ItemMasterLootAbilitys");

            migrationBuilder.DropTable(
                name: "ItemMasterLootBuffAndEffects");

            migrationBuilder.DropTable(
                name: "ItemMasterLootCommands");

            migrationBuilder.DropTable(
                name: "ItemMasterLootSpells");

            migrationBuilder.DropIndex(
                name: "IX_ItemMasterLoots_ParentLootId",
                table: "ItemMasterLoots");

            migrationBuilder.DropIndex(
                name: "IX_ItemMasterLoots_RuleSetId",
                table: "ItemMasterLoots");

            migrationBuilder.DropColumn(
                name: "Command",
                table: "ItemMasterLoots");

            migrationBuilder.DropColumn(
                name: "CommandName",
                table: "ItemMasterLoots");

            migrationBuilder.DropColumn(
                name: "ContainerVolumeMax",
                table: "ItemMasterLoots");

            migrationBuilder.DropColumn(
                name: "ContainerWeightMax",
                table: "ItemMasterLoots");

            migrationBuilder.DropColumn(
                name: "ContainerWeightModifier",
                table: "ItemMasterLoots");

            migrationBuilder.DropColumn(
                name: "IsConsumable",
                table: "ItemMasterLoots");

            migrationBuilder.DropColumn(
                name: "IsContainer",
                table: "ItemMasterLoots");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "ItemMasterLoots");

            migrationBuilder.DropColumn(
                name: "IsMagical",
                table: "ItemMasterLoots");

            migrationBuilder.DropColumn(
                name: "ItemCalculation",
                table: "ItemMasterLoots");

            migrationBuilder.DropColumn(
                name: "ItemImage",
                table: "ItemMasterLoots");

            migrationBuilder.DropColumn(
                name: "ItemName",
                table: "ItemMasterLoots");

            migrationBuilder.DropColumn(
                name: "ItemStats",
                table: "ItemMasterLoots");

            migrationBuilder.DropColumn(
                name: "ItemVisibleDesc",
                table: "ItemMasterLoots");

            migrationBuilder.DropColumn(
                name: "Metatags",
                table: "ItemMasterLoots");

            migrationBuilder.DropColumn(
                name: "ParentLootId",
                table: "ItemMasterLoots");

            migrationBuilder.DropColumn(
                name: "PercentReduced",
                table: "ItemMasterLoots");

            migrationBuilder.DropColumn(
                name: "Rarity",
                table: "ItemMasterLoots");

            migrationBuilder.DropColumn(
                name: "RuleSetId",
                table: "ItemMasterLoots");

            migrationBuilder.DropColumn(
                name: "TotalWeightWithContents",
                table: "ItemMasterLoots");

            migrationBuilder.DropColumn(
                name: "Value",
                table: "ItemMasterLoots");

            migrationBuilder.DropColumn(
                name: "Volume",
                table: "ItemMasterLoots");

            migrationBuilder.DropColumn(
                name: "Weight",
                table: "ItemMasterLoots");
        }
    }
}
