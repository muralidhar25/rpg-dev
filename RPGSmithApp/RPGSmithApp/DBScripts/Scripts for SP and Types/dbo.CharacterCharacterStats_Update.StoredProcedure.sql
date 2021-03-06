USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[CharacterCharacterStats_Update]    Script Date: 4/4/2019 10:40:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[CharacterCharacterStats_Update]
(
	@characterCharacterStatList [Type_CharacterCharacterStatTb] READONLY
)
AS
--DECLARE @characterCharacterStatList [Type_CharacterCharacterStat]

--INSERT INTO @characterCharacterStatList SELECT 1,* FROM CharactersCharacterStats WHERE CharactersCharacterStatId=7458


BEGIN
	DECLARE @Count INT=1,@TotalCount INT =0
	SELECT @TotalCount=COUNT(*) FROM @characterCharacterStatList
	while (@Count <= @TotalCount)
	BEGIN
			DECLARE @CharactersCharacterStatId [int],
					@CharacterStatId [int],
					@CharacterId [int],
					@Text [nvarchar](255),
					@RichText [nvarchar](max),
					@Choice [nvarchar](255),
					@MultiChoice [nvarchar](max),
					@Command [nvarchar](max),
					@YesNo [bit],
					@OnOff [bit],
					@Value [int],
					@Number [int],
					@SubValue [int],
					@Current [int],
					@Maximum [int],
					@CalculationResult [int],
					@Minimum [int],
					@DefaultValue [int],
					@ComboText [nvarchar](max),
					@IsDeleted [bit],
					@Display [bit],
					@ShowCheckbox [bit],
					@IsCustom [bit],					
					@IsYes [bit],
					@IsOn [bit],
					@LinkType [nvarchar](8)

			SELECT @CharactersCharacterStatId=CharactersCharacterStatId,
					@CharacterStatId=CharacterStatId,
					@CharacterId=CharacterId,
					@Text=[Text],
					@RichText=RichText,
					@Choice=Choice,
					@MultiChoice=MultiChoice,
					@Command=Command,
					@YesNo=YesNo,
					@OnOff=OnOff,
					@Value=[Value],
					@Number=Number,
					@SubValue=SubValue,
					@Current=[Current],
					@Maximum=Maximum,
					@CalculationResult=CalculationResult,
					@Minimum=Minimum,
					@DefaultValue=DefaultValue,
					@ComboText=ComboText,
					@Display=Display,
					@ShowCheckbox=ShowCheckbox,
					@IsCustom=IsCustom,					
					@IsYes=IsYes,
					@IsOn=IsOn,
					@LinkType=LinkType
			FROM @characterCharacterStatList  WHERE RowNum=@Count 
			 
			UPDATE CharactersCharacterStats SET [Text]=@Text,RichText=@RichText,
					Command=@Command,YesNo=@YesNo,OnOff=@OnOff,[Value]=@Value,
					SubValue=@SubValue,[Current]=@Current,Maximum=@Maximum,CalculationResult=@CalculationResult,
					Minimum=@Minimum,DefaultValue=@DefaultValue,ComboText=@ComboText,
					Number=@Number,Choice=@Choice,
					MultiChoice=@MultiChoice, 
					Display=@Display,ShowCheckbox=@ShowCheckbox,IsCustom=@IsCustom,IsYes=@IsYes,IsOn=@IsOn,LinkType=@LinkType
			WHERE CharactersCharacterStatId=@CharactersCharacterStatId
		
		SET @Count=@Count+1
	END
END

--select * from CharactersCharacterStats order by 1 desc
GO
