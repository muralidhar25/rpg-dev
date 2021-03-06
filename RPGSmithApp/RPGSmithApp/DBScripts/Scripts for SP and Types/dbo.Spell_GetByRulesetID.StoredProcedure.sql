USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[Spell_GetByRulesetID]    Script Date: 4/4/2019 10:40:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


--EXEC Spell_GetByRulesetID @RulesetID=149,@page=1,@size=10

CREATE PROCEDURE [dbo].[Spell_GetByRulesetID]
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

	SET NOCOUNT ON;
	SET @sql = '
		WITH TABLE_SET AS
		(
			SELECT *, ROW_NUMBER() OVER (ORDER BY Name) AS ''Index''
			FROM [dbo].[Spells] WHERE (RulesetID=' + CONVERT(NVARCHAR(12), @RulesetID)
			 + ' OR RulesetID='+ CONVERT(NVARCHAR(12), @ParentRulesetID) + ') 
			AND (IsDeleted !=1 OR IsDeleted IS NULL) 
			AND SpellId NOT IN (SELECT ParentSpellId FROM Spells 
				WHERE (RulesetID='+ CONVERT(NVARCHAR(12), @RulesetID) + ' AND ParentSpellId IS NOT NULL))
		)
		SELECT * FROM TABLE_SET WHERE [Index] BETWEEN ' 
		+ CONVERT(NVARCHAR(12), @offset) + ' AND ' + CONVERT(NVARCHAR(12), @newsize) 
		+ ';SELECT *  FROM [dbo].[RuleSets] WHERE RuleSetId=' + CONVERT(NVARCHAR(12), @RulesetID)
		+ ' AND (IsDeleted !=1 OR IsDeleted IS NULL)'
   --print @sql
   EXECUTE (@sql)

	--SELECT * FROM Spells WHERE (RulesetID=@RulesetID OR RulesetID=@ParentRulesetID) 
	--	AND (IsDeleted !=1 OR IsDeleted IS NULL) 
	--	AND SpellId NOT IN (SELECT ParentSpellId FROM Spells WHERE  (RulesetID=@RulesetID AND ParentSpellId IS NOT NULL))
	--ORDER BY Name

	--SELECT *  FROM [dbo].[RuleSets] WHERE RuleSetId=@RulesetID AND (IsDeleted !=1 OR IsDeleted IS NULL)

END
ELSE
BEGIN
	SET NOCOUNT ON;
	SET @sql = '
		WITH TABLE_SET AS
		(
			SELECT *, ROW_NUMBER() OVER (ORDER BY Name) AS ''Index''
			FROM [dbo].[Spells] WHERE RulesetID=' + CONVERT(NVARCHAR(12), @RulesetID) + ' AND (IsDeleted != 1 OR IsDeleted IS NULL)
		)
		SELECT * FROM TABLE_SET WHERE [Index] BETWEEN ' 
		+ CONVERT(NVARCHAR(12), @offset) + ' AND ' + CONVERT(NVARCHAR(12), @newsize) 
		+ ';SELECT *  FROM [dbo].[RuleSets] WHERE RuleSetId=' + CONVERT(NVARCHAR(12), @RulesetID)
		+ ' AND (IsDeleted !=1 OR IsDeleted IS NULL)'
	--print @sql
	EXECUTE (@sql)


	--SELECT * FROM [dbo].[Spells] WHERE RulesetID=@RulesetID AND (IsDeleted != 1 OR IsDeleted IS NULL) ORDER BY Name
	--SELECT * FROM [dbo].[RuleSets] WHERE RuleSetId=@RulesetID AND (IsDeleted != 1 OR IsDeleted IS NULL)
END
END
GO
