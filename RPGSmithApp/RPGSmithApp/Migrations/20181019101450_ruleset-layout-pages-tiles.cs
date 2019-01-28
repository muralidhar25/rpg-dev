using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RPGSmithApp.Migrations
{
    public partial class rulesetlayoutpagestiles : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CharacterStatTiles");

            migrationBuilder.DropTable(
                name: "CommandTiles");

            migrationBuilder.DropTable(
                name: "CounterTiles");

            migrationBuilder.DropTable(
                name: "ExecuteTiles");

            migrationBuilder.DropTable(
                name: "ImageTiles");

            migrationBuilder.DropTable(
                name: "LinkTiles");

            migrationBuilder.DropTable(
                name: "NoteTiles");

            migrationBuilder.DropTable(
                name: "Tiles");

            migrationBuilder.CreateTable(
                name: "RulesetDashboardLayouts",
                columns: table => new
                {
                    RulesetDashboardLayoutId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    RulesetId = table.Column<int>(nullable: false),
                    Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    IsDefaultLayout = table.Column<bool>(nullable: false),
                    DefaultPageId = table.Column<int>(nullable: true),
                    LayoutHeight = table.Column<int>(nullable: false),
                    LayoutWidth = table.Column<int>(nullable: false),
                    SortOrder = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RulesetDashboardLayouts", x => x.RulesetDashboardLayoutId);
                });

            migrationBuilder.CreateTable(
                name: "RulesetTileColors",
                columns: table => new
                {
                    TileColorId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    RulesetTileId = table.Column<int>(nullable: false),
                    CreatedBy = table.Column<string>(nullable: true),
                    CreatedDate = table.Column<DateTime>(nullable: false),
                    TitleTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TitleBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BodyTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BodyBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    IsDeleted = table.Column<bool>(nullable: false),
                    UserId = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RulesetTileColors", x => x.TileColorId);
                    table.ForeignKey(
                        name: "FK_RulesetTileColors_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RulesetDashboardPages",
                columns: table => new
                {
                    RulesetDashboardPageId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    RulesetDashboardLayoutId = table.Column<int>(nullable: false),
                    RulesetId = table.Column<int>(nullable: false),
                    Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    SortOrder = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false),
                    ContainerHeight = table.Column<int>(nullable: false),
                    ContainerWidth = table.Column<int>(nullable: false),
                    TitleTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TitleBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BodyTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BodyBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RulesetDashboardPages", x => x.RulesetDashboardPageId);
                    table.ForeignKey(
                        name: "FK_RulesetDashboardPages_RulesetDashboardLayouts_RulesetDashboardLayoutId",
                        column: x => x.RulesetDashboardLayoutId,
                        principalTable: "RulesetDashboardLayouts",
                        principalColumn: "RulesetDashboardLayoutId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RulesetDashboardPages_RuleSets_RulesetId",
                        column: x => x.RulesetId,
                        principalTable: "RuleSets",
                        principalColumn: "RuleSetId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RulesetTiles",
                columns: table => new
                {
                    RulesetTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    TileTypeId = table.Column<int>(nullable: false),
                    RulesetDashboardPageId = table.Column<int>(nullable: false),
                    RulesetId = table.Column<int>(nullable: false),
                    Shape = table.Column<int>(nullable: false),
                    LocationX = table.Column<int>(nullable: false),
                    LocationY = table.Column<int>(nullable: false),
                    Height = table.Column<int>(nullable: false),
                    Width = table.Column<int>(nullable: false),
                    SortOrder = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RulesetTiles", x => x.RulesetTileId);
                    table.ForeignKey(
                        name: "FK_RulesetTiles_RulesetDashboardPages_RulesetDashboardPageId",
                        column: x => x.RulesetDashboardPageId,
                        principalTable: "RulesetDashboardPages",
                        principalColumn: "RulesetDashboardPageId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RulesetTiles_RuleSets_RulesetId",
                        column: x => x.RulesetId,
                        principalTable: "RuleSets",
                        principalColumn: "RuleSetId",
                        onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(
                        name: "FK_RulesetTiles_TileTypes_TileTypeId",
                        column: x => x.TileTypeId,
                        principalTable: "TileTypes",
                        principalColumn: "TileTypeId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RulesetCharacterStatTiles",
                columns: table => new
                {
                    CharacterStatTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    RulesetTileId = table.Column<int>(nullable: true),
                    CharacterStatId = table.Column<int>(nullable: true),
                    ShowTitle = table.Column<bool>(nullable: false),
                    titleTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    titleBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    bodyTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    bodyBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Shape = table.Column<int>(nullable: false),
                    SortOrder = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RulesetCharacterStatTiles", x => x.CharacterStatTileId);
                    table.ForeignKey(
                        name: "FK_RulesetCharacterStatTiles_CharacterStats_CharacterStatId",
                        column: x => x.CharacterStatId,
                        principalTable: "CharacterStats",
                        principalColumn: "CharacterStatId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RulesetCharacterStatTiles_RulesetTiles_RulesetTileId",
                        column: x => x.RulesetTileId,
                        principalTable: "RulesetTiles",
                        principalColumn: "RulesetTileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RulesetCommandTiles",
                columns: table => new
                {
                    CommandTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    RulesetTileId = table.Column<int>(nullable: true),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Command = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TitleTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TitleBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BodyTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BodyBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Shape = table.Column<int>(nullable: false),
                    SortOrder = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RulesetCommandTiles", x => x.CommandTileId);
                    table.ForeignKey(
                        name: "FK_RulesetCommandTiles_RulesetTiles_RulesetTileId",
                        column: x => x.RulesetTileId,
                        principalTable: "RulesetTiles",
                        principalColumn: "RulesetTileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RulesetCounterTiles",
                columns: table => new
                {
                    CounterTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    RulesetTileId = table.Column<int>(nullable: true),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    DefaultValue = table.Column<int>(nullable: false),
                    CurrentValue = table.Column<int>(nullable: false),
                    Maximum = table.Column<int>(nullable: true),
                    Minimum = table.Column<int>(nullable: true),
                    Step = table.Column<int>(nullable: false),
                    TitleTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TitleBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BodyTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BodyBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Shape = table.Column<int>(nullable: false),
                    SortOrder = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RulesetCounterTiles", x => x.CounterTileId);
                    table.ForeignKey(
                        name: "FK_RulesetCounterTiles_RulesetTiles_RulesetTileId",
                        column: x => x.RulesetTileId,
                        principalTable: "RulesetTiles",
                        principalColumn: "RulesetTileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RulesetImageTiles",
                columns: table => new
                {
                    ImageTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    RulesetTileId = table.Column<int>(nullable: true),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TitleTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TitleBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BodyTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BodyBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Shape = table.Column<int>(nullable: false),
                    SortOrder = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RulesetImageTiles", x => x.ImageTileId);
                    table.ForeignKey(
                        name: "FK_RulesetImageTiles_RulesetTiles_RulesetTileId",
                        column: x => x.RulesetTileId,
                        principalTable: "RulesetTiles",
                        principalColumn: "RulesetTileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RulesetNoteTiles",
                columns: table => new
                {
                    NoteTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    RulesetTileId = table.Column<int>(nullable: true),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TitleTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TitleBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BodyTextColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BodyBgColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Shape = table.Column<int>(nullable: false),
                    SortOrder = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RulesetNoteTiles", x => x.NoteTileId);
                    table.ForeignKey(
                        name: "FK_RulesetNoteTiles_RulesetTiles_RulesetTileId",
                        column: x => x.RulesetTileId,
                        principalTable: "RulesetTiles",
                        principalColumn: "RulesetTileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RulesetTileConfig",
                columns: table => new
                {
                    TileConfigId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    RulesetTileId = table.Column<int>(nullable: false),
                    SortOrder = table.Column<int>(nullable: false),
                    UniqueId = table.Column<string>(nullable: true),
                    Payload = table.Column<int>(nullable: false),
                    Col = table.Column<int>(nullable: false),
                    Row = table.Column<int>(nullable: false),
                    SizeX = table.Column<int>(nullable: false),
                    SizeY = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RulesetTileConfig", x => x.TileConfigId);
                    table.ForeignKey(
                        name: "FK_RulesetTileConfig_RulesetTiles_RulesetTileId",
                        column: x => x.RulesetTileId,
                        principalTable: "RulesetTiles",
                        principalColumn: "RulesetTileId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RulesetCharacterStatTiles_CharacterStatId",
                table: "RulesetCharacterStatTiles",
                column: "CharacterStatId");

            migrationBuilder.CreateIndex(
                name: "IX_RulesetCharacterStatTiles_RulesetTileId",
                table: "RulesetCharacterStatTiles",
                column: "RulesetTileId",
                unique: true,
                filter: "[RulesetTileId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_RulesetCommandTiles_RulesetTileId",
                table: "RulesetCommandTiles",
                column: "RulesetTileId",
                unique: true,
                filter: "[RulesetTileId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_RulesetCounterTiles_RulesetTileId",
                table: "RulesetCounterTiles",
                column: "RulesetTileId",
                unique: true,
                filter: "[RulesetTileId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_RulesetDashboardPages_RulesetDashboardLayoutId",
                table: "RulesetDashboardPages",
                column: "RulesetDashboardLayoutId");

            migrationBuilder.CreateIndex(
                name: "IX_RulesetDashboardPages_RulesetId",
                table: "RulesetDashboardPages",
                column: "RulesetId");

            migrationBuilder.CreateIndex(
                name: "IX_RulesetImageTiles_RulesetTileId",
                table: "RulesetImageTiles",
                column: "RulesetTileId",
                unique: true,
                filter: "[RulesetTileId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_RulesetNoteTiles_RulesetTileId",
                table: "RulesetNoteTiles",
                column: "RulesetTileId",
                unique: true,
                filter: "[RulesetTileId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_RulesetTileColors_UserId",
                table: "RulesetTileColors",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_RulesetTileConfig_RulesetTileId",
                table: "RulesetTileConfig",
                column: "RulesetTileId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RulesetTiles_RulesetDashboardPageId",
                table: "RulesetTiles",
                column: "RulesetDashboardPageId");

            migrationBuilder.CreateIndex(
                name: "IX_RulesetTiles_RulesetId",
                table: "RulesetTiles",
                column: "RulesetId");

            migrationBuilder.CreateIndex(
                name: "IX_RulesetTiles_TileTypeId",
                table: "RulesetTiles",
                column: "TileTypeId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RulesetCharacterStatTiles");

            migrationBuilder.DropTable(
                name: "RulesetCommandTiles");

            migrationBuilder.DropTable(
                name: "RulesetCounterTiles");

            migrationBuilder.DropTable(
                name: "RulesetImageTiles");

            migrationBuilder.DropTable(
                name: "RulesetNoteTiles");

            migrationBuilder.DropTable(
                name: "RulesetTileColors");

            migrationBuilder.DropTable(
                name: "RulesetTileConfig");

            migrationBuilder.DropTable(
                name: "RulesetTiles");

            migrationBuilder.DropTable(
                name: "RulesetDashboardPages");

            migrationBuilder.DropTable(
                name: "RulesetDashboardLayouts");

            migrationBuilder.CreateTable(
                name: "Tiles",
                columns: table => new
                {
                    TileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CharacterDashboardPageId = table.Column<int>(nullable: true),
                    CharacterId = table.Column<int>(nullable: true),
                    Color = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Height = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false),
                    LocationX = table.Column<int>(nullable: false),
                    LocationY = table.Column<int>(nullable: false),
                    Shape = table.Column<int>(maxLength: 50, nullable: false),
                    TileTypeId = table.Column<int>(nullable: false),
                    Width = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tiles", x => x.TileId);
                    table.ForeignKey(
                        name: "FK_Tiles_CharacterDashboardPages_CharacterDashboardPageId",
                        column: x => x.CharacterDashboardPageId,
                        principalTable: "CharacterDashboardPages",
                        principalColumn: "CharacterDashboardPageId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Tiles_Characters_CharacterId",
                        column: x => x.CharacterId,
                        principalTable: "Characters",
                        principalColumn: "CharacterId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Tiles_TileTypes_TileTypeId",
                        column: x => x.TileTypeId,
                        principalTable: "TileTypes",
                        principalColumn: "TileTypeId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CharacterStatTiles",
                columns: table => new
                {
                    CharacterStatTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CharactersCharacterStatId = table.Column<int>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: false),
                    ShowTitle = table.Column<bool>(nullable: false),
                    TileId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CharacterStatTiles", x => x.CharacterStatTileId);
                    table.ForeignKey(
                        name: "FK_CharacterStatTiles_CharactersCharacterStats_CharactersCharacterStatId",
                        column: x => x.CharactersCharacterStatId,
                        principalTable: "CharactersCharacterStats",
                        principalColumn: "CharactersCharacterStatId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CharacterStatTiles_Tiles_TileId",
                        column: x => x.TileId,
                        principalTable: "Tiles",
                        principalColumn: "TileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CommandTiles",
                columns: table => new
                {
                    CommandTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Command = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(nullable: false),
                    TileId = table.Column<int>(nullable: true),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CommandTiles", x => x.CommandTileId);
                    table.ForeignKey(
                        name: "FK_CommandTiles_Tiles_TileId",
                        column: x => x.TileId,
                        principalTable: "Tiles",
                        principalColumn: "TileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CounterTiles",
                columns: table => new
                {
                    CounterTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    DefaultValue = table.Column<int>(nullable: false),
                    IsDeleted = table.Column<bool>(nullable: false),
                    Maximum = table.Column<int>(nullable: false),
                    Minimum = table.Column<int>(nullable: false),
                    Step = table.Column<int>(nullable: false),
                    TileId = table.Column<int>(nullable: true),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CounterTiles", x => x.CounterTileId);
                    table.ForeignKey(
                        name: "FK_CounterTiles_Tiles_TileId",
                        column: x => x.TileId,
                        principalTable: "Tiles",
                        principalColumn: "TileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ExecuteTiles",
                columns: table => new
                {
                    ExecuteTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    AbilityId = table.Column<int>(nullable: true),
                    CommandId = table.Column<int>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: false),
                    ItemId = table.Column<int>(nullable: true),
                    LinkType = table.Column<string>(type: "nvarchar(255)", maxLength: 50, nullable: true),
                    ShowTitle = table.Column<bool>(nullable: false),
                    SpellId = table.Column<int>(nullable: true),
                    TileId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExecuteTiles", x => x.ExecuteTileId);
                    table.ForeignKey(
                        name: "FK_ExecuteTiles_Abilities_AbilityId",
                        column: x => x.AbilityId,
                        principalTable: "Abilities",
                        principalColumn: "AbilityId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ExecuteTiles_Items_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Items",
                        principalColumn: "ItemId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ExecuteTiles_Spells_SpellId",
                        column: x => x.SpellId,
                        principalTable: "Spells",
                        principalColumn: "SpellId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ExecuteTiles_Tiles_TileId",
                        column: x => x.TileId,
                        principalTable: "Tiles",
                        principalColumn: "TileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ImageTiles",
                columns: table => new
                {
                    ImageTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(nullable: false),
                    TileId = table.Column<int>(nullable: true),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ImageTiles", x => x.ImageTileId);
                    table.ForeignKey(
                        name: "FK_ImageTiles_Tiles_TileId",
                        column: x => x.TileId,
                        principalTable: "Tiles",
                        principalColumn: "TileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LinkTiles",
                columns: table => new
                {
                    LinkTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    AbilityId = table.Column<int>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: false),
                    ItemId = table.Column<int>(nullable: true),
                    LinkType = table.Column<string>(type: "nvarchar(255)", maxLength: 50, nullable: true),
                    ShowTitle = table.Column<bool>(nullable: false),
                    SpellId = table.Column<int>(nullable: true),
                    TileId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LinkTiles", x => x.LinkTileId);
                    table.ForeignKey(
                        name: "FK_LinkTiles_Abilities_AbilityId",
                        column: x => x.AbilityId,
                        principalTable: "Abilities",
                        principalColumn: "AbilityId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LinkTiles_Items_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Items",
                        principalColumn: "ItemId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LinkTiles_Spells_SpellId",
                        column: x => x.SpellId,
                        principalTable: "Spells",
                        principalColumn: "SpellId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LinkTiles_Tiles_TileId",
                        column: x => x.TileId,
                        principalTable: "Tiles",
                        principalColumn: "TileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "NoteTiles",
                columns: table => new
                {
                    NoteTileId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(nullable: false),
                    TileId = table.Column<int>(nullable: true),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NoteTiles", x => x.NoteTileId);
                    table.ForeignKey(
                        name: "FK_NoteTiles_Tiles_TileId",
                        column: x => x.TileId,
                        principalTable: "Tiles",
                        principalColumn: "TileId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CharacterStatTiles_CharactersCharacterStatId",
                table: "CharacterStatTiles",
                column: "CharactersCharacterStatId");

            migrationBuilder.CreateIndex(
                name: "IX_CharacterStatTiles_TileId",
                table: "CharacterStatTiles",
                column: "TileId");

            migrationBuilder.CreateIndex(
                name: "IX_CommandTiles_TileId",
                table: "CommandTiles",
                column: "TileId");

            migrationBuilder.CreateIndex(
                name: "IX_CounterTiles_TileId",
                table: "CounterTiles",
                column: "TileId");

            migrationBuilder.CreateIndex(
                name: "IX_ExecuteTiles_AbilityId",
                table: "ExecuteTiles",
                column: "AbilityId");

            migrationBuilder.CreateIndex(
                name: "IX_ExecuteTiles_ItemId",
                table: "ExecuteTiles",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_ExecuteTiles_SpellId",
                table: "ExecuteTiles",
                column: "SpellId");

            migrationBuilder.CreateIndex(
                name: "IX_ExecuteTiles_TileId",
                table: "ExecuteTiles",
                column: "TileId");

            migrationBuilder.CreateIndex(
                name: "IX_ImageTiles_TileId",
                table: "ImageTiles",
                column: "TileId");

            migrationBuilder.CreateIndex(
                name: "IX_LinkTiles_AbilityId",
                table: "LinkTiles",
                column: "AbilityId");

            migrationBuilder.CreateIndex(
                name: "IX_LinkTiles_ItemId",
                table: "LinkTiles",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_LinkTiles_SpellId",
                table: "LinkTiles",
                column: "SpellId");

            migrationBuilder.CreateIndex(
                name: "IX_LinkTiles_TileId",
                table: "LinkTiles",
                column: "TileId");

            migrationBuilder.CreateIndex(
                name: "IX_NoteTiles_TileId",
                table: "NoteTiles",
                column: "TileId");

            migrationBuilder.CreateIndex(
                name: "IX_Tiles_CharacterDashboardPageId",
                table: "Tiles",
                column: "CharacterDashboardPageId");

            migrationBuilder.CreateIndex(
                name: "IX_Tiles_CharacterId",
                table: "Tiles",
                column: "CharacterId");

            migrationBuilder.CreateIndex(
                name: "IX_Tiles_TileTypeId",
                table: "Tiles",
                column: "TileTypeId");
        }
    }
}
