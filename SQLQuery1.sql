CREATE TABLE [dbo].[Cart] (
    [ID]         INT             IDENTITY (1, 1) NOT NULL,
    [UserId]     INT             NULL,
    [MedicineID] INT             NULL,
    [UnitPrice]  DECIMAL (18, 2) NULL,
    [Discount]   DECIMAL (18, 2) NULL,
    [Quantity]   INT             NULL,
    [TotalPrice] DECIMAL (18, 2) NULL,
    PRIMARY KEY CLUSTERED ([ID] ASC)
);
====================================================================================

CREATE TABLE [dbo].[Medicines] (
    [ID]           INT             IDENTITY (1, 1) NOT NULL,
    [Name]         VARCHAR (100)   NULL,
    [Manufacturer] VARCHAR (100)   NULL,
    [UnitPrice]    DECIMAL (18, 2) NULL,
    [Discount]     DECIMAL (18, 2) NULL,
    [Quantity]     INT             NULL,
    [ExpDate]      DATETIME        NULL,
    [ImageUrl]     VARCHAR (100)   NULL,
    [Status]       INT             NULL,
    PRIMARY KEY CLUSTERED ([ID] ASC)
);

====================================================================================

CREATE TABLE [dbo].[OrderItems] (
    [ID]         INT             IDENTITY (1, 1) NOT NULL,
    [OrderID]    INT             NULL,
    [MedicineID] INT             NULL,
    [UnitPrice]  DECIMAL (18, 2) NULL,
    [Discount]   DECIMAL (18, 2) NULL,
    [Quantity]   INT             NULL,
    [TotalPrice] DECIMAL (18, 2) NULL,
    PRIMARY KEY CLUSTERED ([ID] ASC)
);

====================================================================================

CREATE TABLE [dbo].[Orders] (
    [ID]          INT             IDENTITY (1, 1) NOT NULL,
    [UserId]      INT             NULL,
    [OrderNo]     VARCHAR (100)   NULL,
    [OrderTotal]  DECIMAL (18, 2) NULL,
    [OrderStatus] VARCHAR (100)   NULL,
    PRIMARY KEY CLUSTERED ([ID] ASC)
);

====================================================================================

CREATE TABLE [dbo].[Users] (
    [ID]        INT             IDENTITY (1, 1) NOT NULL,
    [FirstName] VARCHAR (100)   NULL,
    [LastName]  VARCHAR (100)   NULL,
    [Password]  VARCHAR (100)   NULL,
    [Email]     VARCHAR (100)   NULL,
    [Fund]      DECIMAL (18, 2) NULL,
    [Type]      VARCHAR (100)   NULL,
    [Status]    INT             NULL,
    [CreatedOn] DATETIME        NULL
);

====================================================================================

CREATE PROC [dbo].[sp_AddToCart](
    @ID INT, 
    @Email VARCHAR(100) = NULL, 
    @UnitPrice DECIMAL(18,2) = NULL, 
    @Discount DECIMAL(18,2) = NULL,
    @Quantity INT = NULL,
    @TotalPrice DECIMAL(18,2) = NULL
)  
AS  
BEGIN  
    DECLARE @UserId INT;  
    DECLARE @UnitPrice_ DECIMAL(18,2);  
    DECLARE @Discount_ DECIMAL(18,2);  
    DECLARE @TotalPrice_ DECIMAL(18,2);  
    
    SET @UserId = (SELECT TOP 1 ID FROM Users WHERE Email = @Email);  
    SET @UnitPrice_ = (SELECT TOP 1 UnitPrice FROM Medicines WHERE ID = @ID);  
    
    IF @Quantity IS NULL SET @Quantity = 1;
    SET @Discount_ = (SELECT (UnitPrice * @Quantity * Discount)/ 100 FROM Medicines WHERE ID = @ID);  
    SET @TotalPrice_ = (SELECT (UnitPrice * @Quantity) - @Discount_ FROM Medicines WHERE ID = @ID);  
    
    IF NOT EXISTS(SELECT 1 FROM Cart WHERE UserId = @UserId AND MedicineID = @ID)  
    BEGIN  
        INSERT INTO Cart(UserId,MedicineID,UnitPrice,Discount,Quantity,TotalPrice)  
        VALUES(@UserId, @ID, @UnitPrice_, @Discount_, @Quantity, @TotalPrice_);   
    END  
    ELSE  
    BEGIN  
        UPDATE Cart 
        SET Quantity = Quantity + @Quantity 
        WHERE UserId = @UserId AND MedicineID = @ID;  
    END  
