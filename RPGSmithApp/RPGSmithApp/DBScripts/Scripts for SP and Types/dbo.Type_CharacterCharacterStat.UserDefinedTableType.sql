USE [rpgsmithapp]
GO
/****** Object:  UserDefinedTableType [dbo].[Type_CharacterCharacterStat]    Script Date: 3/28/2019 1:15:29 PM ******/
CREATE TYPE [dbo].[Type_CharacterCharacterStat] AS TABLE(
	[RowNum] [int] NULL,
	[CharactersCharacterStatId] [int] NULL,
	[CharacterStatId] [int] NULL,
	[CharacterId] [int] NULL,
	[Text] [nvarchar](255) NULL,
	[RichText] [nvarchar](max) NULL,
	[Choice] [nvarchar](255) NULL,
	[MultiChoice] [nvarchar](max) NULL,
	[Command] [nvarchar](max) NULL,
	[YesNo] [bit] NULL,
	[OnOff] [bit] NULL,
	[Value] [int] NULL,
	[Number] [int] NULL,
	[SubValue] [int] NULL,
	[Current] [int] NULL,
	[Maximum] [int] NULL,
	[CalculationResult] [int] NULL,
	[IsDeleted] [bit] NULL
)
GO
