USE [GVLAPRVL]
GO

/****** Object:  Table [dbo].[PurchaseOrderFuel]    Script Date: 03/06/2026 10:09:40 am ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[PurchaseOrderFuel](
	[OID] [int] NOT NULL,
	[ReferenceNo] [nvarchar](max) NULL,
	[Memo] [nvarchar](1000) NULL,
	[Comments] [nvarchar](500) NULL,
	[Status] [int] NULL,
	[StatusBy] [nvarchar](100) NULL,
	[StatusDate] [datetime] NULL,
	[Vendor] [uniqueidentifier] NULL,
	[VendorAddress] [nvarchar](500) NULL,
	[ShipToAddress] [nvarchar](500) NULL,
	[Terms] [uniqueidentifier] NULL,
	[ShipVia] [uniqueidentifier] NULL,
	[ExpectedDate] [datetime] NULL,
	[TruckOrGenset] [int] NULL,
	[TruckNo] [uniqueidentifier] NULL,
	[GensetNo] [uniqueidentifier] NULL,
	[Driver] [uniqueidentifier] NULL,
	[PrevDate] [datetime] NULL,
	[PrevOdoRead] [money] NULL,
	[PrevHrsRead] [money] NULL,
	[NoOfLtrs] [money] NULL,
	[Price] [money] NULL,
	[PrevTotalAmt] [money] NULL,
	[Total] [money] NULL,
	[TripType] [int] NULL,
	[Customer] [uniqueidentifier] NULL,
	[OtherNo] [uniqueidentifier] NULL,
	[OdoRead] [money] NULL,
	[MtrRead] [money] NULL,
	[OtherVehicle] [uniqueidentifier] NULL,
	[OthRead] [money] NULL,
	[FuelUsageClassification] [int] NULL,
	[PrevLife] [money] NULL,
	[PrevPrice] [money] NULL,
	[IsReopened] [bit] NULL,
	[AfterReopenAlterations] [nvarchar](max) NULL,
	[Remarks] [nvarchar](max) NULL,
	[ApprovedDate] [datetime] NULL,
	[DisapprovedDate] [datetime] NULL,
	[PendingDate] [datetime] NULL,
	[ManualPrinted] [bit] NULL,
	[Printed] [bit] NULL,
	[_Total] [money] NULL,
	[RejectionReason] [nvarchar](500) NULL,
 CONSTRAINT [PK_PurchaseOrderFuel] PRIMARY KEY CLUSTERED 
(
	[OID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[PurchaseOrderFuel]  WITH NOCHECK ADD  CONSTRAINT [FK_PurchaseOrderFuel_Customer] FOREIGN KEY([Customer])
REFERENCES [dbo].[Customer] ([Oid])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[PurchaseOrderFuel] CHECK CONSTRAINT [FK_PurchaseOrderFuel_Customer]
GO

ALTER TABLE [dbo].[PurchaseOrderFuel]  WITH NOCHECK ADD  CONSTRAINT [FK_PurchaseOrderFuel_Driver] FOREIGN KEY([Driver])
REFERENCES [dbo].[Employee] ([Oid])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[PurchaseOrderFuel] CHECK CONSTRAINT [FK_PurchaseOrderFuel_Driver]
GO

ALTER TABLE [dbo].[PurchaseOrderFuel]  WITH NOCHECK ADD  CONSTRAINT [FK_PurchaseOrderFuel_GensetNo] FOREIGN KEY([GensetNo])
REFERENCES [dbo].[FAGeneratorSet] ([Oid])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[PurchaseOrderFuel] CHECK CONSTRAINT [FK_PurchaseOrderFuel_GensetNo]
GO

ALTER TABLE [dbo].[PurchaseOrderFuel]  WITH NOCHECK ADD  CONSTRAINT [FK_PurchaseOrderFuel_OID] FOREIGN KEY([OID])
REFERENCES [dbo].[GenJournalHeader] ([OID])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[PurchaseOrderFuel] CHECK CONSTRAINT [FK_PurchaseOrderFuel_OID]
GO

ALTER TABLE [dbo].[PurchaseOrderFuel]  WITH NOCHECK ADD  CONSTRAINT [FK_PurchaseOrderFuel_OtherNo] FOREIGN KEY([OtherNo])
REFERENCES [dbo].[FAOtherVehicle] ([Oid])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[PurchaseOrderFuel] CHECK CONSTRAINT [FK_PurchaseOrderFuel_OtherNo]
GO

ALTER TABLE [dbo].[PurchaseOrderFuel]  WITH NOCHECK ADD  CONSTRAINT [FK_PurchaseOrderFuel_OtherVehicle] FOREIGN KEY([OtherVehicle])
REFERENCES [dbo].[FAOtherVehicle] ([Oid])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[PurchaseOrderFuel] CHECK CONSTRAINT [FK_PurchaseOrderFuel_OtherVehicle]
GO

ALTER TABLE [dbo].[PurchaseOrderFuel]  WITH NOCHECK ADD  CONSTRAINT [FK_PurchaseOrderFuel_ShipVia] FOREIGN KEY([ShipVia])
REFERENCES [dbo].[ShipVia] ([Oid])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[PurchaseOrderFuel] CHECK CONSTRAINT [FK_PurchaseOrderFuel_ShipVia]
GO

ALTER TABLE [dbo].[PurchaseOrderFuel]  WITH NOCHECK ADD  CONSTRAINT [FK_PurchaseOrderFuel_Terms] FOREIGN KEY([Terms])
REFERENCES [dbo].[Terms] ([Oid])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[PurchaseOrderFuel] CHECK CONSTRAINT [FK_PurchaseOrderFuel_Terms]
GO

ALTER TABLE [dbo].[PurchaseOrderFuel]  WITH NOCHECK ADD  CONSTRAINT [FK_PurchaseOrderFuel_TripType] FOREIGN KEY([TripType])
REFERENCES [dbo].[TripType] ([OID])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[PurchaseOrderFuel] CHECK CONSTRAINT [FK_PurchaseOrderFuel_TripType]
GO

ALTER TABLE [dbo].[PurchaseOrderFuel]  WITH NOCHECK ADD  CONSTRAINT [FK_PurchaseOrderFuel_TruckNo] FOREIGN KEY([TruckNo])
REFERENCES [dbo].[FATruck] ([Oid])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[PurchaseOrderFuel] CHECK CONSTRAINT [FK_PurchaseOrderFuel_TruckNo]
GO

ALTER TABLE [dbo].[PurchaseOrderFuel]  WITH NOCHECK ADD  CONSTRAINT [FK_PurchaseOrderFuel_Vendor] FOREIGN KEY([Vendor])
REFERENCES [dbo].[Vendor] ([Oid])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[PurchaseOrderFuel] CHECK CONSTRAINT [FK_PurchaseOrderFuel_Vendor]
GO


