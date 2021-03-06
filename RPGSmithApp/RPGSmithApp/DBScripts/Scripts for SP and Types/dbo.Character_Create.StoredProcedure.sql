USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[Character_Create]    Script Date: 4/4/2019 11:26:42 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[Character_Create]
(
@CharacterName NVARCHAR(100),
@CharacterDescription NVARCHAR(MAX),
@ImageUrl NVARCHAR(2048),
@ThumbnailUrl NVARCHAR(2048),
@UserId NVARCHAR(50),
@RuleSetId INT,
@LastCommand  NVARCHAR(MAX),
@LastCommandResult NVARCHAR(MAX),
@InventoryWeight DECIMAL(18,2),
@LastCommandValues NVARCHAR(MAX),
@LayoutHeight INT,
@LayoutWidth INT,
@CharIdToDuplicate INT=0
)
AS
BEGIN TRAN
DECLARE @CharacterID INT 

INSERT INTO Characters
([CharacterName],[CharacterDescription],[ImageUrl],[ThumbnailUrl],[UserId],[RuleSetId],[ParentCharacterId],[IsDeleted],[LastCommand],[LastCommandResult],
[InventoryWeight],[LastCommandValues],[LastCommandTotal])
VALUES
(@CharacterName,@CharacterDescription,@ImageUrl,@ThumbnailUrl,@UserId,@RuleSetId,NULL,NULL,@LastCommand,@LastCommandResult,@InventoryWeight,@LastCommandValues,0)
SET @CharacterID=@@IDENTITY

DECLARE @ParentRulesetID INT 
SELECT @ParentRulesetID=ParentRulesetID FROM Rulesets WHERE RuleSetId=@RulesetID

IF( @ParentRulesetID IS NULL)
BEGIN 
	SET @ParentRulesetID=@RulesetID
END



DECLARE @NewLayoutID INT,@NewPageID INT,@NewTileID INT,@TileType INT,@RulesetTileID INT,@CharacterTileID INT
DECLARE @TotalLayoutCount INT, @TotalPageCount INT=0, @TotalTilesCount INT=0,
		@CurrentLayoutCount INT=1, @CurrentPageCount INT=1, @CurrentTilesCount INT=1,
		@IsDefaultLayout INT=1

	DECLARE @TempLayoutTbl AS TABLE (
		[RowNum] [int] IDENTITY(1,1),
		[RulesetDashboardLayoutId] [int],
		[RulesetId] [int],
		[Name] [nvarchar](255),
		[IsDefaultLayout] [bit],
		[DefaultPageId] [int],
		[LayoutHeight] [int] ,
		[LayoutWidth] [int],
		[SortOrder] [int],
		[IsDeleted] [bit],
		[IsDefaultComputer] [bit],
		[IsDefaultTablet] [bit],
		[IsDefaultMobile] [bit]
	)

	DECLARE @TempPageTbl AS TABLE (
		[RowNum] [int] IDENTITY(1,1),
		[RulesetDashboardPageId] [int],
		[RulesetDashboardLayoutId] [int],
		[RulesetId] [int],
		[Name] [nvarchar](255),
		[SortOrder] [int],
		[IsDeleted] [bit],
		[ContainerHeight] [int],
		[ContainerWidth] [int],
		[TitleTextColor] [nvarchar](50),
		[TitleBgColor] [nvarchar](50),
		[BodyTextColor] [nvarchar](50),
		[BodyBgColor] [nvarchar](50)
	)

	DECLARE @TempTileTbl AS TABLE (
		[RowNum] [int] IDENTITY(1,1),
		[RulesetTileId] [int],
		[TileTypeId] [int],
		[RulesetDashboardPageId] [int],
		[RulesetId] [int],
		[Shape] [int],
		[LocationX] [int],
		[LocationY] [int],
		[Height] [int],
		[Width] [int],
		[SortOrder] [int],
		[IsDeleted] [bit]
	)


IF (@CharIdToDuplicate=0)
BEGIN
IF EXISTS( SELECT RulesetID FROM Rulesets WHERE RuleSetId=@RulesetID AND ParentRulesetID IS NOT NULL AND (IsDeleted != 1 OR IsDeleted IS NULL))
BEGIN	
	INSERT INTO CharactersCharacterStats (CharacterId,CharacterStatId,CalculationResult,IsDeleted
	,Display,IsCustom,ShowCheckbox,YesNo,OnOff,Number,[Current],Maximum,[Value],SubValue,[Text],RichText,Command,ComboText,DefaultValue)
	SELECT @CharacterID,CharacterStatId,0,0
	,ISNULL((SELECT TOP 1 Display FROM  CharacterStatToggle WHERE CharacterStatId=cs.CharacterStatId),0 )
	,ISNULL((SELECT TOP 1 IsCustom FROM  CharacterStatToggle WHERE CharacterStatId=cs.CharacterStatId) ,0 )
	,ISNULL((SELECT TOP 1 ShowCheckbox FROM  CharacterStatToggle WHERE CharacterStatId=cs.CharacterStatId) ,0 )
	,ISNULL((SELECT TOP 1 YesNo FROM  CharacterStatToggle WHERE CharacterStatId=cs.CharacterStatId) ,0 )
	,ISNULL((SELECT TOP 1 OnOff FROM  CharacterStatToggle WHERE CharacterStatId=cs.CharacterStatId) ,0 )
	,ISNULL((SELECT TOP 1 DefaultValue FROM  CharacterStatDefaultValues WHERE CharacterStatId=cs.CharacterStatId AND [Type]=3) ,NULL )
	,ISNULL((SELECT TOP 1 DefaultValue FROM  CharacterStatDefaultValues WHERE CharacterStatId=cs.CharacterStatId AND [Type]=4) ,0 )
	,ISNULL((SELECT TOP 1 DefaultValue FROM  CharacterStatDefaultValues WHERE CharacterStatId=cs.CharacterStatId AND [Type]=5) ,0 )
	,ISNULL((SELECT TOP 1 DefaultValue FROM  CharacterStatDefaultValues WHERE CharacterStatId=cs.CharacterStatId AND [Type]=6) ,0 )
	,ISNULL((SELECT TOP 1 DefaultValue FROM  CharacterStatDefaultValues WHERE CharacterStatId=cs.CharacterStatId AND [Type]=7) ,0 )
	,ISNULL((SELECT TOP 1 DefaultValue FROM  CharacterStatDefaultValues WHERE CharacterStatId=cs.CharacterStatId AND [Type]=1) ,NULL )
	,ISNULL((SELECT TOP 1 DefaultValue FROM  CharacterStatDefaultValues WHERE CharacterStatId=cs.CharacterStatId AND [Type]=2) ,NULL )
	,ISNULL((SELECT TOP 1 DefaultValue FROM  CharacterStatDefaultValues WHERE CharacterStatId=cs.CharacterStatId AND [Type]=8) ,NULL )
	,ISNULL((SELECT TOP 1 DefaultText FROM  [CharacterStatCombos] WHERE CharacterStatId=cs.CharacterStatId) ,NULL )
	,CASE
		WHEN cs.CharacterStatTypeId=6 THEN ISNULL((SELECT TOP 1 DefaultValue FROM  CharacterStatDefaultValues WHERE CharacterStatId=cs.CharacterStatId AND [Type]=14) ,0 )
		ELSE ISNULL((SELECT TOP 1 DefaultValue FROM  [CharacterStatCombos] WHERE CharacterStatId=cs.CharacterStatId) ,0 )
	END
	 
	FROM [dbo].[CharacterStats] cs WHERE (RuleSetId=@RulesetID OR RuleSetId=@ParentRulesetID) 
	AND (IsDeleted != 1 OR IsDeleted IS NULL) 
	AND CharacterStatId NOT IN (SELECT ParentCharacterStatId FROM [dbo].[CharacterStats] WHERE (RulesetID=@RulesetID AND ParentCharacterStatId IS NOT NULL))
