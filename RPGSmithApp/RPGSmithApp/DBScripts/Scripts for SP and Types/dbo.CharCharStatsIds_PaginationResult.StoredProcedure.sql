USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[CharCharStatsIds_PaginationResult]    Script Date: 4/4/2019 11:26:42 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[CharCharStatsIds_PaginationResult]
(
	@CharacterID INT,
	@page INT=1,
	@size INT=30,
	@getResultForAddModScreen BIT=0
)
AS

--DECLARE @CharacterID INT=2426, @page INT=1, @size INT=30
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


	SET NOCOUNT ON;
	IF(@getResultForAddModScreen=0)
	BEGIN
		SET @sql = '
			WITH TABLE_SET AS
			(
				SELECT CCS.CharactersCharacterStatId, M.CharacterStatTypeId, M.CharacterStatID, ROW_NUMBER() OVER (ORDER BY M.SortOrder, CreatedDate desc) AS ''Index'' 
				FROM CharacterStats M 	
				LEFT JOIN CharactersCharacterStats CCS ON CCS.characterstatID=M.CharacterStatId
				WHERE CCS.CharacterId=' + CONVERT(NVARCHAR(12), @CharacterId) + ' AND (CCS.IsDeleted !=1 OR CCS.IsDeleted IS NULL) AND (M.IsDeleted !=1 OR M.IsDeleted IS NULL)

			)
			SELECT * FROM TABLE_SET WHERE [Index] BETWEEN ' + CONVERT(NVARCHAR(12), @offset) + ' AND ' + CONVERT(NVARCHAR(12), @newsize) + ';'
	END
	ELSE
	BEGIN
		SET @sql = '
			WITH TABLE_SET AS
			(
				SELECT CCS.CharactersCharacterStatId, M.CharacterStatTypeId, M.CharacterStatID, ROW_NUMBER() OVER (ORDER BY M.SortOrder, CreatedDate desc) AS ''Index'' 
				FROM CharacterStats M 	
				LEFT JOIN CharactersCharacterStats CCS ON CCS.characterstatID=M.CharacterStatId
				WHERE CCS.CharacterId=' + CONVERT(NVARCHAR(12), @CharacterId) + ' AND (CCS.IsDeleted !=1 OR CCS.IsDeleted IS NULL) AND (M.IsDeleted !=1 OR M.IsDeleted IS NULL) 
				AND M.CharacterStatTypeId  in (3,5,6,7,12,13,15) AND AddToModScreen=1 AND 
				M.IsChoiceNumeric = 
				CASE 
				WHEN  (M.CharacterStatTypeId=6) THEN 1
				ELSE
				M.IsChoiceNumeric END

			)
			SELECT * FROM TABLE_SET WHERE [Index] BETWEEN ' + CONVERT(NVARCHAR(12), @offset) + ' AND ' + CONVERT(NVARCHAR(12), @newsize) + ';'
	END
	print @sql
	EXECUTE (@sql)
END
GO
