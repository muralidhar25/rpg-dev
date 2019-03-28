USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[Ruleset_UpdateTiles]    Script Date: 3/28/2019 1:15:36 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[Ruleset_UpdateTiles]
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
		DECLARE @Col INT,@Row INT,@SizeX INT,@SizeY INT,@RulesetTileId INT
		SELECT @Col=[Col],@Row=[Row],@SizeX=[SizeX],@SizeY=[SizeY],@RulesetTileId=[TileId] FROM @tileConfigs WHERE RowNum=@Count

	IF NOT EXISTS(SELECT * FROM RulesetTileConfig WHERE RulesetTileId=@RulesetTileId)
	BEGIN
		INSERT INTO RulesetTileConfig ([RulesetTileId],[SortOrder],[UniqueId],[Payload],[Col],[Row],[SizeX],[SizeY],[IsDeleted])		
			SELECT [TileId],[SortOrder],[UniqueId],[Payload],[Col],[Row],[SizeX],[SizeY],[IsDeleted] FROM @tileConfigs WHERE RowNum=@Count
	END
	ELSE
	BEGIN
		
		UPDATE RulesetTileConfig SET [Col]=@Col,[Row]=@Row,[SizeX]=@SizeX,[SizeY]=@SizeY WHERE RulesetTileId=@RulesetTileId
	END
	SET @Count=@Count+1
END
END
GO