END
ELSE
BEGIN
	INSERT INTO CharactersCharacterStats (CharacterId,CharacterStatId,CalculationResult,IsDeleted
	,Display,IsCustom,ShowCheckbox,YesNo,OnOff,Number,[Current],Maximum,[Value],SubValue,[Text],RichText,Command,ComboText,DefaultValue)
	SELECT @CharacterID,CharacterStatId,0,0
	,ISNULL((SELECT TOP 1 Display FROM  CharacterStatToggle WHERE CharacterStatId=cs.CharacterStatId),0 )
	,ISNULL((SELECT TOP 1 IsCustom FROM  CharacterStatToggle WHERE CharacterStatId=cs.CharacterStatId) ,0 )
	,ISNULL((SELECT TOP 1 ShowCheckbox FROM  CharacterStatToggle WHERE CharacterStatId=cs.CharacterStatId) ,0 )
	,ISNULL((SELECT TOP 1 YesNo FROM  CharacterStatToggle WHERE CharacterStatId=cs.CharacterStatId) ,0 )
	,ISNULL((SELECT TOP 1 OnOff FROM  CharacterStatToggle WHERE CharacterStatId=cs.CharacterStatId) ,0 )
	,ISNULL((SELECT TOP 1 DefaultValue FROM  CharacterStatDefaultValues WHERE CharacterStatId=cs.CharacterStatId AND [Type]=3) ,NULL )
	,ISNULL((SELECT TOP 1 DefaultValue FROM  CharacterStatDefaultValues WHERE CharacterStatId=cs.CharacterStatId AND [Type]=4) ,0 )
	,ISNULL((SELECT TOP 1 DefaultValue FROM  CharacterStatDefaultValues WHERE CharacterStatId=cs.CharacterStatId AND [Type]=5) ,0 )
	,ISNULL((SELECT TOP 1 DefaultValue FROM  CharacterStatDefaultValues WHERE CharacterStatId=cs.CharacterStatId AND [Type]=6) ,0 )
	,ISNULL((SELECT TOP 1 DefaultValue FROM  CharacterStatDefaultValues WHERE CharacterStatId=cs.CharacterStatId AND [Type]=7) ,0 )
	,ISNULL((SELECT TOP 1 DefaultValue FROM  CharacterStatDefaultValues WHERE CharacterStatId=cs.CharacterStatId AND [Type]=1) ,NULL )
	,ISNULL((SELECT TOP 1 DefaultValue FROM  CharacterStatDefaultValues WHERE CharacterStatId=cs.CharacterStatId AND [Type]=2) ,NULL )
	,ISNULL((SELECT TOP 1 DefaultValue FROM  CharacterStatDefaultValues WHERE CharacterStatId=cs.CharacterStatId AND [Type]=8) ,NULL )
	,ISNULL((SELECT TOP 1 DefaultText FROM  [CharacterStatCombos] WHERE CharacterStatId=cs.CharacterStatId) ,NULL )
	,CASE
		WHEN cs.CharacterStatTypeId=6 THEN ISNULL((SELECT TOP 1 DefaultValue FROM  CharacterStatDefaultValues WHERE CharacterStatId=cs.CharacterStatId AND [Type]=14) ,0 )
		ELSE ISNULL((SELECT TOP 1 DefaultValue FROM  [CharacterStatCombos] WHERE CharacterStatId=cs.CharacterStatId) ,0 )
	END
	 
	FROM [dbo].[CharacterStats] cs WHERE RuleSetId=@RulesetID AND (IsDeleted != 1 OR IsDeleted IS NULL)	
