USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[Character_UpdateTileConfig]    Script Date: 4/4/2019 10:40:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[Character_UpdateTileConfig]
(
@tileConfigs [Type_TileConfig] READONLY
)
AS
--DECLARE @tileConfigs [Type_TileConfig] 
--INSERT INTO  @tileConfigs SELECT top 10 0,0,0,0,0,0,0,0,0,1 from RulesetTileConfig

BEGIN
DECLARE @Count INT=1,@TotalCount INT =0
SELECT @TotalCount=COUNT(*) FROM @tileConfigs
while (@Count <= @TotalCount)
BEGIN
		DECLARE @Col INT,@Row INT,@SizeX INT,@SizeY INT,@CharacterTileId INT
		SELECT @Col=[Col],@Row=[Row],@SizeX=[SizeX],@SizeY=[SizeY],@CharacterTileId=[TileId] FROM @tileConfigs WHERE RowNum=@Count

	IF NOT EXISTS(SELECT * FROM TileConfig WHERE CharacterTileId=@CharacterTileId)
	BEGIN
		INSERT INTO TileConfig (CharacterTileId,[SortOrder],[UniqueId],[Payload],[Col],[Row],[SizeX],[SizeY],[IsDeleted])		
			SELECT [TileId],[SortOrder],[UniqueId],[Payload],[Col],[Row],[SizeX],[SizeY],[IsDeleted] FROM @tileConfigs WHERE RowNum=@Count
	END
	ELSE
	BEGIN
		
		UPDATE TileConfig SET [Col]=@Col,[Row]=@Row,[SizeX]=@SizeX,[SizeY]=@SizeY WHERE CharacterTileId=@CharacterTileId
	END
	SET @Count=@Count+1
END
END
GO
