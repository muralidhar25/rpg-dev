USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[CharactersCharacterStats_GetByCharacterID]    Script Date: 4/4/2019 10:40:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[CharactersCharacterStats_GetByCharacterID]
(
@CharacterID INT
)
AS 
SELECT CCS.*,CS.CharacterStatTypeId,CS.CharacterStatId,CS.StatName,CS.isMultiSelect FROM CharactersCharacterStats CCS 
	LEFT JOIN CharacterStats CS ON CCS.CharacterStatId=cs.CharacterStatId
	WHERE CCS.CharacterId=@CharacterID AND (CCS.IsDeleted !=1 OR CCS.IsDeleted is null)  
SELECT * FROM Characters WHERE CharacterId=@CharacterID AND (IsDeleted !=1 OR IsDeleted is null) 
GO
