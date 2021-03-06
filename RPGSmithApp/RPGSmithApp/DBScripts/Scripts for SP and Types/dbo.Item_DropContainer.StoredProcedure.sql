USE [rpgsmithapp]
GO
/****** Object:  StoredProcedure [dbo].[Item_DropContainer]    Script Date: 4/4/2019 10:40:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[Item_DropContainer]
(
@ItemID INT
)
AS
DECLARE @TempIdsparam [Type_ID]
Declare @TempIds_Main AS Table (ID INT,ContainedIn INT)
Declare @TempIds AS Table ([RowNum] [int] IDENTITY(1,1) NOT NULL,ID INT)
Declare @TempIds_1 AS Table ([RowNum] [int] IDENTITY(1,1) NOT NULL,ID INT)
Declare @ReturnIDs AS Table (ID INT)

--SELECT *  FROM [dbo].[Items] WHERE ItemID=@ItemID
--SELECT *  FROM [dbo].[Items] WHERE ContainedIn=@ItemID

INSERT INTO @TempIds SELECT ItemID  FROM [dbo].[Items] WHERE ContainedIn=@ItemID AND ITEMID NOT IN (SELECT ID FROM @TempIdsparam)

INSERT INTO @TempIds_Main SELECT Itemid,ContainedIn FROM ITEMS WHERE ContainedIn IN (SELECT ID FROM @TempIds)

INSERT INTO @ReturnIDs SELECT Itemid FROM [Items]  WHERE ItemID IN (SELECT ID FROM @TempIdsparam WHERE ID NOT IN (SELECT ID FROM @TempIds))
--UPDATE [Items] SET ContainedIN =@ItemID WHERE ItemID IN (SELECT ID FROM @TempIdsparam WHERE ID NOT IN (SELECT ID FROM @TempIds))

INSERT INTO @ReturnIDs SELECT Itemid FROM [Items] WHERE ContainedIn=@ItemID AND ITEMID NOT IN (SELECT ID FROM @TempIdsparam)
--UPDATE [Items] SET ContainedIN = NULL  WHERE ContainedIn=@ItemID AND ITEMID NOT IN (SELECT ID FROM @TempIdsparam)
	
INSERT INTO @ReturnIDs SELECT Itemid FROM [Items] WHERE ContainedIn IN (SELECT ID FROM @TempIds)
--UPDATE [Items] SET ContainedIN = NULL WHERE ContainedIn IN (SELECT ID FROM @TempIds)

IF EXISTS(SELECT * FROM @TempIds_Main WHERE ContainedIn IN (SELECT ID FROM @TempIds))
BEGIN
	--SELECT * FROM ITEMS WHERE ContainedIn IN (SELECT ID FROM @TempIds)
	INSERT INTO @TempIds_1 SELECT ID FROM @TempIds_Main WHERE ContainedIn IN (SELECT ID FROM @TempIds)
	--SELECT * FROM @TempIds_1
	--SELECT 'CALL-SP'

	DECLARE @Temp_ItemID INT
	DECLARE @Temp_tbl [Type_ID]
	DECLARE @Count INT=1,@TotalCount INT =0
	SELECT @TotalCount=COUNT(*) FROM @TempIds_1		
	while (@Count <= @TotalCount)
	BEGIN
		--SELECT * FROM @TempIds_1	WHERE RowNum=@Count
		--CallSP
		SELECT @Temp_ItemID=ID FROM @TempIds_1	WHERE RowNum=@Count
		EXEC Item_DropContainer @ItemID=@Temp_ItemID
		SET @Count=@Count+1
	END
END
SELECT *  FROM [dbo].[Items] WHERE ItemID IN (SELECT ID FROM @ReturnIDs)
GO