END;

====================================================================================

CREATE PROC [dbo].[sp_AddUpdateMedicine](@ID INT = null, @Name VARCHAR(100) = null, @Manufacturer VARCHAR(100) = null,@UnitPrice DECIMAL(18,2) = null
,@Discount DECIMAL(18,2)  = null,@Quantity INT  = null,@ExpDate DATETIME  = null,@ImageUrl VARCHAR(100) = null,@Status INT = null
, @Type VARCHAR(100) = null)
AS
BEGIN
	IF @Type = 'Add'
	BEGIN
		INSERT INTO Medicines(Name,Manufacturer,UnitPrice,Discount,Quantity,ExpDate,ImageUrl,Status)
		VALUES(@Name,@Manufacturer,@UnitPrice,@Discount,@Quantity,@ExpDate,@ImageUrl,@Status)
	END
	IF @Type = 'Update'
	BEGIN
		UPDATE Medicines SET Name=@Name,Manufacturer=@Manufacturer,UnitPrice=@UnitPrice,Discount=@Discount,Quantity=@Quantity		
		WHERE ID = @ID;
	END
	IF @Type = 'Delete'
	BEGIN
		UPDATE Medicines SET Status = 0 WHERE ID = @ID;
	END
	IF @Type = 'Get'
	BEGIN
		SELECT * FROM Medicines WHERE Status = 1;
	END
	IF @Type = 'GetByID'
	BEGIN
		SELECT * FROM Medicines WHERE ID = @ID;
	END
END;

====================================================================================

CREATE PROC [dbo].[sp_CartList](@Email VARCHAR(100))
AS
BEGIN
    IF @Email != 'Admin'
	BEGIN
		SELECT C.ID, M.Name, M.Manufacturer, M.UnitPrice, M.Discount, C.Quantity, C.TotalPrice, M.ImageUrl FROM Cart C 
		INNER JOIN Medicines M ON M.ID = C.MedicineID
		INNER JOIN Users U ON U.ID = C.UserId
		WHERE U.Email =  @Email;
	END
	ELSE
	BEGIN
		SELECT M.ID, M.Name, M.Manufacturer, M.UnitPrice, M.Discount, M.Quantity, M.ImageUrl , 0 AS TotalPrice FROM Medicines M;
	END
END;

====================================================================================

CREATE PROC [dbo].[sp_login](@Email VARCHAR(100), @Password VARCHAR(100))
AS
BEGIN
	SELECT * FROM Users WHERE Email = @Email AND Password = @Password AND Status = 1;
END;

====================================================================================

CREATE PROC [dbo].[sp_OrderList](
    @Type VARCHAR(100), 
    @Email VARCHAR(100) = NULL, 
    @ID INT
)  
AS  
BEGIN  
    IF @Type = 'Admin'  
    BEGIN  
        SELECT O.ID, OrderNo, OrderTotal, OrderStatus,
               U.FirstName + ' ' + U.LastName AS CustomerName,U.CreatedOn 
        FROM Orders O 
        INNER JOIN Users U ON U.ID = O.UserID;  
    END  
    ELSE IF @Type = 'User'  
    BEGIN  
        SELECT O.ID, OrderNo, OrderTotal, OrderStatus,
               CONCAT(U.FirstName, ' ', U.LastName) AS CustomerName ,U.CreatedOn  
        FROM Orders O 
        INNER JOIN Users U ON U.ID = O.UserID  
        WHERE U.Email = @Email;  
    END  
    ELSE IF @Type = 'UserItems'  
    BEGIN  
        SELECT O.ID, O.OrderNo, O.OrderTotal, O.OrderStatus, M.Name AS MedicineName, 
               M.Manufacturer, M.UnitPrice, OI.Quantity, OI.TotalPrice, 
               CONCAT(U.FirstName, ' ', U.LastName) AS CustomerName,
               M.ImageUrl ,U.CreatedOn  
        FROM Orders O   
        INNER JOIN Users U ON U.ID = O.UserID  
        INNER JOIN OrderItems OI ON OI.OrderID = O.ID  
        INNER JOIN Medicines M ON M.ID = OI.MedicineID  
        WHERE O.ID = @ID;  
    END   
