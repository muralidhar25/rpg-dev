USE [rpgsmithapp]
GO
/****** Object:  UserDefinedTableType [dbo].[Type_CommandTile]    Script Date: 4/4/2019 10:40:51 AM ******/
CREATE TYPE [dbo].[Type_CommandTile] AS TABLE(
	[RowNum] [int] IDENTITY(1,1) NOT NULL,
	[RulesetTileId] [int] NULL,
	[Title] [nvarchar](255) NULL,
	[Command] [nvarchar](max) NULL,
	[ImageUrl] [nvarchar](2048) NULL,
	[TitleTextColor] [nvarchar](50) NULL,
	[TitleBgColor] [nvarchar](50) NULL,
	[BodyTextColor] [nvarchar](50) NULL,
	[BodyBgColor] [nvarchar](50) NULL,
	[Shape] [int] NULL,
	[SortOrder] [int] NULL,
	[IsDeleted] [bit] NULL,
	[OldCommandTileId] [int] NULL
)
GO