END
IF EXISTS(SELECT * FROM RulesetDashboardLayouts WHERE RuleSetId=@RulesetID AND (IsDeleted != 1 OR IsDeleted IS NULL))
BEGIN	
	------------------Layout-------------------------
	INSERT INTO @TempLayoutTbl 
	SELECT [RulesetDashboardLayoutId],[RulesetId],[Name],[IsDefaultLayout],[DefaultPageId],[LayoutHeight] ,[LayoutWidth],[SortOrder],[IsDeleted], 
	[IsDefaultComputer],[IsDefaultTablet],[IsDefaultMobile]
	FROM RulesetDashboardLayouts 
	WHERE RuleSetId=@RulesetID AND (IsDeleted != 1 OR IsDeleted IS NULL) ORDER BY RulesetDashboardLayoutId

	SELECT @TotalLayoutCount=Count(*) FROM @TempLayoutTbl
	
	WHILE(@CurrentLayoutCount<=@TotalLayoutCount)
	BEGIN
		DECLARE @RulesetLayoutID INT
		SELECT @RulesetLayoutID=RulesetDashboardLayoutId FROM @TempLayoutTbl WHERE [RowNum]=@CurrentLayoutCount

		--SELECT 'LayoutLoop',@CurrentLayoutCount,@TotalLayoutCount,[Name],@RulesetLayoutID FROM @TempLayoutTbl WHERE [RowNum]=@CurrentLayoutCount

		INSERT INTO CharacterDashboardLayouts ([CharacterId],[Name],[DefaultPageId],[SortOrder],[IsDeleted],[LayoutHeight],[LayoutWidth],[IsDefaultLayout],[IsDefaultComputer],[IsDefaultTablet],[IsDefaultMobile])
		SELECT @CharacterID,[Name],[DefaultPageId],[SortOrder],0,[LayoutHeight],[LayoutWidth],[IsDefaultLayout],[IsDefaultComputer],[IsDefaultTablet],[IsDefaultMobile] FROM @TempLayoutTbl WHERE [RowNum]=@CurrentLayoutCount
		
		SET @NewLayoutID=@@IDENTITY
		SET @IsDefaultLayout=0

		------------------Page-------------------------
		DELETE FROM @TempPageTbl
		--SET @TotalPageCount=0
		--SET @CurrentPageCount=1
		INSERT INTO @TempPageTbl 
		SELECT [RulesetDashboardPageId], RulesetDashboardLayoutId,[RulesetId],[Name],[SortOrder],[IsDeleted],[ContainerHeight],[ContainerWidth],[TitleTextColor],
		[TitleBgColor],[BodyTextColor],[BodyBgColor] FROM RulesetDashboardPages 
		WHERE RuleSetId=@RulesetID AND RulesetDashboardLayoutId=@RulesetLayoutID AND (IsDeleted != 1 OR IsDeleted IS NULL) ORDER BY RulesetDashboardPageId

		SET @TotalPageCount=(@TotalPageCount+ (SELECT Count(*) FROM @TempPageTbl))

		WHILE(@CurrentPageCount<=@TotalPageCount)
		BEGIN
			DECLARE @RulesetDashboardPageId INT 
			SELECT  @RulesetDashboardPageId=RulesetDashboardPageId FROM @TempPageTbl WHERE [RowNum]=@CurrentPageCount

			--SELECT 'PageLoop',@CurrentPageCount,@TotalPageCount,[Name] FROM @TempPageTbl WHERE [RowNum]=@CurrentPageCount

			INSERT INTO CharacterDashboardPages ([CharacterDashboardLayoutId],[CharacterId],[Name],[SortOrder],[IsDeleted],[ContainerHeight],[ContainerWidth]
			,[TitleBgColor],[TitleTextColor],[BodyBgColor],[BodyTextColor])
			SELECT @NewLayoutID,@CharacterID,[Name],[SortOrder],[IsDeleted],[ContainerHeight],[ContainerWidth],[TitleBgColor]
			,[TitleTextColor],[BodyBgColor],[BodyTextColor] FROM @TempPageTbl WHERE [RowNum]=@CurrentPageCount
		
			SET @NewPageID=@@IDENTITY
			--IF(@CurrentPageCount=1)
			--BEGIN
				UPDATE CharacterDashboardLayouts SET [DefaultPageId]=@NewPageID WHERE CharacterDashboardLayoutId=@NewLayoutID 
				AND DefaultPageId=(SELECT RulesetDashboardPageId FROM @TempPageTbl WHERE [RowNum]=@CurrentPageCount)
			--END

			------------------Tiles-------------------------
			DELETE FROM @TempTileTbl
			--SET @TotalTilesCount=0
			--SET @CurrentTilesCount=1
			SET @TileType=0
			SET @RulesetTileID=0
			INSERT INTO @TempTileTbl 
			SELECT [RulesetTileId],[TileTypeId],[RulesetDashboardPageId],[RulesetId],[Shape],[LocationX],[LocationY],[Height],[Width],[SortOrder],[IsDeleted] FROM RulesetTiles 
			WHERE RuleSetId=@RulesetID AND RulesetDashboardPageId=@RulesetDashboardPageId AND (IsDeleted != 1 OR IsDeleted IS NULL) ORDER BY RulesetTileId

			DECLARE @TitleTextColor NVARCHAR(50)=NULL,@BodyTextColor NVARCHAR(50)=NULL,@TitleBgColor NVARCHAR(50),@BodyBgColor NVARCHAR(50)
			SET @TotalTilesCount=(@TotalTilesCount+ (SELECT Count(*) FROM @TempTileTbl))
			WHILE(@CurrentTilesCount<=@TotalTilesCount)
			BEGIN
				INSERT INTO CharacterTiles ([TileTypeId],[CharacterDashboardPageId],[CharacterId],[Shape],[LocationX],[LocationY],[Height],[Width]
				,[SortOrder],[IsDeleted])
				SELECT [TileTypeId],@NewPageID,@CharacterID,[Shape],[LocationX],[LocationY],[Height],[Width]
				,[SortOrder],[IsDeleted] FROM @TempTileTbl WHERE [RowNum]=@CurrentTilesCount
				SET @NewTileID=@@IDENTITY

				SELECT @TileType=[TileTypeId],@RulesetTileID=RulesetTileId FROM @TempTileTbl WHERE [RowNum]=@CurrentTilesCount
				IF (@TileType=1) --//NoteTile
				BEGIN
					INSERT INTO CharacterNoteTiles ([CharacterTileId],[Title],[Content],[Shape],[SortOrder],[IsDeleted],[BodyBgColor],[BodyTextColor]
						,[TitleBgColor],[TitleTextColor])
					SELECT @NewTileID, [Title],[Content],[Shape],[SortOrder],[IsDeleted],[BodyBgColor],[BodyTextColor],[TitleBgColor],[TitleTextColor]
					FROM RulesetNoteTiles WHERE RulesetTileId=@RulesetTileID AND (IsDeleted != 1 OR IsDeleted IS NULL)

					--//SaveColor
				

					SELECT @TitleTextColor=[TitleTextColor],@BodyTextColor=[BodyTextColor],	@TitleBgColor=TitleBgColor,@BodyBgColor=BodyBgColor
					FROM RulesetNoteTiles WHERE RulesetTileId=@RulesetTileID AND (IsDeleted != 1 OR IsDeleted IS NULL)

					IF ((@TitleTextColor IS NOT NULL) AND (@BodyTextColor IS NOT NULL))
					BEGIN
						IF EXISTS (SELECT * FROM TileColors WHERE [CreatedBy]=@UserId AND [BodyTextColor]=@BodyTextColor AND [TitleTextColor]=@TitleTextColor)
						BEGIN
							DELETE FROM TileColors WHERE [CreatedBy]=@UserId AND [BodyTextColor]=@BodyTextColor AND [TitleTextColor]=@TitleTextColor
						END
						INSERT INTO TileColors ([CharacterTileId],[CreatedBy],[CreatedDate],[TitleTextColor],[TitleBgColor],[BodyTextColor],[BodyBgColor],
						[IsDeleted])
						VALUES(@NewTileID,@UserId,GETDATE(),@TitleTextColor,@TitleBgColor ,@BodyTextColor,@BodyBgColor,   0)
					END
					--//SaveColor END
				
				END
				IF (@TileType=2) --//ImageTile
				BEGIN
					INSERT INTO CharacterImageTiles ([CharacterTileId],[Title],[ImageUrl],[Shape],[SortOrder],[IsDeleted],[BodyBgColor],[BodyTextColor]
					,[TitleBgColor],[TitleTextColor])
					SELECT @NewTileID, [Title],[ImageUrl],[Shape],[SortOrder],[IsDeleted],[BodyBgColor],[BodyTextColor],[TitleBgColor],[TitleTextColor]
					FROM RulesetImageTiles WHERE RulesetTileId=@RulesetTileID AND (IsDeleted != 1 OR IsDeleted IS NULL)

					--//SaveColor

					SELECT @TitleTextColor=[TitleTextColor],@BodyTextColor=[BodyTextColor],	@TitleBgColor=TitleBgColor,@BodyBgColor=BodyBgColor
					FROM RulesetImageTiles WHERE RulesetTileId=@RulesetTileID AND (IsDeleted != 1 OR IsDeleted IS NULL)

					IF ((@TitleTextColor IS NOT NULL) AND (@BodyTextColor IS NOT NULL))
					BEGIN
						IF EXISTS (SELECT * FROM TileColors WHERE [CreatedBy]=@UserId AND [BodyTextColor]=@BodyTextColor AND [TitleTextColor]=@TitleTextColor)
						BEGIN
							DELETE FROM TileColors WHERE [CreatedBy]=@UserId AND [BodyTextColor]=@BodyTextColor AND [TitleTextColor]=@TitleTextColor
						END
						INSERT INTO TileColors ([CharacterTileId],[CreatedBy],[CreatedDate],[TitleTextColor],[TitleBgColor],[BodyTextColor],[BodyBgColor],
						[IsDeleted])
						VALUES(@NewTileID,@UserId,GETDATE(),@TitleTextColor,@TitleBgColor ,@BodyTextColor,@BodyBgColor,   0)
					END
					--//SaveColor END
				END
				IF (@TileType=3) --//CounterTile
				BEGIN
					INSERT INTO CharacterCounterTiles ([CharacterTileId],[Title],[DefaultValue],[Maximum],[Minimum],[Step],[Shape],[SortOrder],[IsDeleted]
					,[BodyBgColor],[BodyTextColor],[TitleBgColor],[TitleTextColor],[CurrentValue])
					SELECT @NewTileID, [Title],[DefaultValue],[Maximum],[Minimum],[Step],[Shape],[SortOrder],[IsDeleted],
					[BodyBgColor],[BodyTextColor],[TitleBgColor],[TitleTextColor],[CurrentValue]
					FROM RulesetCounterTiles WHERE RulesetTileId=@RulesetTileID AND (IsDeleted != 1 OR IsDeleted IS NULL)

					--//SaveColor

					SELECT @TitleTextColor=[TitleTextColor],@BodyTextColor=[BodyTextColor],	@TitleBgColor=TitleBgColor,@BodyBgColor=BodyBgColor
					FROM RulesetCounterTiles WHERE RulesetTileId=@RulesetTileID AND (IsDeleted != 1 OR IsDeleted IS NULL)

					IF ((@TitleTextColor IS NOT NULL) AND (@BodyTextColor IS NOT NULL))
					BEGIN
						IF EXISTS (SELECT * FROM TileColors WHERE [CreatedBy]=@UserId AND [BodyTextColor]=@BodyTextColor AND [TitleTextColor]=@TitleTextColor)
						BEGIN
							DELETE FROM TileColors WHERE [CreatedBy]=@UserId AND [BodyTextColor]=@BodyTextColor AND [TitleTextColor]=@TitleTextColor
						END
						INSERT INTO TileColors ([CharacterTileId],[CreatedBy],[CreatedDate],[TitleTextColor],[TitleBgColor],[BodyTextColor],[BodyBgColor],
						[IsDeleted])
						VALUES(@NewTileID,@UserId,GETDATE(),@TitleTextColor,@TitleBgColor ,@BodyTextColor,@BodyBgColor,   0)
					END
					--//SaveColor END
				END
				IF (@TileType=4) --//CharacterStataTile
				BEGIN
					DECLARE @CharactersCharacterStatId INT,@CStatID INT

					SELECT @CStatID=CharacterStatId	FROM RulesetCharacterStatTiles WHERE RulesetTileId=@RulesetTileID AND (IsDeleted != 1 OR IsDeleted IS NULL)

					SELECT @CharactersCharacterStatId=CharactersCharacterStatId
					FROM CharactersCharacterStats WHERE CharacterId=@CharacterID AND CharacterStatId=@CStatID AND (IsDeleted != 1 OR IsDeleted IS NULL)

					INSERT INTO CharacterCharacterStatTiles ([CharacterTileId],[CharactersCharacterStatId],[ShowTitle],[Shape],[SortOrder],[IsDeleted]
					,[bodyBgColor],[bodyTextColor],[titleBgColor],[titleTextColor],[imageUrl])
					SELECT @NewTileID, @CharactersCharacterStatId,[ShowTitle],[Shape],[SortOrder],[IsDeleted]
					,[bodyBgColor],[bodyTextColor],[titleBgColor],[titleTextColor],[imageUrl]
					FROM RulesetCharacterStatTiles WHERE RulesetTileId=@RulesetTileID AND (IsDeleted != 1 OR IsDeleted IS NULL)

					--//SaveColor

					SELECT @TitleTextColor=[TitleTextColor],@BodyTextColor=[BodyTextColor],	@TitleBgColor=TitleBgColor,@BodyBgColor=BodyBgColor
					FROM RulesetCharacterStatTiles WHERE RulesetTileId=@RulesetTileID AND (IsDeleted != 1 OR IsDeleted IS NULL)

					IF ((@TitleTextColor IS NOT NULL) AND (@BodyTextColor IS NOT NULL))
					BEGIN
						IF EXISTS (SELECT * FROM TileColors WHERE [CreatedBy]=@UserId AND [BodyTextColor]=@BodyTextColor AND [TitleTextColor]=@TitleTextColor)
						BEGIN
							DELETE FROM TileColors WHERE [CreatedBy]=@UserId AND [BodyTextColor]=@BodyTextColor AND [TitleTextColor]=@TitleTextColor
						END
						INSERT INTO TileColors ([CharacterTileId],[CreatedBy],[CreatedDate],[TitleTextColor],[TitleBgColor],[BodyTextColor],[BodyBgColor],
						[IsDeleted])
						VALUES(@NewTileID,@UserId,GETDATE(),@TitleTextColor,@TitleBgColor ,@BodyTextColor,@BodyBgColor,   0)
					END
				END
				IF (@TileType=7) --//CommandTile
				BEGIN
					INSERT INTO CharacterCommandTiles ([CharacterTileId],[Title],[Command],[ImageUrl],[Shape],[SortOrder],[IsDeleted],[BodyBgColor]
					,[BodyTextColor],[TitleBgColor],[TitleTextColor])
					SELECT @NewTileID, [Title],[Command],[ImageUrl],[Shape],[SortOrder],[IsDeleted],[BodyBgColor],
					[BodyTextColor],[TitleBgColor],[TitleTextColor]
					FROM RulesetCommandTiles WHERE RulesetTileId=@RulesetTileID AND (IsDeleted != 1 OR IsDeleted IS NULL)

					--//SaveColor

					SELECT @TitleTextColor=[TitleTextColor],@BodyTextColor=[BodyTextColor],	@TitleBgColor=TitleBgColor,@BodyBgColor=BodyBgColor
					FROM RulesetCommandTiles WHERE RulesetTileId=@RulesetTileID AND (IsDeleted != 1 OR IsDeleted IS NULL)

					IF ((@TitleTextColor IS NOT NULL) AND (@BodyTextColor IS NOT NULL))
					BEGIN
						IF EXISTS (SELECT * FROM TileColors WHERE [CreatedBy]=@UserId AND [BodyTextColor]=@BodyTextColor AND [TitleTextColor]=@TitleTextColor)
						BEGIN
							DELETE FROM TileColors WHERE [CreatedBy]=@UserId AND [BodyTextColor]=@BodyTextColor AND [TitleTextColor]=@TitleTextColor
						END
						INSERT INTO TileColors ([CharacterTileId],[CreatedBy],[CreatedDate],[TitleTextColor],[TitleBgColor],[BodyTextColor],[BodyBgColor],
						[IsDeleted])
						VALUES(@NewTileID,@UserId,GETDATE(),@TitleTextColor,@TitleBgColor ,@BodyTextColor,@BodyBgColor,   0)
					END
				END
				IF (@TileType=8) --//ImageTile
				BEGIN
					INSERT INTO CharacterTextTiles ([CharacterTileId],[Title],[Text],[Shape],[SortOrder],[IsDeleted],[BodyBgColor],[BodyTextColor]
					,[TitleBgColor],[TitleTextColor])
					SELECT @NewTileID, [Title],[Text],[Shape],[SortOrder],[IsDeleted],[BodyBgColor],[BodyTextColor],[TitleBgColor],[TitleTextColor]
					FROM RulesetTextTiles WHERE RulesetTileId=@RulesetTileID AND (IsDeleted != 1 OR IsDeleted IS NULL)

					--//SaveColor

					SELECT @TitleTextColor=[TitleTextColor],@BodyTextColor=[BodyTextColor],	@TitleBgColor=TitleBgColor,@BodyBgColor=BodyBgColor
					FROM RulesetTextTiles WHERE RulesetTileId=@RulesetTileID AND (IsDeleted != 1 OR IsDeleted IS NULL)

					IF ((@TitleTextColor IS NOT NULL) AND (@BodyTextColor IS NOT NULL))
					BEGIN
						IF EXISTS (SELECT * FROM TileColors WHERE [CreatedBy]=@UserId AND [BodyTextColor]=@BodyTextColor AND [TitleTextColor]=@TitleTextColor)
						BEGIN
							DELETE FROM TileColors WHERE [CreatedBy]=@UserId AND [BodyTextColor]=@BodyTextColor AND [TitleTextColor]=@TitleTextColor
						END
						INSERT INTO TileColors ([CharacterTileId],[CreatedBy],[CreatedDate],[TitleTextColor],[TitleBgColor],[BodyTextColor],[BodyBgColor],
						[IsDeleted])
						VALUES(@NewTileID,@UserId,GETDATE(),@TitleTextColor,@TitleBgColor ,@BodyTextColor,@BodyBgColor,   0)
					END
					--//SaveColor END
				END

				INSERT INTO TileConfig([CharacterTileId],[SortOrder],[UniqueId],[Payload],[Col],[Row],[SizeX],[SizeY],[IsDeleted])
				SELECT @NewTileID,[SortOrder],[UniqueId],[Payload],[Col],[Row],[SizeX],[SizeY],0 FROM RulesetTileConfig WHERE RulesetTileId=@RulesetTileID AND (IsDeleted != 1 OR IsDeleted IS NULL)

				SET @CurrentTilesCount=@CurrentTilesCount+1
			END
			------------------Tiles END---------------------

			SET @CurrentPageCount=@CurrentPageCount+1
		END
		------------------Page END-------------------------

		SET @CurrentLayoutCount=@CurrentLayoutCount+1
	END
	------------------Layout END-------------------------