END;

====================================================================================

CREATE PROC [dbo].[sp_PlaceOrder](@Email VARCHAR(100))
AS
BEGIN
	DECLARE @OrderNO VARCHAR(100);
	DECLARE @OrderID INT;
	DECLARE @OrderTotal DECIMAL(18,2);
	DECLARE @UserID INT;
	SET @OrderNO =	(SELECT NEWID());
	SET @UserID = (SELECT ID FROM Users WHERE Email = @Email);

	IF OBJECT_ID('tempdb..#TempOrder') IS NOT NULL DROP TABLE #TempOrder; 
	
	SELECT * INTO #TempOrder 
	FROM Cart WHERE UserId = @UserID;

	SET @OrderTotal = (SELECT SUM(TotalPrice) from #TempOrder);

	INSERT INTO Orders(UserID,OrderNo,OrderTotal,OrderStatus)
	VALUES(@UserID,@OrderNO,@OrderTotal,'Pending');

	SET @OrderID = (SELECT ID FROM Orders WHERE OrderNo = @OrderNO);

	INSERT INTO OrderItems(OrderID,MedicineID,UnitPrice,Discount,Quantity,TotalPrice)
	SELECT @OrderID, MedicineID,UnitPrice,Discount,Quantity,TotalPrice FROM #TempOrder;

	DELETE FROM Cart WHERE UserId = @UserID;
END;

====================================================================================

CREATE PROC [dbo].[sp_register](@ID INT = NULL, @FirstName VARCHAR(100) = NULL, @LastName VARCHAR(100) = NULL, @Password VARCHAR(100) = NULL,
@Email VARCHAR(100) = NULL, @Fund DECIMAL(18,2) = NULL, @Type VARCHAR(100) = NULL, @Status INT = NULL, @ActionType VARCHAR(100) = NULL)
AS
BEGIN
	IF @ActionType = 'Add'
	BEGIN
		INSERT INTO Users(FirstName,LastName,Password,Email,Fund,Type,Status,CreatedOn)
		VALUES(@FirstName,@LastName,@Password,@Email,@Fund,@Type,@Status,GETDATE())
	END
	IF @ActionType = 'Update'
	BEGIN
		UPDATE Users SET FirstName = @FirstName,LastName = @LastName,Password = @Password
		WHERE Email = @Email;
	END
	IF @ActionType = 'AddFund'
	BEGIN
		UPDATE Users SET Fund = @Fund WHERE Email = @Email;
	END
END;

====================================================================================

CREATE PROC [dbo].[sp_RemoveToCart](@ID INT, @Email VARCHAR(100) = null)    
AS    
BEGIN    
  DECLARE @UserId INT;    
  SET @UserId = (SELECT TOp 1 ID FROM Users WHERE Email = @Email);    
     
  DELETE FROM Cart WHERE UserId = @UserId AND ID = @ID;    
END;

CREATE PROC [dbo].[sp_updateOrderStatus](@OrderNo VARCHAR(100) = NULL, @OrderStatus VARCHAR(100) = NULL)
AS
BEGIN
	UPDATE Orders SET OrderStatus = @OrderStatus WHERE OrderNo = @OrderNo;
END;

====================================================================================
CREATE PROC [dbo].[sp_UserList]
AS
BEGIN
	SELECT ID, FirstName, LastName, Email, CASE WHEN Fund IS NULL THEN 0.00 ELSE FUND END AS FUND
	, CONVERT(NVARCHAR,CreatedOn ,107) AS OrderDate, Status, Password  FROM Users WHERE Status = 1 AND Type != 'Admin';
END;


CREATE PROC [dbo].[sp_viewUser](@ID INT = null, @Email VARCHAR(100) = null)
AS
BEGIN
	IF @ID IS NOT null AND @ID != 0
	BEGIN
		SELECT * FROM Users WHERE ID = @ID AND Status = 1;
	END
	IF @Email IS NOT null AND @Email != ''
	BEGIN
		SELECT * FROM Users WHERE Email = @Email AND Status = 1;
	END
END;

====================================================================================

select *  from Users;
select * from Medicines;
select * from Cart;
select * from Orders;
select * from OrderItems;

