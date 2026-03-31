CREATE OR ALTER PROCEDURE [dbo].[UpdatePurchaseOrderStatus]
    @OID NVARCHAR(128),
    @Status INT,
    @StatusBy NVARCHAR(255),
    @StatusDate DATETIME,
    @Remarks NVARCHAR(MAX),
    @RejectionReason NVARCHAR(MAX),
    @PoType NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    IF LOWER(@PoType) = 'fuel'
    BEGIN
        UPDATE [dbo].[PurchaseOrderFuel]
        SET 
            [Status] = @Status,
            [StatusBy] = @StatusBy,
            [StatusDate] = @StatusDate,
            [Remarks] = @Remarks,
            [RejectionReason] = @RejectionReason,
            [ApprovedDate] = CASE WHEN @Status = 1 THEN @StatusDate ELSE [ApprovedDate] END,
            [DisapprovedDate] = CASE WHEN @Status = 4 THEN @StatusDate ELSE [DisapprovedDate] END
        WHERE [OID] = @OID;
    END
    ELSE
    BEGIN
        UPDATE [dbo].[PurchaseOrder]
        SET 
            [Status] = @Status,
            [StatusBy] = @StatusBy,
            [StatusDate] = @StatusDate,
            [Remarks] = @Remarks,
            [RejectionReason] = @RejectionReason,
            [ApprovedDate] = CASE WHEN @Status = 1 THEN @StatusDate ELSE [ApprovedDate] END,
            [DisapprovedDate] = CASE WHEN @Status = 4 THEN @StatusDate ELSE [DisapprovedDate] END
        WHERE [OID] = @OID;
    END

    IF @Status = 1
    BEGIN
        UPDATE [dbo].[GenJournalHeader] 
        SET [Approved] = 1 
        WHERE [OID] = @OID;
    END
END
GO
