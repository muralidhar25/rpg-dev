USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[CharacterStats_GetByRulesetID]    Script Date: 4/4/2019 10:40:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
create PROCEDURE [dbo].[CharacterStats_GetByRulesetID]
(
 @RulesetID int
)
AS
BEGIN

IF EXISTS( SELECT RulesetID FROM Rulesets WHERE RuleSetId=@RulesetID AND ParentRulesetID IS NOT NULL AND (IsDeleted != 1 OR IsDeleted IS NULL))
BEGIN 
	DECLARE @ParentRulesetID INT 
	SELECT @ParentRulesetID=ParentRulesetID FROM Rulesets WHERE RuleSetId=@RulesetID

	IF( @ParentRulesetID IS NULL)
	BEGIN 
		SET @ParentRulesetID=@RulesetID
	END

	SELECT * FROM [dbo].[CharacterStats] WHERE (RuleSetId=@RulesetID OR RuleSetId=@ParentRulesetID) 
		AND (IsDeleted != 1 OR IsDeleted IS NULL) 
		AND CharacterStatId NOT IN (SELECT ParentCharacterStatId FROM [dbo].[CharacterStats] WHERE (RulesetID=@RulesetID AND ParentCharacterStatId IS NOT NULL))
	ORDER BY StatName

	SELECT *  FROM [dbo].[RuleSets] WHERE RuleSetId=@RulesetID AND (IsDeleted != 1 OR IsDeleted IS NULL)

END
ELSE
BEGIN
	SELECT * FROM [dbo].[CharacterStats] WHERE RuleSetId=@RulesetID AND (IsDeleted != 1 OR IsDeleted IS NULL) ORDER BY StatName
	SELECT * FROM [dbo].[RuleSets] WHERE RuleSetId=@RulesetID AND (IsDeleted != 1 OR IsDeleted IS NULL)
END
END
GO