END
ELSE
BEGIN
INSERT INTO CharacterDashboardLayouts ([CharacterId],[Name],[DefaultPageId],[SortOrder],[IsDeleted],[LayoutHeight],[LayoutWidth],[IsDefaultLayout])
VALUES 
(@CharacterID,'Default',NULL,1,0,@LayoutHeight,@LayoutWidth,1)

SET @NewLayoutID=@@IDENTITY

INSERT INTO CharacterDashboardPages([CharacterDashboardLayoutId],[CharacterId],[Name],[SortOrder],[IsDeleted],[ContainerHeight],[ContainerWidth],[TitleBgColor]
,[TitleTextColor],[BodyBgColor],[BodyTextColor])
VALUES
(@NewLayoutID,@CharacterID,'Page1',1,0,@LayoutHeight,@LayoutWidth,'#FFFFFF','#000000','#FFFFFF','#000000')

SET @NewPageID=@@IDENTITY

UPDATE CharacterDashboardLayouts SET [DefaultPageId]=@NewPageID WHERE CharacterDashboardLayoutId=@NewLayoutID
END
END
ELSE IF (@CharIdToDuplicate>0)
BEGIN
--Duplicate CharacterStats

	
	INSERT INTO CharactersCharacterStats (
[CharacterStatId],[CharacterId],[Text],[RichText],[Choice],[MultiChoice],[Command],[YesNo],[OnOff],[Value],[Number]
,[SubValue],[Current],[Maximum],[CalculationResult],[IsDeleted],[ComboText],[DefaultValue],[Minimum],[Display],[IsCustom]
,[ShowCheckbox],[IsOn],[IsYes],[LinkType]
)
	SELECT [CharacterStatId],@CharacterID,[Text],[RichText],[Choice],[MultiChoice],[Command],[YesNo],[OnOff],[Value],[Number]
,[SubValue],[Current],[Maximum],[CalculationResult],[IsDeleted],[ComboText],[DefaultValue],[Minimum],[Display],[IsCustom]
,[ShowCheckbox],[IsOn],[IsYes],[LinkType]
	 
	FROM [dbo].CharactersCharacterStats cs WHERE (characterID=@CharIdToDuplicate ) 
	AND (IsDeleted != 1 OR IsDeleted IS NULL) 

DECLARE @Temp_NewInsertedIds table (New_ID int)
DECLARE @Temp_NewInsertedIds_Mapping table (New_ID int, [rowNum] int)
DECLARE @Temp_Map_OldNew_Records table ([NewID] int, [OldID] int)

--Duplicate Items
DECLARE @TempItemTable_Insert AS Table(
	[RowNum] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](255) NOT NULL,
	[Description] [nvarchar](max) NULL,
	[ItemImage] [nvarchar](2048) NULL,
	[CharacterId] [int] NOT NULL,
	[ItemMasterId] [int] NOT NULL,
	[Quantity] [decimal](18, 3) NOT NULL,
	[TotalWeight] [decimal](18, 3) NOT NULL,
	[IsIdentified] [bit] NULL,
	[IsVisible] [bit] NULL,
	[IsEquipped] [bit] NULL,
	[ParentItemId] [int] NULL,
	[IsDeleted] [bit] NULL,
	[ContainedIn] [int] NULL,
	[IsConsumable] [bit] NOT NULL,
	[IsContainer] [bit] NOT NULL,
	[IsMagical] [bit] NOT NULL,
	[ItemCalculation] [nvarchar](1024) NULL,
	[Metatags] [nvarchar](max) NULL,
	[Rarity] [nvarchar](20) NULL,
	[Value] [decimal](18, 3) NOT NULL,
	[Volume] [decimal](18, 3) NOT NULL,
	[Weight] [decimal](18, 3) NOT NULL,
	[Command] [nvarchar](max) NULL,
	[ContainerVolumeMax] [decimal](18, 8) NOT NULL,
	[ContainerWeightMax] [decimal](18, 3) NOT NULL,
	[ContainerWeightModifier] [varchar](50) NULL,
	[ItemStats] [nvarchar](max) NULL,
	[PercentReduced] [decimal](18, 3) NOT NULL,
	[TotalWeightWithContents] [decimal](18, 3) NOT NULL,
	[CommandName] [nvarchar](100) NULL,
	[OldItemId] [int] NULL
)

