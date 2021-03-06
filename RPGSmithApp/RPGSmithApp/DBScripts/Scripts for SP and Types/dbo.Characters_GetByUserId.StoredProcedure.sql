USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[Characters_GetByUserId]    Script Date: 4/4/2019 10:40:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--EXEC [Characters_GetByUserId] @UserId='83de617b-407e-40f6-92a0-a01a006a141e',@page=1,@size=30
CREATE PROCEDURE [dbo].[Characters_GetByUserId]
(
 @UserId VARCHAR(max),
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


	--SELECT R.RuleSetId, R.RuleSetName, R.RuleSetDesc, R.ImageUrl, R.ThumbnailUrl,
	--R.IsAbilityEnabled,R.IsAllowSharing,R.IsCoreRuleset,R.IsItemEnabled,R.IsSpellEnabled,
	--R.ParentRuleSetId,R.ShareCode,
	--C.* FROM [dbo].[Characters] C
	--JOIN [dbo].[RuleSets] R ON R.RuleSetId=C.RuleSetId
	--WHERE C.UserId = @UserId AND (C.IsDeleted != 1 OR C.IsDeleted IS NULL)

	--SELECT * FROM [dbo].[RuleSets]
	--WHERE CreatedBy = @UserId AND (IsDeleted != 1 OR IsDeleted IS NULL)

	SET NOCOUNT ON;
	SET @sql = '
		WITH TABLE_SET AS
		(
			SELECT R.RuleSetId RuleSetRuleSetId, R.RuleSetName, R.RuleSetDesc, R.ImageUrl RuleSetImageUrl, R.ThumbnailUrl RuleSetThumbnailUrl,
				R.IsAbilityEnabled,R.IsAllowSharing, R.IsCoreRuleset, R.IsItemEnabled,
				R.IsSpellEnabled, R.ParentRuleSetId, R.ShareCode,
				C.* , ROW_NUMBER() OVER (ORDER BY C.CharacterName) AS ''Index'' 
			FROM [dbo].[Characters] C 
			JOIN [dbo].[RuleSets] R ON R.RuleSetId=C.RuleSetId 
			WHERE C.UserId=''' + CONVERT(NVARCHAR(max), @UserId) + ''' AND (C.IsDeleted != 1 OR C.IsDeleted IS NULL)
		)
		SELECT * FROM TABLE_SET WHERE [Index] BETWEEN ' + CONVERT(NVARCHAR(12), @offset) + ' AND ' + CONVERT(NVARCHAR(12), @newsize) + ';
		SELECT * FROM [dbo].[RuleSets] WHERE CreatedBy=''' + CONVERT(NVARCHAR(max), @UserId) + ''' AND (IsDeleted !=1 OR IsDeleted IS NULL)'
	
	--print @sql
	EXECUTE (@sql)

END
GO
