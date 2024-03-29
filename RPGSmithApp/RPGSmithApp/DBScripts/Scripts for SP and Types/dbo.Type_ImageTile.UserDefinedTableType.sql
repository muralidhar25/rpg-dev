USE [rpgsmithapp]
GO
/****** Object:  UserDefinedTableType [dbo].[Type_ImageTile]    Script Date: 4/4/2019 10:40:53 AM ******/
CREATE TYPE [dbo].[Type_ImageTile] AS TABLE(
	[RowNum] [int] IDENTITY(1,1) NOT NULL,
	[RulesetTileId] [int] NULL,
	[Title] [nvarchar](255) NULL,
	[ImageUrl] [nvarchar](2048) NULL,
	[TitleTextColor] [nvarchar](50) NULL,
	[TitleBgColor] [nvarchar](50) NULL,
	[BodyTextColor] [nvarchar](50) NULL,
	[BodyBgColor] [nvarchar](50) NULL,
	[Shape] [int] NULL,
	[SortOrder] [int] NULL,
	[IsDeleted] [bit] NULL,
	[OldImageTileId] [int] NULL
)
GO
