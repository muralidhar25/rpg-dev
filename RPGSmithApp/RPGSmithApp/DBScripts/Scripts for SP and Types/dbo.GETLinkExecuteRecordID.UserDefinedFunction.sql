USE [rpgsmithapp]
GO
/****** Object:  UserDefinedFunction [dbo].[GETLinkExecuteRecordID]    Script Date: 4/4/2019 11:26:42 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[GETLinkExecuteRecordID](@UserDefineType nvarchar(10),@RecordType nvarchar(10),@RecordID int,  @NewID_OldId_Tbl [Type_NewOldID] READONLY )
RETURNS INT 
AS
BEGIN
	DECLARE @RES INT=NULL
	IF(@UserDefineType=@RecordType)
	BEGIN	
		IF EXISTS( SELECT * FROM @NewID_OldId_Tbl WHERE [OldID] = @RecordID )
		BEGIN
			SELECT @RES=[NewID] FROM @NewID_OldId_Tbl WHERE [OldID] = @RecordID 
		END
		ELSE
		BEGIN
			SELECT @RES=@RecordID
		END		
	END
	ELSE
	BEGIN	
		SET @RES= null
	END
	RETURN @RES
END
GO
