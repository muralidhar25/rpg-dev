USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[Ability_GetAbilityCommands]    Script Date: 4/4/2019 10:40:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[Ability_GetAbilityCommands]
(
 @AbilityId INT
)
AS
BEGIN	
	SELECT * FROM [dbo].[AbilityCommands]
	WHERE AbilityId = @AbilityId
END
GO
