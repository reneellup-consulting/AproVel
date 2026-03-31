USE [GVLAPRVL]
GO

/****** Object:  View [dbo].[vAllPurchaseOrderDetail_ReSync]    Script Date: 02/26/2026 9:47:37 am ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE OR ALTER   VIEW [dbo].[vAllPurchaseOrderDetail_ReSync] AS

SELECT 
	p.OID, 
	p.GenJournalID, 
	i.Description AS Item, 
    r.Name AS Requestor, 
    c.Description AS ChargeTo, 
    p.Quantity, 
    u.Code AS UOM, 
    p.BaseCost, 
    p.Quantity * p.BaseCost AS Total, 
    p.Remarks AS Reason, 
    
	CASE
        WHEN p.LineApprovalStatus = 0 THEN 'Hold'
        WHEN p.LineApprovalStatus = 1 THEN 'Released'
        ELSE 'Hold' 
    END AS LineApprovalStatus,
    
	CONCAT_WS('/', f.Code, d.Code) AS Department,
	q.SourceNo AS RequisitionNo, 
    p.LineDiscount, 
    p.Quantity - p.Received AS RemainingQty, 
    
	/* Fuel Specifics */
	NULL AS Origin, 
    NULL AS Destination, 
    NULL AS CodeNo,
    NULL AS Tad, 

	gjh.IsSynced,
    gjh.ReSynced, -- Expose ReSynced status of the parent
    'General' AS RecordType

FROM PurchaseOrderDetail p
-- Join parent GenJournalHeader to access IsSynced and ReSynced flags
INNER JOIN GenJournalHeader gjh ON gjh.Oid = p.GenJournalID 
LEFT JOIN Item i ON i.Oid = p.ItemNo
LEFT JOIN Contact r ON r.Oid = p.RequestedBy
LEFT JOIN CostCenter c ON c.Oid = p.CostCenter
LEFT JOIN UnitOfMeasure u ON u.Oid = p.UOM
LEFT JOIN Facility f ON f.Oid = p.Facility
LEFT JOIN Department d ON d.Oid = p.Department
LEFT JOIN GenJournalHeader q ON q.Oid = p.RequisitionNo
-- Filter by the parent header's sync status
WHERE gjh.IsSynced = 1 AND gjh.ReSynced = 1

UNION ALL

SELECT 
	p.OID, 
	p.GenJournalID, 
	i.Description AS Item, 
    r.Name AS Requestor, 
    c.Description AS ChargeTo, 
    p.Quantity, 
    u.Code AS UOM, 
    p.BaseCost, 
    p.Quantity * p.BaseCost AS Total, 
    p.Remarks AS Reason, 
    
	CASE
        WHEN p.LineApprovalStatus = 0 THEN 'Hold'
        WHEN p.LineApprovalStatus = 1 THEN 'Released'
        ELSE 'Hold' 
    END AS LineApprovalStatus,
    
	CONCAT_WS('/', f.Code, d.Code) AS Department,
	q.SourceNo AS RequisitionNo, 
    0 AS LineDiscount, 
    p.Quantity - p.Received AS RemainingQty, 
    
	/* Fuel Specifics */
	o.Code AS Origin, 
    t.Code AS Destination, 
	(SELECT tut.Code FROM TruckUnitType tut WHERE tut.Oid = e.UnitType) AS CodeNo,
	p.Tad, 

	gjh.IsSynced,
    gjh.ReSynced, -- Expose ReSynced status of the parent
    'Fuel' AS RecordType

FROM POrderFuelDetail p
-- Join parent GenJournalHeader to access IsSynced and ReSynced flags
INNER JOIN GenJournalHeader gjh ON gjh.Oid = p.GenJournalID 
LEFT JOIN Item i ON i.Oid = p.ItemNo
LEFT JOIN Contact r ON r.Oid = p.RequestedBy
LEFT JOIN CostCenter c ON c.Oid = p.CostCenter
LEFT JOIN UnitOfMeasure u ON u.Oid = p.UOM
LEFT JOIN Facility f ON f.Oid = p.Facility
LEFT JOIN Department d ON d.Oid = p.Department
LEFT JOIN GenJournalHeader q ON q.Oid = p.RequisitionNo
LEFT JOIN TripLocation o ON o.Oid = p.Origin
LEFT JOIN TripLocation t ON t.Oid = p.Destination
LEFT JOIN TariffFuelAllocation e ON e.Oid = p.CodeNo
-- Filter by the parent header's sync status
WHERE gjh.IsSynced = 1 AND gjh.ReSynced = 1

GO


