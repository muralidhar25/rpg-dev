USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[CharactersCharacterStats_Create]    Script Date: 4/4/2019 10:40:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[CharactersCharacterStats_Create]
(
	@CharacterStatId int,
	@CharacterId int,
	@Text nvarchar(255),
	@RichText nvarchar(max) ,
	@Choice nvarchar(255) ,
	@MultiChoice nvarchar(max) ,
	@Command nvarchar(max) ,
	@YesNo bit ,
	@OnOff bit ,
	@Value int ,
	@Number int ,
	@SubValue int ,
	@Current int ,
	@Maximum int ,
	@CalculationResult int ,
	@IsDeleted bit ,
	@ComboText nvarchar(max) ,
	@DefaultValue int  ,
	@Minimum int  ,
	@Display bit  ,
	@IsCustom bit  ,
	@ShowCheckbox bit  ,
	@IsOn bit  ,
	@IsYes bit  ,
	@LinkType nvarchar(8)
	)
AS

INSERT INTO CharactersCharacterStats ([CharacterStatId],[CharacterId],[Text],[RichText],[Choice],[MultiChoice],[Command],[YesNo],[OnOff]
,[Value],[Number],[SubValue],[Current],[Maximum],[CalculationResult],[IsDeleted],[ComboText],[DefaultValue],[Minimum],[Display],[IsCustom]
,[ShowCheckbox],[IsOn],[IsYes],[LinkType])

VALUES
(@CharacterStatId,@CharacterId,@Text,@RichText,@Choice,@MultiChoice,@Command,@YesNo,@OnOff
,@Value,@Number,@SubValue,@Current,@Maximum,@CalculationResult,@IsDeleted,@ComboText,@DefaultValue,@Minimum,@Display,@IsCustom
,@ShowCheckbox,@IsOn,@IsYes,@LinkType)
GO
