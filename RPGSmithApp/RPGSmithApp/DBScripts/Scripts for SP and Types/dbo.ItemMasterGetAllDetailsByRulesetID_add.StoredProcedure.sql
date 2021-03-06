USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[ItemMasterGetAllDetailsByRulesetID_add]    Script Date: 4/4/2019 10:40:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[ItemMasterGetAllDetailsByRulesetID_add]
(
 @RulesetID INT,
 @includeBundles BIT=0
)
AS

DECLARE @ParentRulesetID INT 
--DECLARE @Temp_ItemMasterIds AS TABLE (ItemID INT)

SELECT @ParentRulesetID=ParentRulesetID FROM Rulesets WHERE RuleSetId=@RulesetID

IF( @ParentRulesetID IS NULL)
BEGIN 
	SET @ParentRulesetID=@RulesetID
END

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
		 FROM ItemMasters WHERE  
	(RulesetID=@RulesetID OR RulesetID=@ParentRulesetID) 
	AND (IsDeleted !=1 OR IsDeleted IS NULL) 
	AND ItemMasterId NOT IN (SELECT ParentItemMasterId FROM ItemMasters WHERE  (RulesetID=@RulesetID AND ParentItemMasterId IS NOT NULL))
	ORDER BY ItemName
IF(@includeBundles=1)
BEGIN
	INSERT INTO @tempItemMaster 
	SELECT [BundleId],[RuleSetId],BundleName,BundleImage,'',BundleVisibleDesc,'','',[Value],[Volume],
	TotalWeight,0,0,0,'',0,0,0,0,[Metatags],[Rarity],[ParentItemMasterBundleId],0,'' ,1
	FROM [dbo].[ItemMasterBundles] WHERE (RulesetID=@RulesetID OR RulesetID=@ParentRulesetID) 	
				AND (IsDeleted !=1 OR IsDeleted IS NULL) 			 
				AND BundleId NOT IN (SELECT [ParentItemMasterBundleId] FROM ItemMasterBundles 
				WHERE (RulesetID=@RulesetID AND [ParentItemMasterBundleId] IS NOT NULL))	
END

SELECT * FROM @tempItemMaster WHERE (IsDeleted !=1 OR IsDeleted IS NULL) ORDER BY ItemName


GO
