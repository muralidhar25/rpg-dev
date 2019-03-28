USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[CharacterSpell_GetByCharacterId]    Script Date: 3/28/2019 1:15:36 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[CharacterSpell_GetByCharacterId]
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
		SET @OrderByClause = ' ORDER BY S.Name '
	END
	ELSE IF(@SortType=2) --Readied
	BEGIN
		SET @OrderByClause = ' ORDER BY CS.IsMemorized desc, S.Name '
	END
	ELSE IF(@SortType=3) --Level Sort
	BEGIN
		SET @OrderByClause = ' ORDER BY S.Levels desc, S.Name '
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
			SELECT CS.CharacterSpellId,CS.IsMemorized CharacterIsMemorized,
			S.*, ROW_NUMBER() OVER ('+@OrderByClause+') AS ''Index'' FROM [dbo].[CharacterSpells] CS
			JOIN [dbo].[Spells] S ON CS.[SpellId]=S.[SpellId]
			WHERE CS.CharacterId=' + CONVERT(NVARCHAR(12), @CharacterId) + ' AND (CS.IsDeleted != 1 OR CS.IsDeleted IS NULL)
		)
		SELECT * FROM TABLE_SET WHERE [Index] BETWEEN ' + CONVERT(NVARCHAR(12), @offset) + ' AND ' + CONVERT(NVARCHAR(12), @newsize) + ';
		SELECT * FROM [dbo].[RuleSets] WHERE RuleSetId=' + CONVERT(NVARCHAR(12), @RulesetID) + ' AND (IsDeleted !=1 OR IsDeleted IS NULL)'+ ';
		SELECT * FROM [dbo].[Characters] WHERE [CharacterId]=' + CONVERT(NVARCHAR(12), @CharacterId) + ' AND (IsDeleted !=1 OR IsDeleted IS NULL)'
	
	print @sql
	EXECUTE (@sql)

	
END

GO
