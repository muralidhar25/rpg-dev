USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[Ability_GetAbilityCommands]    Script Date: 3/28/2019 1:15:36 PM ******/
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
