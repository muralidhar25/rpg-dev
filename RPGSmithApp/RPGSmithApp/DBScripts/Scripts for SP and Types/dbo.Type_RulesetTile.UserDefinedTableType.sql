USE [rpgsmithapp]
GO
/****** Object:  UserDefinedTableType [dbo].[Type_RulesetTile]    Script Date: 3/28/2019 1:15:34 PM ******/
CREATE TYPE [dbo].[Type_RulesetTile] AS TABLE(
	[RowNum] [int] NOT NULL,
	[TileTypeId] [int] NULL,
	[RulesetDashboardPageId] [int] NULL,
	[RulesetId] [int] NULL,
	[Shape] [int] NULL,
	[LocationX] [int] NULL,
	[LocationY] [int] NULL,
	[Height] [int] NULL,
	[Width] [int] NULL,
	[SortOrder] [int] NULL,
	[IsDeleted] [bit] NULL,
	[OldRulesetTileId] [int] NULL
)
GO
