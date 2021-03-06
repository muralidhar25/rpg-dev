USE [rpgsmithapp]
GO
/****** Object:  UserDefinedTableType [dbo].[Type_CharacterStats]    Script Date: 4/4/2019 11:26:40 AM ******/
CREATE TYPE [dbo].[Type_CharacterStats] AS TABLE(
	[RowNum] [int] IDENTITY(1,1) NOT NULL,
	[RuleSetId] [int] NULL,
	[StatName] [nvarchar](255) NULL,
	[StatDesc] [nvarchar](4000) NULL,
	[IsActive] [bit] NULL,
	[CharacterStatTypeId] [smallint] NULL,
	[IsMultiSelect] [bit] NULL,
	[SortOrder] [int] NULL,
	[OwnerId] [nvarchar](50) NULL,
	[CreatedBy] [nvarchar](50) NULL,
	[CreatedDate] [datetime2](7) NULL,
	[ModifiedBy] [nvarchar](50) NULL,
	[ModifiedDate] [datetime2](7) NULL,
	[StatCalculation] [nvarchar](500) NULL,
	[StatChoiceValue] [nvarchar](100) NULL,
	[OldStatID] [int] NULL,
	[ParentCharacterStatId] [int] NULL,
	[AddToModScreen] [bit] NULL,
	[IsChoiceNumeric] [bit] NULL,
	[IsChoicesFromAnotherStat] [bit] NULL
)
GO
