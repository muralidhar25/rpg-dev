using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class renamecustomtogglefield : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CommandName",
                table: "Spells",
                type: "nvarchar(100)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CommandName",
                table: "Items",
                type: "nvarchar(100)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CommandName",
                table: "ItemMasters",
                type: "nvarchar(100)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ComboText",
                table: "CharactersCharacterStats",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DefaultValue",
                table: "CharactersCharacterStats",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Minimum",
                table: "CharactersCharacterStats",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "CommandName",
                table: "Abilities",
                type: "nvarchar(100)",
                nullable: true);

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

            migrationBuilder.CreateTable(
                name: "CharacterStatToggle",
                columns: table => new
                {
                    CharacterStatToggleId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    YesNo = table.Column<bool>(nullable: false),
                    OnOff = table.Column<bool>(nullable: false),
                    Display = table.Column<bool>(nullable: false),
                    IsCustom = table.Column<bool>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false),
                    CustomToggleId = table.Column<int>(nullable: false),
                    CharacterStatId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CharacterStatToggle", x => x.CharacterStatToggleId);
                    table.ForeignKey(
                        name: "FK_CharacterStatToggle_CharacterStats_CharacterStatId",
                        column: x => x.CharacterStatId,
                        principalTable: "CharacterStats",
                        principalColumn: "CharacterStatId",
                        onDelete: ReferentialAction.Cascade);
                });

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
                name: "DefaultDices",
                columns: table => new
                {
                    DefaultDiceId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(type: "nvarchar(100)", nullable: true),
                    Icon = table.Column<string>(type: "nvarchar(50)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DefaultDices", x => x.DefaultDiceId);
                });

            migrationBuilder.CreateTable(
                name: "CustomToggle",
                columns: table => new
                {
                    CustomToggleId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    ToggleText = table.Column<string>(nullable: true),
                    Image = table.Column<string>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: false),
                    CharacterStatToggleId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomToggle", x => x.CustomToggleId);
                    table.ForeignKey(
                        name: "FK_CustomToggle_CharacterStatToggle_CharacterStatToggleId",
                        column: x => x.CharacterStatToggleId,
                        principalTable: "CharacterStatToggle",
                        principalColumn: "CharacterStatToggleId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CustomDiceResults",
                columns: table => new
                {
                    CustomDiceResultId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(type: "nvarchar(100)", nullable: true),
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
                    RuleSetId = table.Column<int>(nullable: false),
                    SortOrder = table.Column<int>(nullable: false)
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
                name: "IX_CharacterStatCombos_CharacterStatId",
                table: "CharacterStatCombos",
                column: "CharacterStatId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CharacterStatToggle_CharacterStatId",
                table: "CharacterStatToggle",
                column: "CharacterStatId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CustomDiceResults_CustomDiceId",
                table: "CustomDiceResults",
                column: "CustomDiceId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomDices_RuleSetId",
                table: "CustomDices",
                column: "RuleSetId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomToggle_CharacterStatToggleId",
                table: "CustomToggle",
                column: "CharacterStatToggleId");

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
                name: "CharacterStatCombos");

            migrationBuilder.DropTable(
                name: "CustomDiceResults");

            migrationBuilder.DropTable(
                name: "CustomToggle");

            migrationBuilder.DropTable(
                name: "DiceTrays");

            migrationBuilder.DropTable(
                name: "CharacterStatToggle");

            migrationBuilder.DropTable(
                name: "CustomDices");

            migrationBuilder.DropTable(
                name: "DefaultDices");

            migrationBuilder.DropColumn(
                name: "CommandName",
                table: "Spells");

            migrationBuilder.DropColumn(
                name: "CommandName",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "CommandName",
                table: "ItemMasters");

            migrationBuilder.DropColumn(
                name: "ComboText",
                table: "CharactersCharacterStats");

            migrationBuilder.DropColumn(
                name: "DefaultValue",
                table: "CharactersCharacterStats");

            migrationBuilder.DropColumn(
                name: "Minimum",
                table: "CharactersCharacterStats");

            migrationBuilder.DropColumn(
                name: "CommandName",
                table: "Abilities");
        }
    }
}
