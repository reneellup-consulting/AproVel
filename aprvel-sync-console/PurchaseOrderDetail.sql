USE [GVLAPRVL]
GO

/****** Object:  Table [dbo].[PurchaseOrderDetail]    Script Date: 03/05/2026 1:11:11 pm ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[PurchaseOrderDetail](
	[OID] [int] IDENTITY(1,1) NOT FOR REPLICATION NOT NULL,
	[RowID] [uniqueidentifier] NULL,
	[GenJournalID] [int] NULL,
	[ItemNo] [uniqueidentifier] NULL,
	[Description] [nvarchar](100) NULL,
	[Quantity] [money] NULL,
	[UOM] [uniqueidentifier] NULL,
	[Factor] [money] NULL,
	[BaseCost] [money] NULL,
	[CreatedBy] [nvarchar](100) NULL,
	[CreatedOn] [datetime] NULL,
	[ModifiedBy] [nvarchar](100) NULL,
	[ModifiedOn] [datetime] NULL,
	[OptimisticLockField] [int] NULL,
	[Received] [money] NULL,
	[RequestID] [uniqueidentifier] NULL,
	[CostCenter] [uniqueidentifier] NULL,
	[RequestedBy] [uniqueidentifier] NULL,
	[RequisitionNo] [int] NULL,
	[LineApprovalStatus] [int] NULL,
	[Remarks] [nvarchar](max) NULL,
	[skipAuto] [bit] NULL,
	[LineDiscPercent] [money] NULL,
	[LineDiscount] [money] NULL,
	[Facility] [uniqueidentifier] NULL,
	[Department] [uniqueidentifier] NULL,
	[FacilityHead] [uniqueidentifier] NULL,
	[DepartmentInCharge] [uniqueidentifier] NULL,
	[StockTo] [uniqueidentifier] NULL,
	[PettyCashID] [int] NULL,
	[RequisitionReq] [bit] NULL,
	[IsSynced] [bit] NULL,
 CONSTRAINT [PK_PurchaseOrderDetail] PRIMARY KEY CLUSTERED 
(
	[OID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[PurchaseOrderDetail]  WITH NOCHECK ADD  CONSTRAINT [FK_PurchaseOrderDetail_CostCenter] FOREIGN KEY([CostCenter])
REFERENCES [dbo].[CostCenter] ([Oid])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[PurchaseOrderDetail] CHECK CONSTRAINT [FK_PurchaseOrderDetail_CostCenter]
GO

ALTER TABLE [dbo].[PurchaseOrderDetail]  WITH NOCHECK ADD  CONSTRAINT [FK_PurchaseOrderDetail_Department] FOREIGN KEY([Department])
REFERENCES [dbo].[Department] ([Oid])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[PurchaseOrderDetail] CHECK CONSTRAINT [FK_PurchaseOrderDetail_Department]
GO

ALTER TABLE [dbo].[PurchaseOrderDetail]  WITH NOCHECK ADD  CONSTRAINT [FK_PurchaseOrderDetail_DepartmentInCharge] FOREIGN KEY([DepartmentInCharge])
REFERENCES [dbo].[Employee] ([Oid])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[PurchaseOrderDetail] CHECK CONSTRAINT [FK_PurchaseOrderDetail_DepartmentInCharge]
GO

ALTER TABLE [dbo].[PurchaseOrderDetail]  WITH NOCHECK ADD  CONSTRAINT [FK_PurchaseOrderDetail_Facility] FOREIGN KEY([Facility])
REFERENCES [dbo].[Facility] ([Oid])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[PurchaseOrderDetail] CHECK CONSTRAINT [FK_PurchaseOrderDetail_Facility]
GO

ALTER TABLE [dbo].[PurchaseOrderDetail]  WITH NOCHECK ADD  CONSTRAINT [FK_PurchaseOrderDetail_FacilityHead] FOREIGN KEY([FacilityHead])
REFERENCES [dbo].[Employee] ([Oid])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[PurchaseOrderDetail] CHECK CONSTRAINT [FK_PurchaseOrderDetail_FacilityHead]
GO

ALTER TABLE [dbo].[PurchaseOrderDetail]  WITH NOCHECK ADD  CONSTRAINT [FK_PurchaseOrderDetail_GenJournalID] FOREIGN KEY([GenJournalID])
REFERENCES [dbo].[GenJournalHeader] ([OID])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[PurchaseOrderDetail] CHECK CONSTRAINT [FK_PurchaseOrderDetail_GenJournalID]
GO

ALTER TABLE [dbo].[PurchaseOrderDetail]  WITH NOCHECK ADD  CONSTRAINT [FK_PurchaseOrderDetail_ItemNo] FOREIGN KEY([ItemNo])
REFERENCES [dbo].[Item] ([Oid])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[PurchaseOrderDetail] CHECK CONSTRAINT [FK_PurchaseOrderDetail_ItemNo]
GO

ALTER TABLE [dbo].[PurchaseOrderDetail]  WITH NOCHECK ADD  CONSTRAINT [FK_PurchaseOrderDetail_PettyCashID] FOREIGN KEY([PettyCashID])
REFERENCES [dbo].[GenJournalDetail] ([OID])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[PurchaseOrderDetail] CHECK CONSTRAINT [FK_PurchaseOrderDetail_PettyCashID]
GO

ALTER TABLE [dbo].[PurchaseOrderDetail]  WITH NOCHECK ADD  CONSTRAINT [FK_PurchaseOrderDetail_RequestedBy] FOREIGN KEY([RequestedBy])
REFERENCES [dbo].[Employee] ([Oid])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[PurchaseOrderDetail] CHECK CONSTRAINT [FK_PurchaseOrderDetail_RequestedBy]
GO

ALTER TABLE [dbo].[PurchaseOrderDetail]  WITH NOCHECK ADD  CONSTRAINT [FK_PurchaseOrderDetail_RequisitionNo] FOREIGN KEY([RequisitionNo])
REFERENCES [dbo].[Requisition] ([OID])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[PurchaseOrderDetail] CHECK CONSTRAINT [FK_PurchaseOrderDetail_RequisitionNo]
GO

ALTER TABLE [dbo].[PurchaseOrderDetail]  WITH NOCHECK ADD  CONSTRAINT [FK_PurchaseOrderDetail_StockTo] FOREIGN KEY([StockTo])
REFERENCES [dbo].[Warehouse] ([Oid])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[PurchaseOrderDetail] CHECK CONSTRAINT [FK_PurchaseOrderDetail_StockTo]
GO

ALTER TABLE [dbo].[PurchaseOrderDetail]  WITH NOCHECK ADD  CONSTRAINT [FK_PurchaseOrderDetail_UOM] FOREIGN KEY([UOM])
REFERENCES [dbo].[UnitOfMeasure] ([Oid])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[PurchaseOrderDetail] CHECK CONSTRAINT [FK_PurchaseOrderDetail_UOM]
GO


