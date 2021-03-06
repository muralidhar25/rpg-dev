USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[CharacterStats_CheckDuplicateName]    Script Date: 4/4/2019 10:40:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--EXEC CharacterStats_CheckDuplicateName @RulesetId=149,@CharacterStatId=0,@StatName='Ideals'
CREATE PROCEDURE [dbo].[CharacterStats_CheckDuplicateName]
(
 @RulesetId INT,
 @CharacterStatId INT,
 @StatName VARCHAR(max)
)
AS
BEGIN
	SET NOCOUNT ON; 
    DECLARE @Exists INT
	DECLARE @ParentRulesetId INT 
	SELECT @ParentRulesetId=ParentRuleSetId FROM Rulesets WHERE RuleSetId=@RulesetId


IF(@CharacterStatId=0)
BEGIN

	IF EXISTS(
		SELECT * FROM [dbo].[CharacterStats] 
		WHERE LOWER(LTRIM(RTRIM(StatName)))=LOWER(LTRIM(RTRIM(CONVERT(NVARCHAR(max), @StatName)))) 
		AND (RuleSetId=CONVERT(NVARCHAR(12), @RulesetID) OR RulesetID=CONVERT(NVARCHAR(12), @ParentRulesetID))
		AND (IsDeleted != 1 OR IsDeleted IS NULL) 
		AND CharacterStatId NOT IN (SELECT Parentcharacterstatid FROM [CharacterStats] WHERE  (RulesetID=@RulesetID AND Parentcharacterstatid IS NOT NULL))
	)
	BEGIN
		SET @Exists = 1
	END
	ELSE
	BEGIN
		SET @Exists = 0
	END

	--print @Exists
	RETURN @Exists
END
ELSE
BEGIN
	IF EXISTS(
		SELECT * FROM [dbo].[CharacterStats] 
		WHERE CharacterStatId!=CONVERT(NVARCHAR(max), @CharacterStatId) 
		AND LOWER(LTRIM(RTRIM(StatName)))=LOWER(LTRIM(RTRIM(CONVERT(NVARCHAR(max), @StatName)))) 
		AND (RuleSetId=CONVERT(NVARCHAR(12), @RulesetID) OR RulesetID=CONVERT(NVARCHAR(12), @ParentRulesetID))
		AND (IsDeleted != 1 OR IsDeleted IS NULL) 
		AND CharacterStatId NOT IN (SELECT Parentcharacterstatid FROM [CharacterStats] WHERE  (RulesetID=@RulesetID AND Parentcharacterstatid IS NOT NULL))
	)
	BEGIN
		SET @Exists = 1
	END
	ELSE
	BEGIN
		SET @Exists = 0
	END
 
	--print @Exists
	RETURN @Exists
END
END
GO
