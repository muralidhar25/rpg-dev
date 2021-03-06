USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[Core_CreatedCharacterStat_UpdateChildCharacters]    Script Date: 4/4/2019 10:40:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[Core_CreatedCharacterStat_UpdateChildCharacters]
(
@RulesetID INT,@InsertedCharacterStat INT
)
AS
--DECLARE @RulesetID INT=124, @InsertedCharacterStat INT=1007

IF EXISTS (SELECT RulesetID FROM RULESETS WHERE RulesetID= @RulesetID AND ParentRulesetID IS NULL AND (IsCoreRuleset =1) AND (IsDeleted !=1 OR IsDeleted IS NULL))
BEGIN 
DECLARE @TempIDs_R AS TABLE (id int)
DECLARE @TempIDs_C AS TABLE (id int)
INSERT INTO @TempIDs_R SELECT RulesetID FROM RULESETS WHERE RulesetID IN(SELECT RulesetID FROM RULESETS WHERE ParentRulesetID=@RulesetID AND (IsDeleted !=1 OR IsDeleted IS NULL))
INSERT INTO @TempIDs_C SELECT characterid FROM Characters WHERE RulesetID IN (SELECT id FROM @TempIDs_R )

SELECT @InsertedCharacterStat,id FROM @TempIDs_C
INSERT INTO charactersCharacterStats ([CharacterStatId],[CharacterId],YesNo, OnOff, [Value], Number, SubValue, [Current], Maximum, CalculationResult, IsDeleted)
 (SELECT @InsertedCharacterStat,id,0,0,0,0,0,0,0,0,0 FROM @TempIDs_C)
END
GO
