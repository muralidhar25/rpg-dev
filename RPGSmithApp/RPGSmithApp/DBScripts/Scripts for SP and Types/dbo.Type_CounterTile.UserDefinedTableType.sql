USE [rpgsmithapp]
GO
/****** Object:  UserDefinedTableType [dbo].[Type_CounterTile]    Script Date: 3/28/2019 1:15:31 PM ******/
CREATE TYPE [dbo].[Type_CounterTile] AS TABLE(
	[RowNum] [int] IDENTITY(1,1) NOT NULL,
	[RulesetTileId] [int] NULL,
	[Title] [nvarchar](255) NULL,
	[DefaultValue] [int] NULL,
	[CurrentValue] [int] NULL,
	[Maximum] [int] NULL,
	[Minimum] [int] NULL,
	[Step] [int] NULL,
	[TitleTextColor] [nvarchar](50) NULL,
	[TitleBgColor] [nvarchar](50) NULL,
	[BodyTextColor] [nvarchar](50) NULL,
	[BodyBgColor] [nvarchar](50) NULL,
	[Shape] [int] NULL,
	[SortOrder] [int] NULL,
	[IsDeleted] [bit] NULL,
	[OldCounterTileId] [int] NULL
)
GO
