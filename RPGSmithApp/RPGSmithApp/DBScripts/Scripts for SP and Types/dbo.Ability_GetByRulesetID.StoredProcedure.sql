USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[Ability_GetByRulesetID]    Script Date: 4/4/2019 10:40:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--EXEC Ability_GetByRulesetID @RulesetID = '111',@page='1',@size='30'

CREATE PROCEDURE [dbo].[Ability_GetByRulesetID]
(
 @RulesetID INT,
 @page INT,
 @size INT
)
AS
BEGIN

	DECLARE @offset INT
	DECLARE @newsize INT
	DECLARE @sql NVARCHAR(MAX)

	IF(@page=0)
		BEGIN
		SET @offset = @page
		SET @newsize = @size
		END
	ELSE 
		BEGIN
		SET @offset = (@size * (@page-1))+1 
		SET @newsize = (@size * @page) 
		END

IF EXISTS( SELECT RulesetID FROM Rulesets WHERE RuleSetId=@RulesetID AND ParentRulesetID IS NOT NULL AND (IsDeleted != 1 OR IsDeleted IS NULL))
BEGIN 
	DECLARE @ParentRulesetID INT 
	SELECT @ParentRulesetID=ParentRulesetID FROM Rulesets WHERE RuleSetId=@RulesetID

	IF( @ParentRulesetID IS NULL)
	BEGIN 
		SET @ParentRulesetID=@RulesetID
	END

	print @RulesetID

	SET NOCOUNT ON;
	SET @sql = '
		WITH TABLE_SET AS
		(
			SELECT *, ROW_NUMBER() OVER (ORDER BY Name) AS ''Index''
			FROM [dbo].[Abilities] WHERE (RulesetID=' + CONVERT(NVARCHAR(12), @RulesetID)
			 + ' OR RulesetID='+ CONVERT(NVARCHAR(12), @ParentRulesetID) + ') 
			AND (IsDeleted !=1 OR IsDeleted IS NULL) 
			AND AbilityId NOT IN (SELECT ParentAbilityId FROM [dbo].[Abilities] 
				WHERE (RulesetID='+ CONVERT(NVARCHAR(12), @RulesetID) + ' AND ParentAbilityId IS NOT NULL))
		)
		SELECT * FROM TABLE_SET WHERE [Index] BETWEEN ' 
		+ CONVERT(NVARCHAR(12), @offset) + ' AND ' + CONVERT(NVARCHAR(12), @newsize) 
		+ ';SELECT *  FROM [dbo].[RuleSets] WHERE RuleSetId=' + CONVERT(NVARCHAR(12), @RulesetID)
		+ ' AND (IsDeleted !=1 OR IsDeleted IS NULL)'
   --print @sql
   EXECUTE (@sql)

	--SELECT * FROM [dbo].[Abilities] WHERE (RuleSetId=@RulesetID OR RuleSetId=@ParentRulesetID) 
	--	AND (IsDeleted != 1 OR IsDeleted IS NULL) 
	--	AND AbilityId NOT IN (SELECT ParentAbilityId FROM [dbo].[Abilities] WHERE (RulesetID=@RulesetID AND ParentAbilityId IS NOT NULL))
	--ORDER BY Name

	--SELECT *  FROM [dbo].[RuleSets] WHERE RuleSetId=@RulesetID AND (IsDeleted != 1 OR IsDeleted IS NULL)

END
ELSE
BEGIN

	SET NOCOUNT ON;
	SET @sql = '
		WITH TABLE_SET AS
		(
			SELECT *, ROW_NUMBER() OVER (ORDER BY Name) AS ''Index''
			FROM [dbo].[Abilities] WHERE RulesetID=' + CONVERT(NVARCHAR(12), @RulesetID) + ' AND (IsDeleted != 1 OR IsDeleted IS NULL)
		)
		SELECT * FROM TABLE_SET WHERE [Index] BETWEEN ' 
		+ CONVERT(NVARCHAR(12), @offset) + ' AND ' + CONVERT(NVARCHAR(12), @newsize) 
		+ ';SELECT *  FROM [dbo].[RuleSets] WHERE RuleSetId=' + CONVERT(NVARCHAR(12), @RulesetID)
		+ ' AND (IsDeleted !=1 OR IsDeleted IS NULL)'
	--print @sql
	EXECUTE (@sql)

	--SELECT * FROM [dbo].[Abilities] WHERE RuleSetId=@RulesetID AND (IsDeleted != 1 OR IsDeleted IS NULL) ORDER BY Name
	--SELECT * FROM [dbo].[RuleSets] WHERE RuleSetId=@RulesetID AND (IsDeleted != 1 OR IsDeleted IS NULL)
END
END
GO
