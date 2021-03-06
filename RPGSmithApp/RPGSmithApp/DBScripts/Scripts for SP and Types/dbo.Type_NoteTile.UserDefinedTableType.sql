USE [rpgsmithapp]
GO
/****** Object:  UserDefinedTableType [dbo].[Type_NoteTile]    Script Date: 4/4/2019 10:40:54 AM ******/
CREATE TYPE [dbo].[Type_NoteTile] AS TABLE(
	[RowNum] [int] IDENTITY(1,1) NOT NULL,
	[RulesetTileId] [int] NULL,
	[Title] [nvarchar](255) NULL,
	[Content] [nvarchar](max) NULL,
	[TitleTextColor] [nvarchar](50) NULL,
	[TitleBgColor] [nvarchar](50) NULL,
	[BodyTextColor] [nvarchar](50) NULL,
	[BodyBgColor] [nvarchar](50) NULL,
	[Shape] [int] NULL,
	[SortOrder] [int] NULL,
	[IsDeleted] [bit] NULL,
	[OldNoteTileId] [int] NULL
)
GO