INSERT INTO @TempItemTable_Insert ([OldItemId],[Name],[Description],[ItemImage],[CharacterId],[ItemMasterId],[Quantity],[TotalWeight],[IsIdentified]
,[IsVisible],[IsEquipped],[ParentItemId],[IsDeleted],[ContainedIn],[IsConsumable],[IsContainer],[IsMagical],[ItemCalculation],
[Metatags],[Rarity],[Value],[Volume],[Weight],[Command],[ContainerVolumeMax] ,[ContainerWeightMax],[ContainerWeightModifier],
[ItemStats],[PercentReduced],[TotalWeightWithContents],[CommandName])
SELECT distinct [ItemID],[Name],[Description],[ItemImage],@CharacterID,[ItemMasterId],[Quantity],[TotalWeight],[IsIdentified],
[IsVisible],[IsEquipped],[ParentItemId],[IsDeleted],[ContainedIn],[IsConsumable],[IsContainer],[IsMagical],[ItemCalculation],
[Metatags],[Rarity],[Value],[Volume],[Weight],[Command],[ContainerVolumeMax],[ContainerWeightMax],[ContainerWeightModifier],
[ItemStats],[PercentReduced],[TotalWeightWithContents],[CommandName] from Items Where [CharacterId]=@CharIdToDuplicate AND (IsDeleted != 1 OR IsDeleted IS NULL) 
ORDER BY ItemId

DELETE FROM @Temp_NewInsertedIds
DELETE FROM @Temp_NewInsertedIds_Mapping

INSERT INTO Items ([Name],[Description],[ItemImage],[CharacterId],[ItemMasterId],[Quantity],[TotalWeight],[IsIdentified],[IsVisible]
,[IsEquipped],[ParentItemId],[IsDeleted],[ContainedIn],[IsConsumable],[IsContainer],[IsMagical],[ItemCalculation],[Metatags]
,[Rarity],[Value],[Volume],[Weight],[Command],[ContainerVolumeMax],[ContainerWeightMax],[ContainerWeightModifier],[ItemStats]
,[PercentReduced],[TotalWeightWithContents],[CommandName]) OUTPUT Inserted.ItemId into @Temp_NewInsertedIds (New_ID) 
SELECT [Name],[Description],[ItemImage],@CharacterID,[ItemMasterId],[Quantity],[TotalWeight],[IsIdentified],[IsVisible]
,[IsEquipped],[ParentItemId],[IsDeleted],[ContainedIn],[IsConsumable],[IsContainer],[IsMagical],[ItemCalculation],[Metatags]
,[Rarity],[Value],[Volume],[Weight],[Command],[ContainerVolumeMax],[ContainerWeightMax],[ContainerWeightModifier],[ItemStats]
,[PercentReduced],[TotalWeightWithContents],[CommandName] from @TempItemTable_Insert Order BY RowNum

INSERT INTO @Temp_NewInsertedIds_Mapping	select  New_ID,ROW_NUMBER() OVER(order by New_ID) as rowNum from @Temp_NewInsertedIds 

Declare @Item_Spells AS TABLE ([ItemId] INT, [SpellId] INT)
Declare @Item_Abilities AS TABLE ([ItemId] INT, [AbilityId] INT)
Declare @Item_NewOldIds [Type_NewOldID]

INSERT INTO @Item_NewOldIds
SELECT a.New_ID,b.OldItemId
FROM @Temp_NewInsertedIds_Mapping a 
LEFT join  @TempItemTable_Insert b on a.rowNum = b.rowNum


INSERT INTO ItemSpells ([ItemId],[SpellId])
SELECT distinct a.New_ID,c.[SpellId]
FROM @Temp_NewInsertedIds_Mapping a 
LEFT join  @TempItemTable_Insert b on a.rowNum = b.rowNum
left join   [ItemSpells] c on b.[OldItemId] = c.[ItemId] 
where c.[ItemId] is not null AND (c.IsDeleted !=1 OR c.IsDeleted is null)  


INSERT INTO ItemAbilities ([ItemId],[AbilityId])
SELECT distinct a.New_ID,c.[AbilityId]
FROM @Temp_NewInsertedIds_Mapping a 
left join  @TempItemTable_Insert b on a.rowNum = b.rowNum
left join  [ItemAbilities] c on b.[OldItemId] = c.[ItemId] 
where c.[ItemId] is not null AND (c.IsDeleted !=1 OR c.IsDeleted is null) 


INSERT INTO [ItemCommands] ([ItemId],[Command],[Name])
SELECT   a.New_ID,c.Command,c.[Name]
FROM @Temp_NewInsertedIds_Mapping a 
left join  @TempItemTable_Insert b on a.rowNum = b.rowNum
left join  [ItemCommands] c on b.[OldItemId] = c.[ItemId]  
where c.[ItemId]  is not null AND (c.IsDeleted !=1 OR c.IsDeleted is null) 


--Duplicate Spells
DECLARE @TempCharSpellTable_Insert AS Table(
	[RowNum] [int] IDENTITY(1,1) NOT NULL,
	[CharacterId] [int] NOT NULL,
	[IsMemorized] [bit] NOT NULL,
	[SpellId] [int] NOT NULL,
	[OldCharacterSpellId] [int] NULL
)

INSERT INTO @TempCharSpellTable_Insert ([OldCharacterSpellId],[CharacterId],[IsMemorized],[SpellId])
SELECT distinct [CharacterSpellId], [CharacterId],[IsMemorized],[SpellId] from CharacterSpells Where [CharacterId]=@CharIdToDuplicate AND (IsDeleted != 1 OR IsDeleted IS NULL) 
ORDER BY [CharacterSpellId]

DELETE FROM @Temp_NewInsertedIds
DELETE FROM @Temp_NewInsertedIds_Mapping

INSERT INTO CharacterSpells ([CharacterId],[IsMemorized],[SpellId]) OUTPUT Inserted.[CharacterSpellId] into @Temp_NewInsertedIds (New_ID) 
SELECT @CharacterID,[IsMemorized],[SpellId] from @TempCharSpellTable_Insert Order BY RowNum

INSERT INTO @Temp_NewInsertedIds_Mapping	select  New_ID,ROW_NUMBER() OVER(order by New_ID) as rowNum from @Temp_NewInsertedIds 


Declare @CharSpell_NewOldIds [Type_NewOldID]

INSERT INTO @CharSpell_NewOldIds
SELECT a.New_ID,b.[OldCharacterSpellId]
FROM @Temp_NewInsertedIds_Mapping a 
LEFT join  @TempCharSpellTable_Insert b on a.rowNum = b.rowNum

--INSERT INTO characterSpells (CharacterID,IsMemorized,SpellID) 
--SELECT @CharacterID,IsMemorized,SpellID From characterSpells Where [CharacterId]=@CharIdToDuplicate AND (IsDeleted != 1 OR IsDeleted IS NULL)



--Duplicate Abilities
DECLARE @TempCharAbilityTable_Insert AS Table(
	[RowNum] [int] IDENTITY(1,1) NOT NULL,
	[CharacterId] [int] NOT NULL,
	[IsEnabled] [bit] NOT NULL,
	[AbilityId] [int] NOT NULL,
	[CurrentNumberOfUses] [int] NULL,	
	[MaxNumberOfUses] [int] NULL,
	[OldCharacterAbilityId] [int] NULL
)

INSERT INTO @TempCharAbilityTable_Insert ([OldCharacterAbilityId],[CharacterId],[IsEnabled],[AbilityId],[CurrentNumberOfUses],[MaxNumberOfUses])
SELECT distinct [CharacterAbilityId], [CharacterId],[IsEnabled],[AbilityId],[CurrentNumberOfUses],[MaxNumberOfUses] 
from characterAbilities Where [CharacterId]=@CharIdToDuplicate AND (IsDeleted != 1 OR IsDeleted IS NULL) 
ORDER BY [CharacterAbilityId]

DELETE FROM @Temp_NewInsertedIds
DELETE FROM @Temp_NewInsertedIds_Mapping

INSERT INTO characterAbilities ([CharacterId],[IsEnabled],[AbilityId],[CurrentNumberOfUses],[MaxNumberOfUses])
 OUTPUT Inserted.[CharacterAbilityId] into @Temp_NewInsertedIds (New_ID) 
SELECT @CharacterID,[IsEnabled],[AbilityId],[CurrentNumberOfUses],[MaxNumberOfUses] from @TempCharAbilityTable_Insert 
Order BY RowNum

INSERT INTO @Temp_NewInsertedIds_Mapping	select  New_ID,ROW_NUMBER() OVER(order by New_ID) as rowNum from @Temp_NewInsertedIds 


Declare @CharAbility_NewOldIds [Type_NewOldID]

INSERT INTO @CharAbility_NewOldIds
SELECT a.New_ID,b.[OldCharacterAbilityId]
FROM @Temp_NewInsertedIds_Mapping a 
LEFT join  @TempCharAbilityTable_Insert b on a.rowNum = b.rowNum

--INSERT INTO characterAbilities (CharacterID,IsEnabled,AbilityID,CurrentNumberOfUses,MaxNumberOfUses) 
--SELECT @CharacterID,IsEnabled,AbilityID,CurrentNumberOfUses,MaxNumberOfUses From characterAbilities 
--Where [CharacterId]=@CharIdToDuplicate AND (IsDeleted != 1 OR IsDeleted IS NULL)

