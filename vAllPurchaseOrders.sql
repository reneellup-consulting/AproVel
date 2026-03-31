USE [GVLAPRVL]
GO

/****** Object:  View [dbo].[vAllPurchaseOrders]    Script Date: 02/26/2026 11:29:01 am ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE OR ALTER   VIEW [dbo].[vAllPurchaseOrders] AS

-- 1. CTE to pre-calculate the total sum of lines for each order
WITH OrderLineTotals AS (
    SELECT 
        GenJournalID, 
        SUM(Quantity * BaseCost) AS CalculatedTotal
    FROM (
        SELECT GenJournalID, Quantity, BaseCost FROM [dbo].[PurchaseOrderDetail]
        UNION ALL
        SELECT GenJournalID, Quantity, BaseCost FROM [dbo].[POrderFuelDetail]
    ) AS Details
    GROUP BY GenJournalID
)

-- 1. General Purchase Orders
SELECT 
    p.OID,
    'General' AS PO_Type,
    p.ReferenceNo,
    p.Memo AS PONumber,
    p.Vendor,

    --p.Status,
    CASE 
        WHEN p.Status = 0 THEN 'Pending'
        WHEN p.Status = 1 THEN 'Approved'
		WHEN p.Status = 2 THEN 'Partial'
		WHEN p.Status = 3 THEN 'Received'
        WHEN p.Status = 4 THEN 'Rejected'
		WHEN p.Status = 5 THEN 'Pending'
        ELSE NULL 
    END AS Status,

	p.StatusBy,
    p.StatusDate,
    
	-- UPDATED: Uses the summed total from the CTE, falls back to p.Total if no lines exist
    COALESCE(ot.CalculatedTotal, p.Total, 0) AS TotalAmount,

    p.ExpectedDate,
    p.VendorAddress,
    p.ShipToAddress,

    -- Vendor Specifics
    v.Name AS VendorName,
    
    -- General Specifics
    p.Terms AS PaymentTerms,
    -- CAST NULL to VARCHAR to match the data type in the second part of the UNION
    CAST(NULL AS VARCHAR(50)) AS UnitNo,
	0 AS MeterRead,

	-- ADDED: Placeholder for TaggedTrip to match UNION structure
    CAST(NULL AS NVARCHAR(MAX)) AS TaggedTrips,
    
	'None' AS FuelUsageClass,
	NULL AS TripType,
	NULL AS PrevGasDate,
	NULL AS Driver,
    NULL AS PrevMeter,
    NULL AS NoOfLtrs,
    NULL AS FuelPrice,
	NULL AS PrevTotalAmt,
    NULL AS FuelCustomer,
    
    p.Remarks,
    p.Comments,
    p.AfterReopenAlterations AS History,
    p.IsReopened,
    p.ApprovedDate,

    -- GenJournalHeader Columns
    g.SourceNo,
    g.EntryDate,
    g.Approved AS JournalApproved,
	g.IsSynced,
	g.CreatedByAppwriteUserId,
	g.StatusByAppwriteUserId
FROM PurchaseOrder p
LEFT JOIN GenJournalHeader g ON p.OID = g.OID
LEFT JOIN Contact v ON p.Vendor = v.OID
LEFT JOIN OrderLineTotals ot ON p.OID = ot.GenJournalID -- ADDED JOIN
WHERE g.EntryDate >= '2025-01-01'
  AND (g.IsSynced IS NULL OR g.IsSynced = 0)

UNION ALL

-- 2. Fuel Purchase Orders
SELECT 
    f.OID,
    'Fuel' AS PO_Type,
    f.ReferenceNo,
    f.Memo AS PONumber,
    f.Vendor,

    --f.Status,
    CASE 
        WHEN f.Status = 0 THEN 'Pending'
        WHEN f.Status = 1 THEN 'Approved'
		WHEN f.Status = 2 THEN 'Partial'
		WHEN f.Status = 3 THEN 'Received'
        WHEN f.Status = 4 THEN 'Rejected'
		WHEN f.Status = 5 THEN 'Pending'
        ELSE NULL 
    END AS Status,
    
	f.StatusBy,
    f.StatusDate,

    -- UPDATED: Uses the summed total from the CTE, falls back to f.Total if no lines exist
    COALESCE(ot.CalculatedTotal, f.Total, 0) AS TotalAmount,

    f.ExpectedDate,
    f.VendorAddress,
    f.ShipToAddress,

    -- Vendor Specifics
    v.Name AS VendorName,
    
    -- Fuel Specifics
    NULL AS PaymentTerms,

    -- CORRECTED: Select the readable UnitNo from the joined table 't'
    CASE 
        WHEN f.TruckOrGenset = 2 THEN 'None'               -- NotApplicable
        WHEN t.UnitNo IS NOT NULL THEN t.UnitNo            -- Found in Fleet View
        -- Fallback: If joined record is missing, show the raw GUID or a specific text
        WHEN f.TruckOrGenset = 0 THEN CAST(f.TruckNo AS VARCHAR(50)) 
        WHEN f.TruckOrGenset = 1 THEN CAST(f.GensetNo AS VARCHAR(50))
        WHEN f.TruckOrGenset = 3 THEN CAST(f.OtherNo AS VARCHAR(50))
        ELSE NULL 
    END AS UnitNo,

	CASE 
        WHEN f.TruckOrGenset = 2 THEN 0
        WHEN f.TruckOrGenset = 0 THEN f.OdoRead
        WHEN f.TruckOrGenset = 1 THEN f.MtrRead
        WHEN f.TruckOrGenset = 3 THEN f.OthRead
        ELSE NULL 
    END AS MeterRead,

	-- ADDED: TaggedTrip (Using FOR XML PATH for compatibility)
    -- THIS SECTION REPLACES THE ERROR CODE
    (
        SELECT STUFF((
            SELECT ', ' + CAST(trip.DocumentNo AS NVARCHAR(MAX))
            FROM [dbo].[vFuelTaggedTrips] trip  -- <--- UPDATE THIS TABLE NAME
            WHERE trip.HeaderID = f.OID        -- <--- UPDATE THIS COLUMN MATCH
            FOR XML PATH(''), TYPE
        ).value('.', 'NVARCHAR(MAX)'), 1, 2, '')
    ) AS TaggedTrips,

	CASE
        WHEN f.FuelUsageClassification = 0 THEN 'None'
        WHEN f.FuelUsageClassification = 1 THEN 'Operation'
        WHEN f.FuelUsageClassification = 2 THEN 'Income'
        ELSE NULL 
	END AS FuelUsageClass,

	r.Type AS TripType,

	f.PrevDate AS PrevGasDate,
    d.Name AS Driver,

	CASE
        WHEN f.TruckOrGenset = 0 THEN f.PrevOdoRead
		WHEN f.TruckOrGenset = 2 THEN 0
        WHEN f.TruckOrGenset = 1 THEN f.PrevHrsRead
        WHEN f.TruckOrGenset = 3 THEN f.PrevOdoRead
        ELSE NULL 
    END AS PrevMeter,

    f.NoOfLtrs,
    f.Price AS FuelPrice,
	f.PrevTotalAmt,
    c.Name AS FuelCustomer,
    
    f.Remarks,
    f.Comments,
    f.AfterReopenAlterations AS History,
    f.IsReopened,
    f.ApprovedDate,

    -- GenJournalHeader Columns
    g.SourceNo,
    g.EntryDate,
    g.Approved AS JournalApproved,
	g.IsSynced,
	g.CreatedByAppwriteUserId,
	g.StatusByAppwriteUserId
FROM PurchaseOrderFuel f
LEFT JOIN GenJournalHeader g ON f.OID = g.OID
LEFT JOIN Contact v ON f.Vendor = v.OID
LEFT JOIN Contact c ON f.Customer = c.OID
LEFT JOIN Contact d ON f.Driver = d.OID
-- CORRECTED JOIN: Match the Vehicle View's OID (t.Oid) to the Transaction's Vehicle ID
LEFT JOIN vFleetVehicles t ON t.Oid = 
    CASE 
        WHEN f.TruckOrGenset = 0 THEN f.TruckNo     -- 0 = Truck
        WHEN f.TruckOrGenset = 1 THEN f.GensetNo    -- 1 = Genset
        WHEN f.TruckOrGenset = 3 THEN f.OtherNo     -- 3 = Other
        ELSE NULL                                   -- 2 = NotApplicable
    END
LEFT JOIN TripType r ON r.OID = f.TripType
LEFT JOIN OrderLineTotals ot ON f.OID = ot.GenJournalID -- ADDED JOIN
WHERE g.EntryDate >= '2025-01-01'
  AND (g.IsSynced IS NULL OR g.IsSynced = 0);
GO


