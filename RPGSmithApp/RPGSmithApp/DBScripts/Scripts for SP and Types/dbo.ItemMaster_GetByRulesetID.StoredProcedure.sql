USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[ItemMaster_GetByRulesetID]    Script Date: 4/4/2019 10:40:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--EXEC ItemMaster_GetByRulesetID @RulesetID=149,@page=2,@size=30
CREATE PROCEDURE [dbo].[ItemMaster_GetByRulesetID]
(
 @RulesetID INT,
 @page INT,
 @size INT,
 @includeBundles BIT=0
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

IF EXISTS( SELECT RulesetID FROM Rulesets WHERE RuleSetId=@RulesetID AND ParentRulesetID IS NOT NULL AND (IsDeleted !=1 OR IsDeleted IS NULL))
BEGIN 
	DECLARE @ParentRulesetID INT 
	SELECT @ParentRulesetID=ParentRulesetID FROM Rulesets WHERE RuleSetId=@RulesetID

	IF( @ParentRulesetID IS NULL)
	BEGIN 
		SET @ParentRulesetID=@RulesetID
	END

	SET NOCOUNT ON;

	SET @sql = '
		DECLARE @tempItemMaster AS TABLE (
		[ItemMasterId] [int] NOT NULL,
		[RuleSetId] [int] NOT NULL,
		[ItemName] [nvarchar](255) NOT NULL,
		[ItemImage] [nvarchar](2048) NULL,
		[ItemStats] [nvarchar](max) NULL,
		[ItemVisibleDesc] [nvarchar](max) NULL,
		[Command] [nvarchar](max) NULL,
		[ItemCalculation] [nvarchar](255) NULL,
		[Value] [decimal](18, 8) NOT NULL,
		[Volume] [decimal](18, 8) NOT NULL,
		[Weight] [decimal](18, 3) NOT NULL,
		[IsContainer] [bit] NOT NULL,
		[ContainerWeightMax] [decimal](18, 3) NOT NULL,
		[ContainerVolumeMax] [decimal](18, 8) NOT NULL,
		[ContainerWeightModifier] [varchar](50) NULL,
		[PercentReduced] [decimal](18, 3) NOT NULL,
		[TotalWeightWithContents] [decimal](18, 3) NOT NULL,
		[IsMagical] [bit] NOT NULL,
		[IsConsumable] [bit] NOT NULL,
		[Metatags] [nvarchar](max) NULL,
		[Rarity] [nvarchar](20) NULL,
		[ParentItemMasterId] [int] NULL,
		[IsDeleted] [bit] NULL,
		[CommandName] [nvarchar](100) NULL,
		[IsBundle] [bit] NULL
		)
		
		INSERT INTO @tempItemMaster 
		SELECT [ItemMasterId],[RuleSetId],[ItemName],[ItemImage],[ItemStats],[ItemVisibleDesc],[Command],[ItemCalculation],[Value],[Volume]
		,[Weight],[IsContainer],[ContainerWeightMax],[ContainerVolumeMax],[ContainerWeightModifier],[PercentReduced],[TotalWeightWithContents]
		,[IsMagical],[IsConsumable],[Metatags],[Rarity],[ParentItemMasterId],[IsDeleted],[CommandName] ,0
		FROM [dbo].[ItemMasters] WHERE (RulesetID=' + CONVERT(NVARCHAR(12), @RulesetID)
				 + ' OR RulesetID='+ CONVERT(NVARCHAR(12), @ParentRulesetID) + ') 
				AND (IsDeleted !=1 OR IsDeleted IS NULL) 
				AND ItemMasterId NOT IN (SELECT ParentItemMasterId FROM ItemMasters 
				WHERE (RulesetID='+ CONVERT(NVARCHAR(12), @RulesetID) + ' AND ParentItemMasterId IS NOT NULL));'

	IF (@includeBundles=1)
	BEGIN
		SET @sql = @sql + '	INSERT INTO @tempItemMaster 
		SELECT [BundleId],[RuleSetId],BundleName,BundleImage,'''',BundleVisibleDesc,'''','''',[Value],[Volume],
		TotalWeight,0,0,0,'''',0,0,0,0,[Metatags],[Rarity],[ParentItemMasterBundleId],0,'''' ,1
		FROM [dbo].[ItemMasterBundles] WHERE (RulesetID=' + CONVERT(NVARCHAR(12), @RulesetID)
				 + ' OR RulesetID='+ CONVERT(NVARCHAR(12), @ParentRulesetID) + ') 
				 AND (IsDeleted !=1 OR IsDeleted IS NULL) 				 
				AND BundleId NOT IN (SELECT [ParentItemMasterBundleId] FROM ItemMasterBundles 
				WHERE (RulesetID='+ CONVERT(NVARCHAR(12), @RulesetID) + ' AND [ParentItemMasterBundleId] IS NOT NULL)) ; '
			
	END
	
		SET @sql = @sql + '	

			WITH TABLE_SET AS
			(
				SELECT *, ROW_NUMBER() OVER (ORDER BY ItemName) AS ''Index''
				FROM @tempItemMaster
			)
			SELECT * FROM TABLE_SET WHERE [Index] BETWEEN ' 
			+ CONVERT(NVARCHAR(12), @offset) + ' AND ' + CONVERT(NVARCHAR(12), @newsize) 
			+ ';SELECT *  FROM [dbo].[RuleSets] WHERE RuleSetId=' + CONVERT(NVARCHAR(12), @RulesetID)
			+ ' AND (IsDeleted !=1 OR IsDeleted IS NULL)'
   
   EXECUTE (@sql)
END
ELSE
BEGIN

	SET NOCOUNT ON;

	SET @sql = '
		DECLARE @tempItemMaster AS TABLE (
		[ItemMasterId] [int] NOT NULL,
		[RuleSetId] [int] NOT NULL,
		[ItemName] [nvarchar](255) NOT NULL,
		[ItemImage] [nvarchar](2048) NULL,
		[ItemStats] [nvarchar](max) NULL,
		[ItemVisibleDesc] [nvarchar](max) NULL,
		[Command] [nvarchar](max) NULL,
		[ItemCalculation] [nvarchar](255) NULL,
		[Value] [decimal](18, 8) NOT NULL,
		[Volume] [decimal](18, 8) NOT NULL,
		[Weight] [decimal](18, 3) NOT NULL,
		[IsContainer] [bit] NOT NULL,
		[ContainerWeightMax] [decimal](18, 3) NOT NULL,
		[ContainerVolumeMax] [decimal](18, 8) NOT NULL,
		[ContainerWeightModifier] [varchar](50) NULL,
		[PercentReduced] [decimal](18, 3) NOT NULL,
		[TotalWeightWithContents] [decimal](18, 3) NOT NULL,
		[IsMagical] [bit] NOT NULL,
		[IsConsumable] [bit] NOT NULL,
		[Metatags] [nvarchar](max) NULL,
		[Rarity] [nvarchar](20) NULL,
		[ParentItemMasterId] [int] NULL,
		[IsDeleted] [bit] NULL,
		[CommandName] [nvarchar](100) NULL,
		[IsBundle] [bit] NULL
		)
		
		INSERT INTO @tempItemMaster 
		SELECT [ItemMasterId],[RuleSetId],[ItemName],[ItemImage],[ItemStats],[ItemVisibleDesc],[Command],[ItemCalculation],[Value],[Volume]
		,[Weight],[IsContainer],[ContainerWeightMax],[ContainerVolumeMax],[ContainerWeightModifier],[PercentReduced],[TotalWeightWithContents]
		,[IsMagical],[IsConsumable],[Metatags],[Rarity],[ParentItemMasterId],[IsDeleted],[CommandName] ,0
		FROM [dbo].[ItemMasters] WHERE RulesetID=' + CONVERT(NVARCHAR(12), @RulesetID) + ' AND (IsDeleted != 1 OR IsDeleted IS NULL);'

	IF (@includeBundles=1)
	BEGIN
		SET @sql = @sql + '	INSERT INTO @tempItemMaster 
		SELECT [BundleId],[RuleSetId],BundleName,BundleImage,'''',BundleVisibleDesc,'''','''',[Value],[Volume],
		TotalWeight,0,0,0,'''',0,0,0,0,[Metatags],[Rarity],0,[ParentItemMasterBundleId],'''' ,1
		FROM [dbo].[ItemMasterBundles] WHERE (RulesetID='+ CONVERT(NVARCHAR(12), @RulesetID) + ') AND (IsDeleted != 1 OR IsDeleted IS NULL) ; '
			
	END

	SET  @sql = @sql + '
		WITH TABLE_SET AS
		(
			SELECT *, ROW_NUMBER() OVER (ORDER BY ItemName) AS ''Index''
			FROM @tempItemMaster 
		)
		SELECT * FROM TABLE_SET WHERE [Index] BETWEEN ' 
		+ CONVERT(NVARCHAR(12), @offset) + ' AND ' + CONVERT(NVARCHAR(12), @newsize) 
		+ ';SELECT * FROM [dbo].[RuleSets] WHERE RuleSetId=' + CONVERT(NVARCHAR(12), @RulesetID)
		+ ' AND (IsDeleted !=1 OR IsDeleted IS NULL)'

	EXECUTE (@sql)
END
END
GO