--Duplicate Tiles
IF EXISTS(SELECT * FROM CharacterDashboardLayouts WHERE CharacterID=@CharIdToDuplicate AND (IsDeleted != 1 OR IsDeleted IS NULL))
BEGIN	
	------------------Layout-------------------------
	INSERT INTO @TempLayoutTbl 
	SELECT [CharacterDashboardLayoutId],CharacterID,[Name],[IsDefaultLayout],[DefaultPageId],[LayoutHeight] ,[LayoutWidth],[SortOrder],[IsDeleted], 
	[IsDefaultComputer],[IsDefaultTablet],[IsDefaultMobile]
	FROM CharacterDashboardLayouts 
	WHERE CharacterID=@CharIdToDuplicate AND (IsDeleted != 1 OR IsDeleted IS NULL) ORDER BY [CharacterDashboardLayoutId]

	SELECT @TotalLayoutCount=Count(*) FROM @TempLayoutTbl
	
	WHILE(@CurrentLayoutCount<=@TotalLayoutCount)
	BEGIN
		DECLARE @CharacterLayoutID INT
		SELECT @CharacterLayoutID=RulesetDashboardLayoutId FROM @TempLayoutTbl WHERE [RowNum]=@CurrentLayoutCount

		--SELECT 'LayoutLoop',@CurrentLayoutCount,@TotalLayoutCount,[Name],@CharacterLayoutID FROM @TempLayoutTbl WHERE [RowNum]=@CurrentLayoutCount

		INSERT INTO CharacterDashboardLayouts ([CharacterId],[Name],[DefaultPageId],[SortOrder],[IsDeleted],[LayoutHeight],[LayoutWidth],[IsDefaultLayout],[IsDefaultComputer],[IsDefaultTablet],[IsDefaultMobile])
		SELECT @CharacterID,[Name],[DefaultPageId],[SortOrder],0,[LayoutHeight],[LayoutWidth],[IsDefaultLayout],[IsDefaultComputer],[IsDefaultTablet],[IsDefaultMobile] FROM @TempLayoutTbl WHERE [RowNum]=@CurrentLayoutCount
		
		SET @NewLayoutID=@@IDENTITY
		SET @IsDefaultLayout=0

		------------------Page-------------------------
		DELETE FROM @TempPageTbl
		--SET @TotalPageCount=0
		--SET @CurrentPageCount=1
		INSERT INTO @TempPageTbl 
		SELECT [CharacterDashboardPageId], CharacterDashboardLayoutId,[CharacterId],[Name],[SortOrder],[IsDeleted],[ContainerHeight],[ContainerWidth],[TitleTextColor],
		[TitleBgColor],[BodyTextColor],[BodyBgColor] FROM CharacterDashboardPages 
		WHERE [CharacterId]=@CharIdToDuplicate AND CharacterDashboardLayoutId=@CharacterLayoutID AND (IsDeleted != 1 OR IsDeleted IS NULL) ORDER BY [CharacterDashboardPageId]

		SET @TotalPageCount=(@TotalPageCount+ (SELECT Count(*) FROM @TempPageTbl))

		WHILE(@CurrentPageCount<=@TotalPageCount)
		BEGIN
			DECLARE @CharacterDashboardPageId INT 
			SELECT  @CharacterDashboardPageId=RulesetDashboardPageId FROM @TempPageTbl WHERE [RowNum]=@CurrentPageCount

			--SELECT 'PageLoop',@CurrentPageCount,@TotalPageCount,[Name] FROM @TempPageTbl WHERE [RowNum]=@CurrentPageCount

			INSERT INTO CharacterDashboardPages ([CharacterDashboardLayoutId],[CharacterId],[Name],[SortOrder],[IsDeleted],[ContainerHeight],[ContainerWidth]
			,[TitleBgColor],[TitleTextColor],[BodyBgColor],[BodyTextColor])
			SELECT @NewLayoutID,@CharacterID,[Name],[SortOrder],[IsDeleted],[ContainerHeight],[ContainerWidth],[TitleBgColor]
			,[TitleTextColor],[BodyBgColor],[BodyTextColor] FROM @TempPageTbl WHERE [RowNum]=@CurrentPageCount
		
			SET @NewPageID=@@IDENTITY
			--IF(@CurrentPageCount=1)
			--BEGIN
				UPDATE CharacterDashboardLayouts SET [DefaultPageId]=@NewPageID WHERE CharacterDashboardLayoutId=@NewLayoutID 
				AND DefaultPageId=(SELECT RulesetDashboardPageId FROM @TempPageTbl WHERE [RowNum]=@CurrentPageCount)
			--END

			------------------Tiles-------------------------
			DELETE FROM @TempTileTbl
			--SET @TotalTilesCount=0
			--SET @CurrentTilesCount=1
			SET @TileType=0
			SET @CharacterTileID=0
			INSERT INTO @TempTileTbl 
			SELECT [CharacterTileID],[TileTypeId],[CharacterDashboardPageId],[CharacterId],[Shape],[LocationX],[LocationY],[Height],[Width],[SortOrder],[IsDeleted] FROM CharacterTiles 
			WHERE CharacterId=@CharIdToDuplicate AND CharacterDashboardPageId=@CharacterDashboardPageId AND (IsDeleted != 1 OR IsDeleted IS NULL) ORDER BY CharacterTileId

			DECLARE @CharTitleTextColor NVARCHAR(50)=NULL,@CharBodyTextColor NVARCHAR(50)=NULL,@CharTitleBgColor NVARCHAR(50),@CharBodyBgColor NVARCHAR(50)
			SET @TotalTilesCount=(@TotalTilesCount+ (SELECT Count(*) FROM @TempTileTbl))
			WHILE(@CurrentTilesCount<=@TotalTilesCount)
			BEGIN
				INSERT INTO CharacterTiles ([TileTypeId],[CharacterDashboardPageId],[CharacterId],[Shape],[LocationX],[LocationY],[Height],[Width]
				,[SortOrder],[IsDeleted])
				SELECT [TileTypeId],@NewPageID,@CharacterID,[Shape],[LocationX],[LocationY],[Height],[Width]
				,[SortOrder],[IsDeleted] FROM @TempTileTbl WHERE [RowNum]=@CurrentTilesCount
				SET @NewTileID=@@IDENTITY

				SELECT @TileType=[TileTypeId],@CharacterTileID=RulesetTileId FROM @TempTileTbl WHERE [RowNum]=@CurrentTilesCount
				IF (@TileType=1) --//NoteTile
				BEGIN
					INSERT INTO CharacterNoteTiles ([CharacterTileId],[Title],[Content],[Shape],[SortOrder],[IsDeleted],[BodyBgColor],[BodyTextColor]
						,[TitleBgColor],[TitleTextColor])
					SELECT @NewTileID, [Title],[Content],[Shape],[SortOrder],[IsDeleted],[BodyBgColor],[BodyTextColor],[TitleBgColor],[TitleTextColor]
					FROM CharacterNoteTiles WHERE CharacterTileID=@CharacterTileID AND (IsDeleted != 1 OR IsDeleted IS NULL)

					--//SaveColor
				

					SELECT @CharTitleTextColor=[TitleTextColor],@CharBodyTextColor=[BodyTextColor],	@CharTitleBgColor=TitleBgColor,@CharBodyBgColor=BodyBgColor
					FROM CharacterNoteTiles WHERE CharacterTileID=@CharacterTileID AND (IsDeleted != 1 OR IsDeleted IS NULL)

					IF ((@CharTitleTextColor IS NOT NULL) AND (@CharBodyTextColor IS NOT NULL))
					BEGIN
						IF EXISTS (SELECT * FROM TileColors WHERE [CreatedBy]=@UserId AND [BodyTextColor]=@CharBodyTextColor AND [TitleTextColor]=@CharTitleTextColor)
						BEGIN
							DELETE FROM TileColors WHERE [CreatedBy]=@UserId AND [BodyTextColor]=@CharBodyTextColor AND [TitleTextColor]=@CharTitleTextColor
						END
						INSERT INTO TileColors ([CharacterTileId],[CreatedBy],[CreatedDate],[TitleTextColor],[TitleBgColor],[BodyTextColor],[BodyBgColor],
						[IsDeleted])
						VALUES(@NewTileID,@UserId,GETDATE(),@CharTitleTextColor,@CharTitleBgColor ,@CharBodyTextColor,@CharBodyBgColor,   0)
					END
					--//SaveColor END
				
				END
				IF (@TileType=2) --//ImageTile
				BEGIN
					INSERT INTO CharacterImageTiles ([CharacterTileId],[Title],[ImageUrl],[Shape],[SortOrder],[IsDeleted],[BodyBgColor],[BodyTextColor]
					,[TitleBgColor],[TitleTextColor])
					SELECT @NewTileID, [Title],[ImageUrl],[Shape],[SortOrder],[IsDeleted],[BodyBgColor],[BodyTextColor],[TitleBgColor],[TitleTextColor]
					FROM CharacterImageTiles WHERE CharacterTileId=@CharacterTileID AND (IsDeleted != 1 OR IsDeleted IS NULL)

					--//SaveColor

					SELECT @CharTitleTextColor=[TitleTextColor],@CharBodyTextColor=[BodyTextColor],	@CharTitleBgColor=TitleBgColor,@CharBodyBgColor=BodyBgColor
					FROM CharacterImageTiles WHERE CharacterTileId=@CharacterTileID AND (IsDeleted != 1 OR IsDeleted IS NULL)

					IF ((@CharTitleTextColor IS NOT NULL) AND (@CharBodyTextColor IS NOT NULL))
					BEGIN
						IF EXISTS (SELECT * FROM TileColors WHERE [CreatedBy]=@UserId AND [BodyTextColor]=@CharBodyTextColor AND [TitleTextColor]=@CharTitleTextColor)
						BEGIN
							DELETE FROM TileColors WHERE [CreatedBy]=@UserId AND [BodyTextColor]=@CharBodyTextColor AND [TitleTextColor]=@CharTitleTextColor
						END
						INSERT INTO TileColors ([CharacterTileId],[CreatedBy],[CreatedDate],[TitleTextColor],[TitleBgColor],[BodyTextColor],[BodyBgColor],
						[IsDeleted])
						VALUES(@NewTileID,@UserId,GETDATE(),@CharTitleTextColor,@CharTitleBgColor ,@CharBodyTextColor,@CharBodyBgColor,   0)
					END
					--//SaveColor END
				END
				IF (@TileType=3) --//CounterTile
				BEGIN
					INSERT INTO CharacterCounterTiles ([CharacterTileId],[Title],[DefaultValue],[Maximum],[Minimum],[Step],[Shape],[SortOrder],[IsDeleted]
					,[BodyBgColor],[BodyTextColor],[TitleBgColor],[TitleTextColor],[CurrentValue])
					SELECT @NewTileID, [Title],[DefaultValue],[Maximum],[Minimum],[Step],[Shape],[SortOrder],[IsDeleted],
					[BodyBgColor],[BodyTextColor],[TitleBgColor],[TitleTextColor],[CurrentValue]
					FROM CharacterCounterTiles WHERE CharacterTileId=@CharacterTileID AND (IsDeleted != 1 OR IsDeleted IS NULL)

					--//SaveColor

					SELECT @CharTitleTextColor=[TitleTextColor],@CharBodyTextColor=[BodyTextColor],	@CharTitleBgColor=TitleBgColor,@CharBodyBgColor=BodyBgColor
					FROM CharacterCounterTiles WHERE CharacterTileId=@CharacterTileID AND (IsDeleted != 1 OR IsDeleted IS NULL)

					IF ((@CharTitleTextColor IS NOT NULL) AND (@CharBodyTextColor IS NOT NULL))
					BEGIN
						IF EXISTS (SELECT * FROM TileColors WHERE [CreatedBy]=@UserId AND [BodyTextColor]=@CharBodyTextColor AND [TitleTextColor]=@CharTitleTextColor)
						BEGIN
							DELETE FROM TileColors WHERE [CreatedBy]=@UserId AND [BodyTextColor]=@CharBodyTextColor AND [TitleTextColor]=@CharTitleTextColor
						END
						INSERT INTO TileColors ([CharacterTileId],[CreatedBy],[CreatedDate],[TitleTextColor],[TitleBgColor],[BodyTextColor],[BodyBgColor],
						[IsDeleted])
						VALUES(@NewTileID,@UserId,GETDATE(),@CharTitleTextColor,@CharTitleBgColor ,@CharBodyTextColor,@CharBodyBgColor,   0)
					END
					--//SaveColor END
				END
				IF (@TileType=4) --//CharacterStataTile
				BEGIN
					DECLARE @CharCharactersCharacterStatId INT,@CharCStatID INT

					SELECT @CharCStatID=CharacterStatId FROM CharactersCharacterStats  WHERE CharactersCharacterStatId =(SELECT CharactersCharacterStatId	FROM CharacterCharacterStatTiles WHERE CharacterTileId=@CharacterTileID AND (IsDeleted != 1 OR IsDeleted IS NULL))

					--SELECT @CharCStatID=CharacterStatId	FROM CharacterCharacterStatTiles WHERE CharacterTileId=@CharacterTileID AND (IsDeleted != 1 OR IsDeleted IS NULL)

					SELECT @CharCharactersCharacterStatId=CharactersCharacterStatId
					FROM CharactersCharacterStats WHERE CharacterId=@CharacterID AND CharacterStatId=@CharCStatID AND (IsDeleted != 1 OR IsDeleted IS NULL)

					INSERT INTO CharacterCharacterStatTiles ([CharacterTileId],[CharactersCharacterStatId],[ShowTitle],[Shape],[SortOrder],[IsDeleted]
					,[bodyBgColor],[bodyTextColor],[titleBgColor],[titleTextColor],[imageUrl])
					SELECT @NewTileID, @CharCharactersCharacterStatId,[ShowTitle],[Shape],[SortOrder],[IsDeleted]
					,[bodyBgColor],[bodyTextColor],[titleBgColor],[titleTextColor],[imageUrl]
					FROM CharacterCharacterStatTiles WHERE CharacterTileId=@CharacterTileID AND (IsDeleted != 1 OR IsDeleted IS NULL)

					--//SaveColor

					SELECT @CharTitleTextColor=[TitleTextColor],@CharBodyTextColor=[BodyTextColor],	@CharTitleBgColor=TitleBgColor,@CharBodyBgColor=BodyBgColor
					FROM CharacterCharacterStatTiles WHERE CharacterTileId=@CharacterTileID AND (IsDeleted != 1 OR IsDeleted IS NULL)

					IF ((@CharTitleTextColor IS NOT NULL) AND (@CharBodyTextColor IS NOT NULL))
					BEGIN
						IF EXISTS (SELECT * FROM TileColors WHERE [CreatedBy]=@UserId AND [BodyTextColor]=@CharBodyTextColor AND [TitleTextColor]=@CharTitleTextColor)
						BEGIN
							DELETE FROM TileColors WHERE [CreatedBy]=@UserId AND [BodyTextColor]=@CharBodyTextColor AND [TitleTextColor]=@CharTitleTextColor
						END
						INSERT INTO TileColors ([CharacterTileId],[CreatedBy],[CreatedDate],[TitleTextColor],[TitleBgColor],[BodyTextColor],[BodyBgColor],
						[IsDeleted])
						VALUES(@NewTileID,@UserId,GETDATE(),@CharTitleTextColor,@CharTitleBgColor ,@CharBodyTextColor,@CharBodyBgColor,   0)
					END
				END
				IF (@TileType=7) --//CommandTile
				BEGIN
					INSERT INTO CharacterCommandTiles ([CharacterTileId],[Title],[Command],[ImageUrl],[Shape],[SortOrder],[IsDeleted],[BodyBgColor]
					,[BodyTextColor],[TitleBgColor],[TitleTextColor])
					SELECT @NewTileID, [Title],[Command],[ImageUrl],[Shape],[SortOrder],[IsDeleted],[BodyBgColor],
					[BodyTextColor],[TitleBgColor],[TitleTextColor]
					FROM CharacterCommandTiles WHERE CharacterTileId=@CharacterTileID AND (IsDeleted != 1 OR IsDeleted IS NULL)

					--//SaveColor

					SELECT @CharTitleTextColor=[TitleTextColor],@CharBodyTextColor=[BodyTextColor],	@CharTitleBgColor=TitleBgColor,@CharBodyBgColor=BodyBgColor
					FROM CharacterCommandTiles WHERE CharacterTileId=@CharacterTileID AND (IsDeleted != 1 OR IsDeleted IS NULL)

					IF ((@CharTitleTextColor IS NOT NULL) AND (@CharBodyTextColor IS NOT NULL))
					BEGIN
						IF EXISTS (SELECT * FROM TileColors WHERE [CreatedBy]=@UserId AND [BodyTextColor]=@CharBodyTextColor AND [TitleTextColor]=@CharTitleTextColor)
						BEGIN
							DELETE FROM TileColors WHERE [CreatedBy]=@UserId AND [BodyTextColor]=@CharBodyTextColor AND [TitleTextColor]=@CharTitleTextColor
						END
						INSERT INTO TileColors ([CharacterTileId],[CreatedBy],[CreatedDate],[TitleTextColor],[TitleBgColor],[BodyTextColor],[BodyBgColor],
						[IsDeleted])
						VALUES(@NewTileID,@UserId,GETDATE(),@CharTitleTextColor,@CharTitleBgColor ,@CharBodyTextColor,@CharBodyBgColor,   0)
					END
				END
				IF (@TileType=8) --//ImageTile
				BEGIN
					INSERT INTO CharacterTextTiles ([CharacterTileId],[Title],[Text],[Shape],[SortOrder],[IsDeleted],[BodyBgColor],[BodyTextColor]
					,[TitleBgColor],[TitleTextColor])
					SELECT @NewTileID, [Title],[Text],[Shape],[SortOrder],[IsDeleted],[BodyBgColor],[BodyTextColor],[TitleBgColor],[TitleTextColor]
					FROM CharacterTextTiles WHERE CharacterTileId=@CharacterTileID AND (IsDeleted != 1 OR IsDeleted IS NULL)

					--//SaveColor

					SELECT @CharTitleTextColor=[TitleTextColor],@CharBodyTextColor=[BodyTextColor],	@CharTitleBgColor=TitleBgColor,@CharBodyBgColor=BodyBgColor
					FROM CharacterTextTiles WHERE CharacterTileId=@CharacterTileID AND (IsDeleted != 1 OR IsDeleted IS NULL)

					IF ((@CharTitleTextColor IS NOT NULL) AND (@CharBodyTextColor IS NOT NULL))
					BEGIN
						IF EXISTS (SELECT * FROM TileColors WHERE [CreatedBy]=@UserId AND [BodyTextColor]=@CharBodyTextColor AND [TitleTextColor]=@CharTitleTextColor)
						BEGIN
							DELETE FROM TileColors WHERE [CreatedBy]=@UserId AND [BodyTextColor]=@CharBodyTextColor AND [TitleTextColor]=@CharTitleTextColor
						END
						INSERT INTO TileColors ([CharacterTileId],[CreatedBy],[CreatedDate],[TitleTextColor],[TitleBgColor],[BodyTextColor],[BodyBgColor],
						[IsDeleted])
						VALUES(@NewTileID,@UserId,GETDATE(),@CharTitleTextColor,@CharTitleBgColor ,@CharBodyTextColor,@CharBodyBgColor,   0)
					END
					--//SaveColor END
				END

				IF (@TileType=5) --//LinkTile
				BEGIN
					INSERT INTO CharacterLinkTiles ([CharacterTileId],[LinkType],[SpellId],[AbilityId],[ItemId],[ShowTitle]
					,[IsDeleted],[Shape],[SortOrder],[BodyBgColor],[BodyTextColor],[TitleBgColor],[TitleTextColor],[DisplayLinkImage])
					SELECT @NewTileID,[LinkType],
					dbo.GETLinkExecuteRecordID('Spell',[LinkType],[SpellId],@CharSpell_NewOldIds),
					dbo.GETLinkExecuteRecordID('Ability',[LinkType],[AbilityId],@CharAbility_NewOldIds),
					dbo.GETLinkExecuteRecordID('Item',[LinkType],[ItemId],@Item_NewOldIds),
					[ShowTitle]
					,[IsDeleted],[Shape],[SortOrder],[BodyBgColor],[BodyTextColor],[TitleBgColor],[TitleTextColor],[DisplayLinkImage]
					FROM CharacterLinkTiles WHERE CharacterTileId=@CharacterTileID AND (IsDeleted != 1 OR IsDeleted IS NULL)

					--//SaveColor

					SELECT @CharTitleTextColor=[TitleTextColor],@CharBodyTextColor=[BodyTextColor],	@CharTitleBgColor=TitleBgColor,@CharBodyBgColor=BodyBgColor
					FROM CharacterLinkTiles WHERE CharacterTileId=@CharacterTileID AND (IsDeleted != 1 OR IsDeleted IS NULL)

					IF ((@CharTitleTextColor IS NOT NULL) AND (@CharBodyTextColor IS NOT NULL))
					BEGIN
						IF EXISTS (SELECT * FROM TileColors WHERE [CreatedBy]=@UserId AND [BodyTextColor]=@CharBodyTextColor AND [TitleTextColor]=@CharTitleTextColor)
						BEGIN
							DELETE FROM TileColors WHERE [CreatedBy]=@UserId AND [BodyTextColor]=@CharBodyTextColor AND [TitleTextColor]=@CharTitleTextColor
						END
						INSERT INTO TileColors ([CharacterTileId],[CreatedBy],[CreatedDate],[TitleTextColor],[TitleBgColor],[BodyTextColor],[BodyBgColor],
						[IsDeleted])
						VALUES(@NewTileID,@UserId,GETDATE(),@CharTitleTextColor,@CharTitleBgColor ,@CharBodyTextColor,@CharBodyBgColor,   0)
					END
					--//SaveColor END
				END

				IF (@TileType=6) --//EXECUTETile
				BEGIN
					INSERT INTO CharacterExecuteTiles ([CharacterTileId],[LinkType],[SpellId],[AbilityId],[ItemId],[ShowTitle]
,[CommandId],[Shape],[SortOrder],[IsDeleted],[BodyBgColor],[BodyTextColor],[TitleBgColor],[TitleTextColor],[DisplayLinkImage])
					SELECT @NewTileID, [LinkType],
					dbo.GETLinkExecuteRecordID('Spell',[LinkType],[SpellId],@CharSpell_NewOldIds),
					dbo.GETLinkExecuteRecordID('Ability',[LinkType],[AbilityId],@CharAbility_NewOldIds),
					dbo.GETLinkExecuteRecordID('Item',[LinkType],[ItemId],@Item_NewOldIds),
					[ShowTitle]
