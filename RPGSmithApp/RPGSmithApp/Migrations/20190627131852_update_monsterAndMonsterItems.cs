using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class update_monsterAndMonsterItems : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Command",
                table: "Monsters",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CommandName",
                table: "Monsters",
                type: "nvarchar(100)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Monsters",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InitiativeCommand",
                table: "Monsters",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsRandomizationEngine",
                table: "Monsters",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "ParentMonsterId",
                table: "Monsters",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Stats",
                table: "Monsters",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Command",
                table: "ItemMasterMonsterItems",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CommandName",
                table: "ItemMasterMonsterItems",
                type: "nvarchar(100)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ContainedIn",
                table: "ItemMasterMonsterItems",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ContainerVolumeMax",
                table: "ItemMasterMonsterItems",
                type: "decimal(18, 8)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "ContainerWeightMax",
                table: "ItemMasterMonsterItems",
                type: "decimal(18, 3)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "ContainerWeightModifier",
                table: "ItemMasterMonsterItems",
                type: "varchar(50)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsConsumable",
                table: "ItemMasterMonsterItems",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsContainer",
                table: "ItemMasterMonsterItems",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsIdentified",
                table: "ItemMasterMonsterItems",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsMagical",
                table: "ItemMasterMonsterItems",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsVisible",
                table: "ItemMasterMonsterItems",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ItemCalculation",
                table: "ItemMasterMonsterItems",
                type: "nvarchar(255)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ItemImage",
                table: "ItemMasterMonsterItems",
                type: "nvarchar(2048)",
                maxLength: 2048,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ItemName",
                table: "ItemMasterMonsterItems",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ItemStats",
                table: "ItemMasterMonsterItems",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ItemVisibleDesc",
                table: "ItemMasterMonsterItems",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Metatags",
                table: "ItemMasterMonsterItems",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ParentItemMasterMonsterItemId",
                table: "ItemMasterMonsterItems",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PercentReduced",
                table: "ItemMasterMonsterItems",
                type: "decimal(18, 3)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Rarity",
                table: "ItemMasterMonsterItems",
                type: "nvarchar(20)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RuleSetId",
                table: "ItemMasterMonsterItems",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalWeight",
                table: "ItemMasterMonsterItems",
                type: "decimal(18, 3)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalWeightWithContents",
                table: "ItemMasterMonsterItems",
                type: "decimal(18, 3)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Value",
                table: "ItemMasterMonsterItems",
                type: "decimal(18, 8)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Volume",
                table: "ItemMasterMonsterItems",
                type: "decimal(18, 8)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Weight",
                table: "ItemMasterMonsterItems",
                type: "decimal(18, 3)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "ItemMasterMonsterItemAbilitys",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    ItemMasterMonsterItemId = table.Column<int>(nullable: false),
                    AbilityId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemMasterMonsterItemAbilitys", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ItemMasterMonsterItemAbilitys_Abilities_AbilityId",
                        column: x => x.AbilityId,
                        principalTable: "Abilities",
                        principalColumn: "AbilityId",
                        onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(
                        name: "FK_ItemMasterMonsterItemAbilitys_ItemMasterMonsterItems_ItemMasterMonsterItemId",
                        column: x => x.ItemMasterMonsterItemId,
                        principalTable: "ItemMasterMonsterItems",
                        principalColumn: "ItemId",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateTable(
                name: "ItemMasterMonsterItemBuffAndEffects",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    ItemMasterMonsterItemId = table.Column<int>(nullable: false),
                    BuffAndEffectId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemMasterMonsterItemBuffAndEffects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ItemMasterMonsterItemBuffAndEffects_BuffAndEffects_BuffAndEffectId",
                        column: x => x.BuffAndEffectId,
                        principalTable: "BuffAndEffects",
                        principalColumn: "BuffAndEffectId",
                        onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(
                        name: "FK_ItemMasterMonsterItemBuffAndEffects_ItemMasterMonsterItems_ItemMasterMonsterItemId",
                        column: x => x.ItemMasterMonsterItemId,
                        principalTable: "ItemMasterMonsterItems",
                        principalColumn: "ItemId",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateTable(
                name: "ItemMasterMonsterItemCommands",
                columns: table => new
                {
                    ItemMasterMonsterItemCommandId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Command = table.Column<string>(nullable: true),
                    Name = table.Column<string>(nullable: true),
                    ItemMasterMonsterItemId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemMasterMonsterItemCommands", x => x.ItemMasterMonsterItemCommandId);
                    table.ForeignKey(
                        name: "FK_ItemMasterMonsterItemCommands_ItemMasterMonsterItems_ItemMasterMonsterItemId",
                        column: x => x.ItemMasterMonsterItemId,
                        principalTable: "ItemMasterMonsterItems",
                        principalColumn: "ItemId",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateTable(
                name: "ItemMasterMonsterItemSpells",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    ItemMasterMonsterItemId = table.Column<int>(nullable: false),
                    SpellId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemMasterMonsterItemSpells", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ItemMasterMonsterItemSpells_ItemMasterMonsterItems_ItemMasterMonsterItemId",
                        column: x => x.ItemMasterMonsterItemId,
                        principalTable: "ItemMasterMonsterItems",
                        principalColumn: "ItemId",
                        onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(
                        name: "FK_ItemMasterMonsterItemSpells_Spells_SpellId",
                        column: x => x.SpellId,
                        principalTable: "Spells",
                        principalColumn: "SpellId",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateTable(
                name: "MonsterAbilitys",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    MonsterId = table.Column<int>(nullable: false),
                    AbilityId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MonsterAbilitys", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MonsterAbilitys_Abilities_AbilityId",
                        column: x => x.AbilityId,
                        principalTable: "Abilities",
                        principalColumn: "AbilityId",
                        onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(
                        name: "FK_MonsterAbilitys_Monsters_MonsterId",
                        column: x => x.MonsterId,
                        principalTable: "Monsters",
                        principalColumn: "MonsterId",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateTable(
                name: "MonsterBuffAndEffects",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    MonsterId = table.Column<int>(nullable: false),
                    BuffAndEffectId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MonsterBuffAndEffects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MonsterBuffAndEffects_BuffAndEffects_BuffAndEffectId",
                        column: x => x.BuffAndEffectId,
                        principalTable: "BuffAndEffects",
                        principalColumn: "BuffAndEffectId",
                        onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(
                        name: "FK_MonsterBuffAndEffects_Monsters_MonsterId",
                        column: x => x.MonsterId,
                        principalTable: "Monsters",
                        principalColumn: "MonsterId",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateTable(
                name: "MonsterCommands",
                columns: table => new
                {
                    MonsterCommandId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Command = table.Column<string>(nullable: true),
                    Name = table.Column<string>(nullable: true),
                    MonsterId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MonsterCommands", x => x.MonsterCommandId);
                    table.ForeignKey(
                        name: "FK_MonsterCommands_Monsters_MonsterId",
                        column: x => x.MonsterId,
                        principalTable: "Monsters",
                        principalColumn: "MonsterId",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateTable(
                name: "MonsterSpells",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    MonsterId = table.Column<int>(nullable: false),
                    SpellId = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MonsterSpells", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MonsterSpells_Monsters_MonsterId",
                        column: x => x.MonsterId,
                        principalTable: "Monsters",
                        principalColumn: "MonsterId",
                        onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(
                        name: "FK_MonsterSpells_Spells_SpellId",
                        column: x => x.SpellId,
                        principalTable: "Spells",
                        principalColumn: "SpellId",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Monsters_ParentMonsterId",
                table: "Monsters",
                column: "ParentMonsterId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemMasterMonsterItems_ParentItemMasterMonsterItemId",
                table: "ItemMasterMonsterItems",
                column: "ParentItemMasterMonsterItemId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemMasterMonsterItems_RuleSetId",
                table: "ItemMasterMonsterItems",
                column: "RuleSetId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemMasterMonsterItemAbilitys_AbilityId",
                table: "ItemMasterMonsterItemAbilitys",
                column: "AbilityId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemMasterMonsterItemAbilitys_ItemMasterMonsterItemId",
                table: "ItemMasterMonsterItemAbilitys",
                column: "ItemMasterMonsterItemId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemMasterMonsterItemBuffAndEffects_BuffAndEffectId",
                table: "ItemMasterMonsterItemBuffAndEffects",
                column: "BuffAndEffectId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemMasterMonsterItemBuffAndEffects_ItemMasterMonsterItemId",
                table: "ItemMasterMonsterItemBuffAndEffects",
                column: "ItemMasterMonsterItemId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemMasterMonsterItemCommands_ItemMasterMonsterItemId",
                table: "ItemMasterMonsterItemCommands",
                column: "ItemMasterMonsterItemId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemMasterMonsterItemSpells_ItemMasterMonsterItemId",
                table: "ItemMasterMonsterItemSpells",
                column: "ItemMasterMonsterItemId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemMasterMonsterItemSpells_SpellId",
                table: "ItemMasterMonsterItemSpells",
                column: "SpellId");

            migrationBuilder.CreateIndex(
                name: "IX_MonsterAbilitys_AbilityId",
                table: "MonsterAbilitys",
                column: "AbilityId");

            migrationBuilder.CreateIndex(
                name: "IX_MonsterAbilitys_MonsterId",
                table: "MonsterAbilitys",
                column: "MonsterId");

            migrationBuilder.CreateIndex(
                name: "IX_MonsterBuffAndEffects_BuffAndEffectId",
                table: "MonsterBuffAndEffects",
                column: "BuffAndEffectId");

            migrationBuilder.CreateIndex(
                name: "IX_MonsterBuffAndEffects_MonsterId",
                table: "MonsterBuffAndEffects",
                column: "MonsterId");

            migrationBuilder.CreateIndex(
                name: "IX_MonsterCommands_MonsterId",
                table: "MonsterCommands",
                column: "MonsterId");

            migrationBuilder.CreateIndex(
                name: "IX_MonsterSpells_MonsterId",
                table: "MonsterSpells",
                column: "MonsterId");

            migrationBuilder.CreateIndex(
                name: "IX_MonsterSpells_SpellId",
                table: "MonsterSpells",
                column: "SpellId");

            migrationBuilder.AddForeignKey(
                name: "FK_ItemMasterMonsterItems_ItemMasterMonsterItems_ParentItemMasterMonsterItemId",
                table: "ItemMasterMonsterItems",
                column: "ParentItemMasterMonsterItemId",
                principalTable: "ItemMasterMonsterItems",
                principalColumn: "ItemId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ItemMasterMonsterItems_RuleSets_RuleSetId",
                table: "ItemMasterMonsterItems",
                column: "RuleSetId",
                principalTable: "RuleSets",
                principalColumn: "RuleSetId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Monsters_Monsters_ParentMonsterId",
                table: "Monsters",
                column: "ParentMonsterId",
                principalTable: "Monsters",
                principalColumn: "MonsterId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ItemMasterMonsterItems_ItemMasterMonsterItems_ParentItemMasterMonsterItemId",
                table: "ItemMasterMonsterItems");

            migrationBuilder.DropForeignKey(
                name: "FK_ItemMasterMonsterItems_RuleSets_RuleSetId",
                table: "ItemMasterMonsterItems");

            migrationBuilder.DropForeignKey(
                name: "FK_Monsters_Monsters_ParentMonsterId",
                table: "Monsters");

            migrationBuilder.DropTable(
                name: "ItemMasterMonsterItemAbilitys");

            migrationBuilder.DropTable(
                name: "ItemMasterMonsterItemBuffAndEffects");

            migrationBuilder.DropTable(
                name: "ItemMasterMonsterItemCommands");

            migrationBuilder.DropTable(
                name: "ItemMasterMonsterItemSpells");

            migrationBuilder.DropTable(
                name: "MonsterAbilitys");

            migrationBuilder.DropTable(
                name: "MonsterBuffAndEffects");

            migrationBuilder.DropTable(
                name: "MonsterCommands");

            migrationBuilder.DropTable(
                name: "MonsterSpells");

            migrationBuilder.DropIndex(
                name: "IX_Monsters_ParentMonsterId",
                table: "Monsters");

            migrationBuilder.DropIndex(
                name: "IX_ItemMasterMonsterItems_ParentItemMasterMonsterItemId",
                table: "ItemMasterMonsterItems");

            migrationBuilder.DropIndex(
                name: "IX_ItemMasterMonsterItems_RuleSetId",
                table: "ItemMasterMonsterItems");

            migrationBuilder.DropColumn(
                name: "Command",
                table: "Monsters");

            migrationBuilder.DropColumn(
                name: "CommandName",
                table: "Monsters");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Monsters");

            migrationBuilder.DropColumn(
                name: "InitiativeCommand",
                table: "Monsters");

            migrationBuilder.DropColumn(
                name: "IsRandomizationEngine",
                table: "Monsters");

            migrationBuilder.DropColumn(
                name: "ParentMonsterId",
                table: "Monsters");

            migrationBuilder.DropColumn(
                name: "Stats",
                table: "Monsters");

            migrationBuilder.DropColumn(
                name: "Command",
                table: "ItemMasterMonsterItems");

            migrationBuilder.DropColumn(
                name: "CommandName",
                table: "ItemMasterMonsterItems");

            migrationBuilder.DropColumn(
                name: "ContainedIn",
                table: "ItemMasterMonsterItems");

            migrationBuilder.DropColumn(
                name: "ContainerVolumeMax",
                table: "ItemMasterMonsterItems");

            migrationBuilder.DropColumn(
                name: "ContainerWeightMax",
                table: "ItemMasterMonsterItems");

            migrationBuilder.DropColumn(
                name: "ContainerWeightModifier",
                table: "ItemMasterMonsterItems");

            migrationBuilder.DropColumn(
                name: "IsConsumable",
                table: "ItemMasterMonsterItems");

            migrationBuilder.DropColumn(
                name: "IsContainer",
                table: "ItemMasterMonsterItems");

            migrationBuilder.DropColumn(
                name: "IsIdentified",
                table: "ItemMasterMonsterItems");

            migrationBuilder.DropColumn(
                name: "IsMagical",
                table: "ItemMasterMonsterItems");

            migrationBuilder.DropColumn(
                name: "IsVisible",
                table: "ItemMasterMonsterItems");

            migrationBuilder.DropColumn(
                name: "ItemCalculation",
                table: "ItemMasterMonsterItems");

            migrationBuilder.DropColumn(
                name: "ItemImage",
                table: "ItemMasterMonsterItems");

            migrationBuilder.DropColumn(
                name: "ItemName",
                table: "ItemMasterMonsterItems");

            migrationBuilder.DropColumn(
                name: "ItemStats",
                table: "ItemMasterMonsterItems");

            migrationBuilder.DropColumn(
                name: "ItemVisibleDesc",
                table: "ItemMasterMonsterItems");

            migrationBuilder.DropColumn(
                name: "Metatags",
                table: "ItemMasterMonsterItems");

            migrationBuilder.DropColumn(
                name: "ParentItemMasterMonsterItemId",
                table: "ItemMasterMonsterItems");

            migrationBuilder.DropColumn(
                name: "PercentReduced",
                table: "ItemMasterMonsterItems");

            migrationBuilder.DropColumn(
                name: "Rarity",
                table: "ItemMasterMonsterItems");

            migrationBuilder.DropColumn(
                name: "RuleSetId",
                table: "ItemMasterMonsterItems");

            migrationBuilder.DropColumn(
                name: "TotalWeight",
                table: "ItemMasterMonsterItems");

            migrationBuilder.DropColumn(
                name: "TotalWeightWithContents",
                table: "ItemMasterMonsterItems");

            migrationBuilder.DropColumn(
                name: "Value",
                table: "ItemMasterMonsterItems");

            migrationBuilder.DropColumn(
                name: "Volume",
                table: "ItemMasterMonsterItems");

            migrationBuilder.DropColumn(
                name: "Weight",
                table: "ItemMasterMonsterItems");
        }
    }
}
