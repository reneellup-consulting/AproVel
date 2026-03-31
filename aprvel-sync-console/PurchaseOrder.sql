USE [GVLAPRVL]
GO

/****** Object:  Table [dbo].[PurchaseOrder]    Script Date: 03/06/2026 10:08:51 am ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[PurchaseOrder](
	[OID] [int] NOT NULL,
	[ReferenceNo] [nvarchar](100) NULL,
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
	[Total] [money] NULL,
	[Remarks] [nvarchar](max) NULL,
	[ApprovedDate] [datetime] NULL,
	[DisapprovedDate] [datetime] NULL,
	[PendingDate] [datetime] NULL,
	[_Total] [money] NULL,
	[ManualPrinted] [bit] NULL,
	[Printed] [bit] NULL,
	[AfterReopenAlterations] [nvarchar](max) NULL,
	[IsReopened] [bit] NULL,
	[IsOnlineFrs] [bit] NULL,
	[RejectionReason] [nvarchar](500) NULL,
 CONSTRAINT [PK_PurchaseOrder] PRIMARY KEY CLUSTERED 
(
	[OID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[PurchaseOrder]  WITH NOCHECK ADD  CONSTRAINT [FK_PurchaseOrder_OID] FOREIGN KEY([OID])
REFERENCES [dbo].[GenJournalHeader] ([OID])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[PurchaseOrder] CHECK CONSTRAINT [FK_PurchaseOrder_OID]
GO

ALTER TABLE [dbo].[PurchaseOrder]  WITH NOCHECK ADD  CONSTRAINT [FK_PurchaseOrder_ShipVia] FOREIGN KEY([ShipVia])
REFERENCES [dbo].[ShipVia] ([Oid])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[PurchaseOrder] CHECK CONSTRAINT [FK_PurchaseOrder_ShipVia]
GO

ALTER TABLE [dbo].[PurchaseOrder]  WITH NOCHECK ADD  CONSTRAINT [FK_PurchaseOrder_Terms] FOREIGN KEY([Terms])
REFERENCES [dbo].[Terms] ([Oid])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[PurchaseOrder] CHECK CONSTRAINT [FK_PurchaseOrder_Terms]
GO

ALTER TABLE [dbo].[PurchaseOrder]  WITH NOCHECK ADD  CONSTRAINT [FK_PurchaseOrder_Vendor] FOREIGN KEY([Vendor])
REFERENCES [dbo].[Vendor] ([Oid])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[PurchaseOrder] CHECK CONSTRAINT [FK_PurchaseOrder_Vendor]
GO