,[CommandId],[Shape],[SortOrder],[IsDeleted],[BodyBgColor],[BodyTextColor],[TitleBgColor],[TitleTextColor],[DisplayLinkImage]
					FROM CharacterExecuteTiles WHERE CharacterTileId=@CharacterTileID AND (IsDeleted != 1 OR IsDeleted IS NULL)

					--//SaveColor

					SELECT @CharTitleTextColor=[TitleTextColor],@CharBodyTextColor=[BodyTextColor],	@CharTitleBgColor=TitleBgColor,@CharBodyBgColor=BodyBgColor
					FROM CharacterExecuteTiles WHERE CharacterTileId=@CharacterTileID AND (IsDeleted != 1 OR IsDeleted IS NULL)

					IF ((@CharTitleTextColor IS NOT NULL) AND (@CharBodyTextColor IS NOT NULL))
					BEGIN
						IF EXISTS (SELECT * FROM TileColors WHERE [CreatedBy]=@UserId AND [BodyTextColor]=@CharBodyTextColor AND [TitleTextColor]=@CharTitleTextColor)
						BEGIN
							DELETE FROM TileColors WHERE [CreatedBy]=@UserId AND [BodyTextColor]=@CharBodyTextColor AND [TitleTextColor]=@CharTitleTextColor
						END
						INSERT INTO TileColors ([CharacterTileId],[CreatedBy],[CreatedDate],[TitleTextColor],[TitleBgColor],[BodyTextColor],[BodyBgColor],
						[IsDeleted])
						VALUES(@NewTileID,@UserId,GETDATE(),@CharTitleTextColor,@CharTitleBgColor ,@CharBodyTextColor,@CharBodyBgColor,   0)
					END
					--//SaveColor END
				END


				INSERT INTO TileConfig([CharacterTileId],[SortOrder],[UniqueId],[Payload],[Col],[Row],[SizeX],[SizeY],[IsDeleted])
				SELECT @NewTileID,[SortOrder],[UniqueId],[Payload],[Col],[Row],[SizeX],[SizeY],0 FROM TileConfig WHERE CharacterTileId=@CharacterTileID AND (IsDeleted != 1 OR IsDeleted IS NULL)

				SET @CurrentTilesCount=@CurrentTilesCount+1
			END
			------------------Tiles END---------------------

			SET @CurrentPageCount=@CurrentPageCount+1
		END
		------------------Page END-------------------------

		SET @CurrentLayoutCount=@CurrentLayoutCount+1
	END
	------------------Layout END-------------------------
END
ELSE
BEGIN
INSERT INTO CharacterDashboardLayouts ([CharacterId],[Name],[DefaultPageId],[SortOrder],[IsDeleted],[LayoutHeight],[LayoutWidth],[IsDefaultLayout])
VALUES 
(@CharacterID,'Default',NULL,1,0,@LayoutHeight,@LayoutWidth,1)

SET @NewLayoutID=@@IDENTITY

INSERT INTO CharacterDashboardPages([CharacterDashboardLayoutId],[CharacterId],[Name],[SortOrder],[IsDeleted],[ContainerHeight],[ContainerWidth],[TitleBgColor]
,[TitleTextColor],[BodyBgColor],[BodyTextColor])
VALUES
(@NewLayoutID,@CharacterID,'Page1',1,0,@LayoutHeight,@LayoutWidth,'#FFFFFF','#000000','#FFFFFF','#000000')

SET @NewPageID=@@IDENTITY

UPDATE CharacterDashboardLayouts SET [DefaultPageId]=@NewPageID WHERE CharacterDashboardLayoutId=@NewLayoutID
END
END

COMMIT TRAN
GO
