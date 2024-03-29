USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[CharacterAbility_GetByCharacterId]    Script Date: 4/4/2019 10:40:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[CharacterAbility_GetByCharacterId]
(
 @CharacterId INT,
 @RulesetID INT,
 @page INT,
 @size INT,
 @SortType INT=1
)
AS
BEGIN

	DECLARE @offset INT
	DECLARE @newsize INT
	DECLARE @sql NVARCHAR(MAX)

	DECLARE @OrderByClause NVARCHAR(MAX)

	IF(@SortType=1) --Alphabetical
	BEGIN
		SET @OrderByClause = ' ORDER BY A.Name '
	END
	ELSE IF(@SortType=2) --Enabled
	BEGIN
		SET @OrderByClause = ' ORDER BY CA.IsEnabled desc, A.Name '
	END
	ELSE IF(@SortType=3) --Level
	BEGIN
		SET @OrderByClause = ' ORDER BY A.Level desc, A.Name '
	END
	


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


	SET NOCOUNT ON;
	SET @sql = '
		WITH TABLE_SET AS
		(
			SELECT CA.CharacterAbilityId,CA.IsEnabled CharacterIsEnabled,CA.CurrentNumberOfUses CharacterCurrentNumberOfUses,CA.MaxNumberOfUses CharacterMaxNumberOfUses,
			A.*, ROW_NUMBER() OVER ('+@OrderByClause+') AS ''Index'' FROM [dbo].[CharacterAbilities] CA
			JOIN [dbo].[Abilities] A ON CA.[AbilityId]=A.[AbilityId]
			WHERE CA.CharacterId=' + CONVERT(NVARCHAR(12), @CharacterId) + ' AND (CA.IsDeleted != 1 OR CA.IsDeleted IS NULL)
		)
		SELECT * FROM TABLE_SET WHERE [Index] BETWEEN ' + CONVERT(NVARCHAR(12), @offset) + ' AND ' + CONVERT(NVARCHAR(12), @newsize) + ';
		SELECT * FROM [dbo].[RuleSets] WHERE RuleSetId=' + CONVERT(NVARCHAR(12), @RulesetID) + ' AND (IsDeleted !=1 OR IsDeleted IS NULL)'+ ';
		SELECT * FROM [dbo].[Characters] WHERE [CharacterId]=' + CONVERT(NVARCHAR(12), @CharacterId) + ' AND (IsDeleted !=1 OR IsDeleted IS NULL)'
	print @sql
	EXECUTE (@sql)

	
END
GO
