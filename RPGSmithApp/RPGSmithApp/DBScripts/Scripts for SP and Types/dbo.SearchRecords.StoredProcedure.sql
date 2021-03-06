USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[SearchRecords]    Script Date: 4/4/2019 10:40:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[SearchRecords]
(
@SearchText NVARCHAR(MAX)=''
,@RecordType INT=0

,@RulesetID INT=0
,@CharacterID INT=0

,@IsItemName BIT=0
,@IsItemTags BIT=0
,@IsItemStats BIT=0
,@IsItemDesc BIT=0
,@IsItemRarity BIT=0
,@IsItemSpellAssociated BIT=0
,@IsItemAbilityAssociated BIT=0

,@IsSpellName BIT=0
,@IsSpellTags BIT=0
,@IsSpellStats BIT=0
,@IsSpellDesc BIT=0
,@IsSpellClass BIT=0
,@IsSpellSchool BIT=0
,@IsSpellLevel BIT=0
,@IsSpellCastingTime BIT=0
,@IsSpellEffectDesc BIT=0
,@IsSpellHitEffect BIT=0
,@IsSpellMissEffect BIT=0

,@IsAbilityName BIT=0
,@IsAbilityTags BIT=0
,@IsAbilityStats BIT=0
,@IsAbilityDesc BIT=0
,@IsAbilityLevel BIT=0

,@IsEverything BIT=0
,@IsEverythingName BIT=0
,@IsEverythingTag BIT=0
,@IsEverythingStat BIT=0
,@IsEverythingDesc BIT=0
,@OldSearchIds Type_ID READONLY
)
AS
BEGIN
	Declare @qry NVARCHAR(MAX)=''
	DECLARE @NeedOR BIT=0
	
	DECLARE @OldSearchIdsString NVARCHAR(MAX) 
	SELECT @OldSearchIdsString = COALESCE(@OldSearchIdsString + ',', '') + CAST(ID AS VARCHAR(10))
      FROM @OldSearchIds

	DECLARE @ParentRulesetID INT 
	SELECT @ParentRulesetID=ParentRulesetID FROM Rulesets WHERE RuleSetId=@RulesetID

	IF( @ParentRulesetID IS NULL)
	BEGIN 
		SET @ParentRulesetID=@RulesetID
	END
		
	IF(@RecordType=1) --RulesetItems
	BEGIN
		SET @qry='
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
		SELECT distinct IM.[ItemMasterId],IM.[RuleSetId],IM.[ItemName],IM.[ItemImage],IM.[ItemStats],IM.[ItemVisibleDesc],IM.[Command],IM.[ItemCalculation],IM.[Value],IM.[Volume]
		,IM.[Weight],IM.[IsContainer],IM.[ContainerWeightMax],IM.[ContainerVolumeMax],IM.[ContainerWeightModifier],IM.[PercentReduced],IM.[TotalWeightWithContents]
		,IM.[IsMagical],IM.[IsConsumable],IM.[Metatags],IM.[Rarity],IM.[ParentItemMasterId],IM.[IsDeleted],IM.[CommandName],0 
		FROM ItemMasters IM
		Left Join ItemMaster_Abilities IMA ON IMA.ItemMasterId=IM.ItemMasterId 
		Left Join Abilities A ON A.AbilityId=IMA.AbilityId
		Left Join ItemMaster_Spells IMS ON IMS.ItemMasterId=IM.ItemMasterId 
		Left Join Spells S ON S.SpellId=IMS.SpellId
		Where (IM.RulesetID=' +CONVERT(NVARCHAR(12), @RulesetID) +' OR IM.RulesetID='+ CONVERT(NVARCHAR(12), @ParentRulesetID) + ') AND (IM.IsDeleted !=1 OR IM.IsDeleted is null) AND '
		
		IF Exists(SELECT * FROM @OldSearchIds)
		BEGIN
			SET @qry=@qry +' IM.ItemMasterId IN ( '+@OldSearchIdsString+' ) AND '
		END
		
		SET @NeedOR=0
		SET @qry=@qry +' ( '

		IF (@IsEverything=1)
		BEGIN			
			IF(@IsEverythingName=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' IM.[ItemName] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsEverythingTag=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' IM.[Metatags] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1			
			END
			IF(@IsEverythingStat=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' IM.[itemstats] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1			
			END
			IF(@IsEverythingDesc=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' IM.[ItemVisibleDesc] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1			
			END
		END
		ELSE
		BEGIN			
			IF(@IsItemName=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' IM.[ItemName] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsItemTags=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' IM.[Metatags] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1			
			END
			IF(@IsItemStats=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' IM.[itemstats] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1			
			END
			IF(@IsItemDesc=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' IM.[ItemVisibleDesc] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1			
			END
			IF(@IsItemRarity=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' IM.[Rarity] = '''+ @SearchText + ''' '
				SET @NeedOR=1			
			END
			IF(@IsItemSpellAssociated=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' S.[Name] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1			
			END
			IF(@IsItemAbilityAssociated=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' A.[Name] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1			
			END
		END

		
		
		SET @qry=@qry +' ) 
		AND (
			IM.ItemMasterId NOT IN 
			(SELECT ParentItemMasterId FROM ItemMasters 
			WHERE (
					RulesetID= ' +CONVERT(NVARCHAR(12), @RulesetID) +'  
					AND ParentItemMasterId IS NOT NULL)
				  )
			) '

		SET @qry=@qry +'
		
		INSERT INTO @tempItemMaster 
		SELECT distinct IM.[BundleId],IM.[RuleSetId],IM.BundleName,IM.BundleImage,'''',IM.BundleVisibleDesc,'''','''',IM.[Value],IM.[Volume],
		IM.TotalWeight,0,0,0,'''',0,0,0,0,IM.[Metatags],IM.[Rarity],IM.[ParentItemMasterBundleId],0,'''' ,1
		FROM  ItemMasterBundles IM		
		Where (IM.RulesetID=' +CONVERT(NVARCHAR(12), @RulesetID) +' OR IM.RulesetID='+ CONVERT(NVARCHAR(12), @ParentRulesetID) + ') AND (IM.IsDeleted !=1 OR IM.IsDeleted is null) AND '
		
		IF Exists(SELECT * FROM @OldSearchIds)
		BEGIN
			SET @qry=@qry +' IM.BundleId IN ( '+@OldSearchIdsString+' ) AND '
		END
		
		SET @NeedOR=0
		SET @qry=@qry +' ( '

		IF (@IsEverything=1)
		BEGIN			
			IF(@IsEverythingName=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' IM.[BundleName] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsEverythingTag=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' IM.[Metatags] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1			
			END			
			IF(@IsEverythingDesc=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' IM.[BundleVisibleDesc] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1			
			END
		END
		ELSE
		BEGIN			
			IF(@IsItemName=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' IM.[BundleName] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsItemTags=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' IM.[Metatags] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1			
			END
			
			IF(@IsItemDesc=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' IM.[BundleVisibleDesc] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1			
			END
			IF(@IsItemRarity=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' IM.[Rarity] = '''+ @SearchText + ''' '
				SET @NeedOR=1			
			END			
		END

		
		
		SET @qry=@qry +' ) 
		AND (
			IM.BundleId NOT IN 
			(SELECT ParentItemMasterBundleId FROM ItemMasterBundles 
			WHERE (
					RulesetID= ' +CONVERT(NVARCHAR(12), @RulesetID) +'  
					AND ParentItemMasterBundleId IS NOT NULL)
				  )
			) '
		
		SET @qry=@qry +' SELECT * FROM @tempItemMaster ORDER BY ItemName	'
	END
		
	ELSE IF(@RecordType=2)--CharacterItems
	BEGIN
		SET @qry='SELECT distinct I.* FROM Items I
		Left Join ItemAbilities IA ON IA.ItemId=I.ItemId 
		Left Join Abilities A ON A.AbilityId=IA.AbilityId
		Left Join ItemSpells ISP ON ISP.ItemId=I.ItemId 
		Left Join Spells S ON S.spellId=ISP.spellId		
		Where I.CharacterID=' +CONVERT(NVARCHAR(12), @CharacterID) +'  AND (I.IsDeleted !=1 OR I.IsDeleted is null) AND '
		
		IF Exists(SELECT * FROM @OldSearchIds)
		BEGIN
			SET @qry=@qry +' I.ItemId IN ( '+@OldSearchIdsString+' ) AND '
		END

		SET @NeedOR=0
		SET @qry=@qry +' ( '

		IF (@IsEverything=1)
		BEGIN
			IF(@IsEverythingName=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' I.[Name] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsEverythingTag=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' I.[Metatags] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1			
			END
			IF(@IsEverythingStat=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' I.[itemstats] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1			
			END
			IF(@IsEverythingDesc=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' I.[Description] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1			
			END
		END
		ELSE
		BEGIN
			IF(@IsItemName=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' I.[Name] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsItemTags=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' I.[Metatags] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1			
			END
			IF(@IsItemStats=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' I.[itemstats] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1			
			END
			IF(@IsItemDesc=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' I.[Description] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1			
			END
			IF(@IsItemRarity=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' I.[Rarity] = '''+ @SearchText + ''' '
				SET @NeedOR=1			
			END
			IF(@IsItemSpellAssociated=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' S.[Name] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1			
			END
			IF(@IsItemAbilityAssociated=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' A.[Name] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1			
			END		
		END

		


		SET @qry=@qry +' ) '
	END
		
	ELSE IF(@RecordType=3)--RulesetSpells
	BEGIN
		SET @qry='SELECT * FROM Spells Where (RulesetID=' +CONVERT(NVARCHAR(12), @RulesetID) +' OR RulesetID='+ CONVERT(NVARCHAR(12), @ParentRulesetID) + ')  AND (IsDeleted !=1 OR IsDeleted is null) AND '
		
		IF Exists(SELECT * FROM @OldSearchIds)
		BEGIN
			SET @qry=@qry +' SpellId IN ( '+@OldSearchIdsString+' ) AND '
		END
		
		SET @NeedOR=0
		SET @qry=@qry +' ( '

		IF (@IsEverything=1)
		BEGIN
			IF(@IsEverythingName=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [Name] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsEverythingTag=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [Metatags] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsEverythingStat=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [stats] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsEverythingDesc=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [Description] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
		END
		ELSE
		BEGIN
			IF(@IsSpellName=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [Name] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsSpellTags=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [Metatags] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsSpellStats=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [stats] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsSpellDesc=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [Description] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsSpellClass=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [class] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsSpellSchool=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [school] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsSpellLevel=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [Levels] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsSpellCastingTime=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [CastingTime] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsSpellEffectDesc=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [EffectDescription] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsSpellHitEffect=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [HitEffect] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsSpellMissEffect=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [MissEffect] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
		END


		


		SET @qry=@qry +' ) 
		AND ( SpellId NOT IN 
			(SELECT ParentSpellId FROM Spells 
			WHERE (
					RulesetID= ' +CONVERT(NVARCHAR(12), @RulesetID) +'  
					AND ParentSpellId IS NOT NULL)
				  )
			)
		'
	END

	ELSE IF(@RecordType=4)--CharacterSpells
	BEGIN
		SET @qry='SELECT * FROM Spells S LEFT JOIN CharacterSpells CS ON CS.SpellId=S.SpellId 
		Where CharacterId=' +CONVERT(NVARCHAR(12), @CharacterID) +' 
		AND (S.IsDeleted !=1 OR S.IsDeleted is null)   
		AND (CS.IsDeleted !=1 OR CS.IsDeleted is null) AND '
		
		IF Exists(SELECT * FROM @OldSearchIds)
		BEGIN
			SET @qry=@qry +' CS.CharacterSpellId  IN ( '+@OldSearchIdsString+' ) AND '
		END
		
		
		SET @NeedOR=0
		SET @qry=@qry +' ( '

		IF (@IsEverything=1)
		BEGIN
			IF(@IsEverythingName=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [Name] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsEverythingTag=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [Metatags] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsEverythingStat=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [stats] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsEverythingDesc=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [Description] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
		END
		ELSE
		BEGIN
			IF(@IsSpellName=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [Name] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsSpellTags=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [Metatags] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsSpellStats=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [stats] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsSpellDesc=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [Description] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsSpellClass=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [class] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsSpellSchool=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [school] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsSpellLevel=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [Levels] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsSpellCastingTime=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [CastingTime] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsSpellEffectDesc=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [EffectDescription] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsSpellHitEffect=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [HitEffect] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsSpellMissEffect=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [MissEffect] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
		END


		


		SET @qry=@qry +' ) '
	END

	ELSE IF(@RecordType=5)--RuleSetAbilities
	BEGIN
		SET @qry='SELECT * FROM Abilities Where (RulesetID=' +CONVERT(NVARCHAR(12), @RulesetID) +' OR RulesetID='+ CONVERT(NVARCHAR(12), @ParentRulesetID) + ')  AND (IsDeleted !=1 OR IsDeleted is null) AND '
		
		IF Exists(SELECT * FROM @OldSearchIds)
		BEGIN
			SET @qry=@qry +' AbilityId IN ( '+@OldSearchIdsString+' ) AND '
		END
		
		
		SET @NeedOR=0
		SET @qry=@qry +' ( '

		IF (@IsEverything=1)
		BEGIN
			IF(@IsEverythingName=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [Name] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsEverythingTag=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [Metatags] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsEverythingStat=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [stats] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsEverythingDesc=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [Description] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
		END
		ELSE
		BEGIN
			IF(@IsAbilityName=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [Name] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsAbilityTags=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [Metatags] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsAbilityStats=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [stats] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsAbilityDesc=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [Description] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsAbilityLevel=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [Level] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
		END


		


		SET @qry=@qry +' )  
		AND (
			AbilityId NOT IN 
			(SELECT ParentAbilityId FROM Abilities 
			WHERE (
					RulesetID= ' +CONVERT(NVARCHAR(12), @RulesetID) +'  
					AND ParentAbilityId IS NOT NULL)
				  )
			)
		'
	END

	ELSE IF(@RecordType=6)--CharacterAbilities
	BEGIN
		SET @qry='SELECT * FROM Abilities A LEFT JOIN CharacterAbilities CA ON A.AbilityId=CA.AbilityId 
		Where CharacterId=' +CONVERT(NVARCHAR(12), @CharacterID) +' 
		AND (A.IsDeleted !=1 OR A.IsDeleted is null)   
		AND (CA.IsDeleted !=1 OR CA.IsDeleted is null) AND '
		
		IF Exists(SELECT * FROM @OldSearchIds)
		BEGIN
			SET @qry=@qry +' CA.CharacterAbilityId  IN ( '+@OldSearchIdsString+' ) AND '
		END
		
		
		SET @NeedOR=0
		SET @qry=@qry +' ( '

		IF (@IsEverything=1)
		BEGIN
			IF(@IsEverythingName=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [Name] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsEverythingTag=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [Metatags] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsEverythingStat=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [stats] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsEverythingDesc=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [Description] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
		END
		ELSE
		BEGIN
			IF(@IsAbilityName=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [Name] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsAbilityTags=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [Metatags] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsAbilityStats=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [stats] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsAbilityDesc=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [Description] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
			IF(@IsAbilityLevel=1)
			BEGIN
				IF(@NeedOR=1)
				BEGIN
					SET @qry=@qry +' OR '
				END
				SET @qry=@qry +' [Level] like ''%'+ @SearchText + '%'' '
				SET @NeedOR=1
			END
		END


		


		SET @qry=@qry +' ) '
	END
	
	EXECUTE (@qry)
END
GO
