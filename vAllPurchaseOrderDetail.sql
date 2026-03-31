USE [GVLAPRVL]
GO

/****** Object:  View [dbo].[vAllPurchaseOrdreDetails]    Script Date: 02/25/2026 10:50:24 am ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE OR ALTER   VIEW [dbo].[vAllPurchaseOrdreDetails] AS

SELECT 

	p.OID, --line_ref_id
	p.GenJournalID, --parent_ref_id
	i.Description AS Item, --"item": "",
    r.Name AS Requestor, --"requestor": "",
    c.Description AS ChargeTo, --"charge_to": "",
    p.Quantity, --"quantity": 0,
    u.Code AS UOM, --"unit_of_measure": "",
    p.BaseCost, --"unit_cost": 0,
    p.Quantity * p.BaseCost AS Total, --"total": 0,
    p.Remarks AS Reason, --"reason": "",
    
	--"line_status": "",
	CASE
        WHEN p.LineApprovalStatus = 0 THEN 'Hold'
        WHEN p.LineApprovalStatus = 1 THEN 'Released'
        ELSE 'Hold' 
    END AS LineApprovalStatus,
    
	--"facility_department": "",
	CONCAT_WS('/', 
        f.Code, 
        d.Code
    ) AS Department,
    
	q.SourceNo AS RequisitionNo, --"requisition_no": "",
    p.LineDiscount, --"discount": 0,
    p.Quantity - p.Received AS RemainingQty, --"remaining_qty": 0,
    
	/* Fuel Specifics */
	NULL AS Origin, --"origin": "",
    NULL AS Destination, --"destination": "",
    NULL AS CodeNo,--"code_no": "",
    NULL AS Tad, --"tad": 0,

	p.IsSynced,
	'General' AS RecordType

FROM PurchaseOrderDetail p
-- ItemNo i
LEFT JOIN Item i ON i.Oid = p.ItemNo
-- RequestedBy r
LEFT JOIN Contact r ON r.Oid = p.RequestedBy
-- CostCenter c
LEFT JOIN CostCenter c ON c.Oid = p.CostCenter
-- UOM u
LEFT JOIN UnitOfMeasure u ON u.Oid = p.UOM
-- Facility f
LEFT JOIN Facility f ON f.Oid = p.Facility
-- Department d
LEFT JOIN Department d ON d.Oid = p.Department
-- RequistionNo q
LEFT JOIN GenJournalHeader q ON q.Oid = p.RequisitionNo
-- Origin o
-- Destination t
-- CodeNo e
-- GenJournalHeader g (for parent EntryDate filter)
LEFT JOIN GenJournalHeader g ON p.GenJournalID = g.Oid
WHERE (p.IsSynced IS NULL OR p.IsSynced = 0)
  AND g.EntryDate >= '2025-01-01'

UNION ALL

SELECT 

	p.OID, --line_ref_id
	p.GenJournalID, --parent_ref_id
	i.Description AS Item, --"item": "",
    r.Name AS Requestor, --"requestor": "",
    c.Description AS ChargeTo, --"charge_to": "",
    p.Quantity, --"quantity": 0,
    u.Code AS UOM, --"unit_of_measure": "",
    p.BaseCost, --"unit_cost": 0,
    p.Quantity * p.BaseCost AS Total, --"total": 0,
    p.Remarks AS Reason, --"reason": "",
    
	--"line_status": "",
	CASE
        WHEN p.LineApprovalStatus = 0 THEN 'Hold'
        WHEN p.LineApprovalStatus = 1 THEN 'Released'
        ELSE 'Hold' 
    END AS LineApprovalStatus,
    
	--"facility_department": "",
	CONCAT_WS('/', 
        f.Code, 
        d.Code
    ) AS Department,
    
	q.SourceNo AS RequisitionNo, --"requisition_no": "",
    0 AS LineDiscount, --"discount": 0,
    p.Quantity - p.Received AS RemainingQty, --"remaining_qty": 0,
    
	/* Fuel Specifics */
	o.Code AS Origin, --"origin": "",
    t.Code AS Destination, --"destination": "",
    
	--e.UnitType as CodeNo,--"code_no": "",
	(
		SELECT 
			tut.Code 
		FROM TruckUnitType tut 
		WHERE tut.Oid = e.UnitType
	) AS CodeNo,
    
	p.Tad, --"tad": 0,

	p.IsSynced,
	'Fuel' AS RecordType

FROM POrderFuelDetail p
-- ItemNo i
LEFT JOIN Item i ON i.Oid = p.ItemNo
-- RequestedBy r
LEFT JOIN Contact r ON r.Oid = p.RequestedBy
-- CostCenter c
LEFT JOIN CostCenter c ON c.Oid = p.CostCenter
-- UOM u
LEFT JOIN UnitOfMeasure u ON u.Oid = p.UOM
-- Facility f
LEFT JOIN Facility f ON f.Oid = p.Facility
-- Department d
LEFT JOIN Department d ON d.Oid = p.Department
-- RequistionNo q
LEFT JOIN GenJournalHeader q ON q.Oid = p.RequisitionNo
-- Origin o
LEFT JOIN TripLocation o ON o.Oid = p.Origin
-- Destination t
LEFT JOIN TripLocation t ON t.Oid = p.Destination
-- CodeNo e
LEFT JOIN TariffFuelAllocation e ON e.Oid = p.CodeNo
-- GenJournalHeader g (for parent EntryDate filter)
LEFT JOIN GenJournalHeader g ON p.GenJournalID = g.Oid
WHERE (p.IsSynced IS NULL OR p.IsSynced = 0)
  AND g.EntryDate >= '2025-01-01'

GO


