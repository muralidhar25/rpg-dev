USE [rpgsmithapp]
GO
/****** Object:  UserDefinedTableType [dbo].[Type_CounterTile]    Script Date: 4/4/2019 10:40:52 AM ******/
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
