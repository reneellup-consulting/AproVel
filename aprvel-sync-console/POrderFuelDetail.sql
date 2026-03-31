USE [GVLAPRVL]
GO

/****** Object:  Table [dbo].[POrderFuelDetail]    Script Date: 03/05/2026 1:14:33 pm ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[POrderFuelDetail](
	[OID] [int] IDENTITY(1,1) NOT FOR REPLICATION NOT NULL,
	[RowID] [uniqueidentifier] NULL,
	[GenJournalID] [int] NULL,
	[ItemNo] [uniqueidentifier] NULL,
	[Description] [nvarchar](100) NULL,
	[Quantity] [money] NULL,
	[UOM] [uniqueidentifier] NULL,
	[Factor] [money] NULL,
	[BaseCost] [money] NULL,
	[Received] [money] NULL,
	[OdoReading] [money] NULL,
	[CreatedBy] [nvarchar](100) NULL,
	[CreatedOn] [datetime] NULL,
	[ModifiedBy] [nvarchar](100) NULL,
	[ModifiedOn] [datetime] NULL,
	[OptimisticLockField] [int] NULL,
	[skipAuto] [bit] NULL,
	[Tariff] [uniqueidentifier] NULL,
	[CodeNo] [uniqueidentifier] NULL,
	[Tad] [money] NULL,
	[Origin] [uniqueidentifier] NULL,
	[Destination] [uniqueidentifier] NULL,
	[CostCenter] [uniqueidentifier] NULL,
	[StockTo] [uniqueidentifier] NULL,
	[RequisitionNo] [int] NULL,
	[RequisitionReq] [bit] NULL,
	[PettyCashID] [int] NULL,
	[RequestedBy] [uniqueidentifier] NULL,
	[LineApprovalStatus] [int] NULL,
	[Facility] [uniqueidentifier] NULL,
	[Department] [uniqueidentifier] NULL,
	[DepartmentInCharge] [uniqueidentifier] NULL,
	[FacilityHead] [uniqueidentifier] NULL,
	[Remarks] [nvarchar](max) NULL,
	[RequestID] [uniqueidentifier] NULL,
	[IsSynced] [bit] NULL,
 CONSTRAINT [PK_POrderFuelDetail] PRIMARY KEY CLUSTERED 
(
	[OID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[POrderFuelDetail]  WITH NOCHECK ADD  CONSTRAINT [FK_POrderFuelDetail_CodeNo] FOREIGN KEY([CodeNo])
REFERENCES [dbo].[TariffFuelAllocation] ([Oid])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[POrderFuelDetail] CHECK CONSTRAINT [FK_POrderFuelDetail_CodeNo]
GO

ALTER TABLE [dbo].[POrderFuelDetail]  WITH NOCHECK ADD  CONSTRAINT [FK_POrderFuelDetail_CostCenter] FOREIGN KEY([CostCenter])
REFERENCES [dbo].[CostCenter] ([Oid])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[POrderFuelDetail] CHECK CONSTRAINT [FK_POrderFuelDetail_CostCenter]
GO

ALTER TABLE [dbo].[POrderFuelDetail]  WITH NOCHECK ADD  CONSTRAINT [FK_POrderFuelDetail_Department] FOREIGN KEY([Department])
REFERENCES [dbo].[Department] ([Oid])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[POrderFuelDetail] CHECK CONSTRAINT [FK_POrderFuelDetail_Department]
GO

ALTER TABLE [dbo].[POrderFuelDetail]  WITH NOCHECK ADD  CONSTRAINT [FK_POrderFuelDetail_DepartmentInCharge] FOREIGN KEY([DepartmentInCharge])
REFERENCES [dbo].[Employee] ([Oid])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[POrderFuelDetail] CHECK CONSTRAINT [FK_POrderFuelDetail_DepartmentInCharge]
GO

ALTER TABLE [dbo].[POrderFuelDetail]  WITH NOCHECK ADD  CONSTRAINT [FK_POrderFuelDetail_Destination] FOREIGN KEY([Destination])
REFERENCES [dbo].[TripLocation] ([Oid])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[POrderFuelDetail] CHECK CONSTRAINT [FK_POrderFuelDetail_Destination]
GO

ALTER TABLE [dbo].[POrderFuelDetail]  WITH NOCHECK ADD  CONSTRAINT [FK_POrderFuelDetail_Facility] FOREIGN KEY([Facility])
REFERENCES [dbo].[Facility] ([Oid])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[POrderFuelDetail] CHECK CONSTRAINT [FK_POrderFuelDetail_Facility]
GO

ALTER TABLE [dbo].[POrderFuelDetail]  WITH NOCHECK ADD  CONSTRAINT [FK_POrderFuelDetail_FacilityHead] FOREIGN KEY([FacilityHead])
REFERENCES [dbo].[Employee] ([Oid])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[POrderFuelDetail] CHECK CONSTRAINT [FK_POrderFuelDetail_FacilityHead]
GO

ALTER TABLE [dbo].[POrderFuelDetail]  WITH NOCHECK ADD  CONSTRAINT [FK_POrderFuelDetail_GenJournalID] FOREIGN KEY([GenJournalID])
REFERENCES [dbo].[GenJournalHeader] ([OID])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[POrderFuelDetail] CHECK CONSTRAINT [FK_POrderFuelDetail_GenJournalID]
GO

ALTER TABLE [dbo].[POrderFuelDetail]  WITH NOCHECK ADD  CONSTRAINT [FK_POrderFuelDetail_ItemNo] FOREIGN KEY([ItemNo])
REFERENCES [dbo].[FuelItem] ([Oid])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[POrderFuelDetail] CHECK CONSTRAINT [FK_POrderFuelDetail_ItemNo]
GO

ALTER TABLE [dbo].[POrderFuelDetail]  WITH NOCHECK ADD  CONSTRAINT [FK_POrderFuelDetail_Origin] FOREIGN KEY([Origin])
REFERENCES [dbo].[TripLocation] ([Oid])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[POrderFuelDetail] CHECK CONSTRAINT [FK_POrderFuelDetail_Origin]
GO

ALTER TABLE [dbo].[POrderFuelDetail]  WITH NOCHECK ADD  CONSTRAINT [FK_POrderFuelDetail_PettyCashID] FOREIGN KEY([PettyCashID])
REFERENCES [dbo].[GenJournalDetail] ([OID])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[POrderFuelDetail] CHECK CONSTRAINT [FK_POrderFuelDetail_PettyCashID]
GO

ALTER TABLE [dbo].[POrderFuelDetail]  WITH NOCHECK ADD  CONSTRAINT [FK_POrderFuelDetail_RequestedBy] FOREIGN KEY([RequestedBy])
REFERENCES [dbo].[Employee] ([Oid])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[POrderFuelDetail] CHECK CONSTRAINT [FK_POrderFuelDetail_RequestedBy]
GO

ALTER TABLE [dbo].[POrderFuelDetail]  WITH NOCHECK ADD  CONSTRAINT [FK_POrderFuelDetail_RequisitionNo] FOREIGN KEY([RequisitionNo])
REFERENCES [dbo].[Requisition] ([OID])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[POrderFuelDetail] CHECK CONSTRAINT [FK_POrderFuelDetail_RequisitionNo]
GO

ALTER TABLE [dbo].[POrderFuelDetail]  WITH NOCHECK ADD  CONSTRAINT [FK_POrderFuelDetail_StockTo] FOREIGN KEY([StockTo])
REFERENCES [dbo].[Warehouse] ([Oid])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[POrderFuelDetail] CHECK CONSTRAINT [FK_POrderFuelDetail_StockTo]
GO

ALTER TABLE [dbo].[POrderFuelDetail]  WITH NOCHECK ADD  CONSTRAINT [FK_POrderFuelDetail_Tariff] FOREIGN KEY([Tariff])
REFERENCES [dbo].[Tariff] ([Oid])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[POrderFuelDetail] CHECK CONSTRAINT [FK_POrderFuelDetail_Tariff]
GO

ALTER TABLE [dbo].[POrderFuelDetail]  WITH NOCHECK ADD  CONSTRAINT [FK_POrderFuelDetail_UOM] FOREIGN KEY([UOM])
REFERENCES [dbo].[UnitOfMeasure] ([Oid])
NOT FOR REPLICATION 
GO

ALTER TABLE [dbo].[POrderFuelDetail] CHECK CONSTRAINT [FK_POrderFuelDetail_UOM]
GO


