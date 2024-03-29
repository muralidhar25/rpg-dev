USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[Ruleset_CreateTiles]    Script Date: 4/4/2019 10:40:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[Ruleset_CreateTiles]
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
	DECLARE @RulesetTileId INT
		SELECT @RulesetTileId=[TileId] FROM @tileConfigs WHERE RowNum=@Count

	IF NOT EXISTS(SELECT * FROM RulesetTileConfig WHERE RulesetTileId=@RulesetTileId)
	BEGIN
		INSERT INTO RulesetTileConfig ([RulesetTileId],[SortOrder],[UniqueId],[Payload],[Col],[Row],[SizeX],[SizeY],[IsDeleted])		
			SELECT [TileId],[SortOrder],[UniqueId],[Payload],[Col],[Row],[SizeX],[SizeY],[IsDeleted] FROM @tileConfigs WHERE RowNum=@Count
	END
	SET @Count=@Count+1
END
END
GO
