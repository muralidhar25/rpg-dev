USE [rpgsmithapp]
GO
/****** Object:  UserDefinedTableType [dbo].[Type_ItemMaster]    Script Date: 4/4/2019 10:40:53 AM ******/
CREATE TYPE [dbo].[Type_ItemMaster] AS TABLE(
	[RowNum] [int] IDENTITY(1,1) NOT NULL,
	[RuleSetId] [int] NULL,
	[ItemName] [nvarchar](255) NULL,
	[ItemImage] [nvarchar](2048) NULL,
	[ItemStats] [nvarchar](max) NULL,
	[ItemVisibleDesc] [nvarchar](max) NULL,
	[Command] [nvarchar](max) NULL,
	[ItemCalculation] [nvarchar](255) NULL,
	[Value] [decimal](18, 8) NULL,
	[Volume] [decimal](18, 8) NULL,
	[Weight] [decimal](18, 3) NULL,
	[IsContainer] [bit] NULL,
	[ContainerWeightMax] [decimal](18, 3) NULL,
	[ContainerVolumeMax] [decimal](18, 8) NULL,
	[ContainerWeightModifier] [varchar](50) NULL,
	[PercentReduced] [decimal](18, 3) NULL,
	[TotalWeightWithContents] [decimal](18, 3) NULL,
	[IsMagical] [bit] NULL,
	[IsConsumable] [bit] NULL,
	[Metatags] [nvarchar](max) NULL,
	[Rarity] [nvarchar](20) NULL,
	[ParentItemMasterId] [int] NULL,
	[IsDeleted] [bit] NULL,
	[OldItemMasterId] [int] NULL,
	[SpellId] [int] NULL,
	[AbilityId] [int] NULL
)
GO
