import { ButtonAction } from "@/components/button-action";
import { Collapsible } from "@/components/collapsible";
import { ConfirmationSheet } from "@/components/confirmation-sheet";
import { OrderLineDetailSheet } from "@/components/order-line-detail-sheet";
import { OrderLineItem } from "@/components/order-line-item";
import { ScreenHeader } from "@/components/screen-header";
import { TabHeader } from "@/components/tab-header";
import { STATUS_STYLES } from "@/constants";
import { useOrderDetails } from "@/hooks/use-order-details";
import { useAppColors } from "@/hooks/useAppColors";
import { useFinalHeaderHeight } from "@/hooks/useFinalHeaderHeight";
import { AppColors } from "@/interfaces/color";
import { PurchaseOrderLine } from "@/interfaces/db-types";
import { formatCurrency, formatDate } from "@/utils/formatters";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Check,
  ChevronDown,
  Copy,
  Pencil,
  Trash2,
  X,
} from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const isFabricEnabled = (global as any)._IS_FABRIC_ === true;

if (
  Platform.OS === "android" &&
  !isFabricEnabled &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const OrderDetail = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const orderId = Array.isArray(id) ? id[0] : id;

  const colors = useAppColors();
  const styles = makeStyles(colors);
  const finalHeaderHeight = useFinalHeaderHeight();

  const scrollRef = useRef<ScrollView>(null);

  const [isHeaderExpanded, setIsHeaderExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [isEditingRemarks, setIsEditingRemarks] = useState(false);
  const [editedRemarks, setEditedRemarks] = useState("");
  const [showToast, setShowToast] = useState(false);

  const [selectedLineItem, setSelectedLineItem] =
    useState<PurchaseOrderLine | null>(null);

  const toastOpacity = useSharedValue(0);

  const tabs = [
    { id: "details", label: "Details" },
    { id: "comments", label: "Comments" },
    { id: "history", label: "History" },
  ];

  const rotation = useSharedValue(180);

  const [confirmationState, setConfirmationState] = useState<{
    visible: boolean;
    action: "approve" | "reject" | "delete_remarks" | null;
  }>({
    visible: false,
    action: null,
  });

  const touchSlop = { top: 15, bottom: 15, left: 10, right: 10 };

  // --- Use Custom Hook ---
  const {
    data,
    isLoading,
    error,
    historyItems,
    approveMutation,
    rejectMutation,
    updateRemarksMutation,
    isProcessing,
  } = useOrderDetails(orderId!);

  const getTabCount = (tabId: string) => {
    if (tabId === "details") {
      return data?.order_lines?.length || 0;
    }
    return 0;
  };

  const handleSuccess = () => {
    setConfirmationState({ visible: false, action: null });
    // Invalidation is handled in the hook
    router.back();
  };

  const handleError = (error: Error) => {
    setConfirmationState((prev) => ({ ...prev, visible: false }));
    Alert.alert("Error", error.message || "Something went wrong.");
  };

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
  };

  const initiateConfirmation = (action: "approve" | "reject") => {
    setConfirmationState({ visible: true, action });
  };

  const handleCopyRemarks = async () => {
    const textToCopy = (data as any).remarks || "";
    if (textToCopy) {
      await Clipboard.setStringAsync(textToCopy);
      setShowToast(true);
      toastOpacity.value = withTiming(1, { duration: 300 });
      setTimeout(() => {
        toastOpacity.value = withTiming(0, { duration: 300 }, (finished) => {
          if (finished) {
            runOnJS(setShowToast)(false);
          }
        });
      }, 2000);
    }
  };

  const handleEditRemarks = () => {
    setEditedRemarks((data as any).remarks || "");
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsEditingRemarks(true);
  };

  const handleSaveRemarks = () => {
    Keyboard.dismiss();
    setTimeout(() => {
      updateRemarksMutation.mutate(editedRemarks, {
        onSuccess: () => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setIsEditingRemarks(false);
        },
        onError: (err) => {
          Alert.alert("Error", "Failed to update remarks.");
          console.error(err);
        },
      });
    }, 300);
  };

  const handleCancelEdit = () => {
    Keyboard.dismiss();
    setTimeout(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsEditingRemarks(false);
      setEditedRemarks("");
    }, 300);
  };

  const handleDeleteRemarks = () => {
    setConfirmationState({ visible: true, action: "delete_remarks" });
  };

  const handleConfirm = (reason?: string) => {
    const { action } = confirmationState;
    if (action === "approve") {
      approveMutation.mutate(undefined, {
        onSuccess: handleSuccess,
        onError: handleError,
      });
    } else if (action === "reject") {
      rejectMutation.mutate(reason, {
        onSuccess: handleSuccess,
        onError: handleError,
      });
    } else if (action === "delete_remarks") {
      updateRemarksMutation.mutate("", {
        onSuccess: () => {
          setConfirmationState({ visible: false, action: null });
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setIsEditingRemarks(false);
        },
        onError: handleError,
      });
    }
  };

  const closeConfirmation = () => {
    if (isProcessing) return;
    setConfirmationState({ visible: false, action: null });
  };

  const toggleHeader = () => {
    const nextState = !isHeaderExpanded;
    setIsHeaderExpanded(nextState);
    rotation.value = withTiming(nextState ? 180 : 0, { duration: 300 });
  };

  const animatedIconStyle = useAnimatedStyle(() => {
    return { transform: [{ rotateZ: `${rotation.value}deg` }] };
  });

  const toastAnimatedStyle = useAnimatedStyle(() => {
    return { opacity: toastOpacity.value };
  });

  const renderStatusBadge = () => {
    const status = data?.status?.toLowerCase() || "default";
    const style = STATUS_STYLES[status] || STATUS_STYLES.default;
    return (
      <View
        style={[
          styles.badgeContainer,
          {
            backgroundColor: colors.accent,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={[styles.badgeDot, { backgroundColor: style.text }]} />
        <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <>
        <ScreenHeader
          title={`Order loading...`}
          enableBackground={false}
          showNotication={false}
          showBackButton={true}
        />
        <View
          style={[
            styles.container,
            { marginTop: finalHeaderHeight, justifyContent: "center" },
          ]}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <ScreenHeader
          title={`Order #${orderId}`}
          enableBackground={false}
          showNotication={false}
          showBackButton={true}
        />
        <View
          style={[
            styles.container,
            { marginTop: finalHeaderHeight, justifyContent: "center" },
          ]}
        >
          <Text style={{ textAlign: "center", color: "red" }}>
            Failed to load order details.
          </Text>
        </View>
      </>
    );
  }

  const status = data?.status?.toLowerCase() || "default";
  const isFinalized =
    status === "approved" ||
    status === "rejected" ||
    status === "partial" ||
    status === "received";

  const modalConfig = {
    title:
      confirmationState.action === "approve"
        ? "Approve Order"
        : confirmationState.action === "reject"
          ? "Reject Order"
          : "Delete Remarks",
    description:
      confirmationState.action === "approve"
        ? `Are you sure you want to approve order #${data.source_no}? This action cannot be undone.`
        : confirmationState.action === "reject"
          ? `Are you sure you want to reject order #${data.source_no}? This action cannot be undone.`
          : "Are you sure you want to delete these remarks? This action cannot be undone.",
    confirmText:
      confirmationState.action === "approve"
        ? "Yes, Approve"
        : confirmationState.action === "reject"
          ? "Yes, Reject"
          : "Yes, Delete",
    variant:
      confirmationState.action === "delete_remarks"
        ? "reject"
        : confirmationState.action || "approve",
  };

  return (
    <>
      <ScreenHeader
        title={data.source_no || `Order #${data.id}`}
        enableBackground={false}
        headerRight={renderStatusBadge}
        showNotication={false}
        showBackButton={true}
      />

      <ScrollView
        ref={scrollRef}
        style={[styles.container, { marginTop: finalHeaderHeight }]}
        contentContainerStyle={{ paddingBottom: 40 }}
        stickyHeaderIndices={[4]}
        automaticallyAdjustKeyboardInsets={true}
        keyboardDismissMode="on-drag"
      >
        {!isFinalized ? (
          <View
            style={[styles.actionCard, { marginBottom: 10, marginTop: 10 }]}
          >
            <ButtonAction
              variant="reject"
              onPress={() => initiateConfirmation("reject")}
              disabled={isProcessing}
              style={{ flex: 1 }}
            >
              Reject
            </ButtonAction>
            <ButtonAction
              variant="approve"
              onPress={() => initiateConfirmation("approve")}
              disabled={isProcessing}
              style={{ flex: 1 }}
            >
              Approve
            </ButtonAction>
          </View>
        ) : (
          <View style={{ height: 10 }} />
        )}

        <TouchableOpacity
          style={styles.headerToggle}
          onPress={toggleHeader}
          activeOpacity={0.7}
        >
          <Text style={styles.sectionHeader}>Header Information</Text>
          <Animated.View style={animatedIconStyle}>
            <ChevronDown size={20} color={colors.mutedForeground} />
          </Animated.View>
        </TouchableOpacity>

        <View style={{ marginBottom: 10 }}>
          <View style={[styles.detailHolder, { borderBottomWidth: 1 }]}>
            <Text style={styles.detailName}>{data.vendor}</Text>
            <View style={{ paddingTop: 2 }}>
              <Text style={styles.detail}>{data.vendor_address}</Text>
            </View>
          </View>

          <Collapsible expanded={isHeaderExpanded}>
            <View>
              <View style={[styles.detailHolder, { borderTopWidth: 0 }]}>
                <Text style={styles.detailName}>Ship To Address:</Text>
                <Text style={styles.detail}>{data.ship_to_address}</Text>
              </View>
              <View style={[styles.detailHolder, { borderBottomWidth: 1 }]}>
                <Text style={styles.detailName}>Reference No(s):</Text>
                <Text style={styles.detail}>{data.ref_nos}</Text>
              </View>

              {data.po_type === "Fuel" && (
                <>
                  <View style={[styles.detailHolder, { marginTop: 8 }]}>
                    <Text style={styles.detailName}>Fuel Customer:</Text>
                    <Text style={styles.detail}>
                      {data.fuel_customer || "-"}
                    </Text>
                  </View>

                  <View style={[styles.detailHolder, styles.rowContainer]}>
                    <View style={styles.columnItem}>
                      <Text style={styles.detailName}>Unit No:</Text>
                      <Text style={styles.detail}>{data.unit_no || "-"}</Text>
                    </View>
                    <View style={styles.columnItem}>
                      <Text style={styles.detailName}>Meter Read:</Text>
                      <Text style={styles.detail}>{data.meter_read || 0}</Text>
                    </View>
                  </View>

                  <View style={[styles.detailHolder, styles.rowContainer]}>
                    <View style={styles.columnItem}>
                      <Text style={styles.detailName}>Tagged Trips:</Text>
                      <Text style={styles.detail}>
                        {data.tagged_trips || "-"}
                      </Text>
                    </View>
                    <View style={styles.columnItem}>
                      <Text style={styles.detailName}>Fuel Usage Class:</Text>
                      <Text style={styles.detail}>
                        {data.fuel_usage_class || "-"}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.detailHolder, styles.rowContainer]}>
                    <View style={styles.columnItem}>
                      <Text style={styles.detailName}>Trip Type:</Text>
                      <Text style={styles.detail}>{data.trip_type || "-"}</Text>
                    </View>
                    <View style={styles.columnItem}>
                      <Text style={styles.detailName}>Driver:</Text>
                      <Text style={styles.detail}>{data.driver || "-"}</Text>
                    </View>
                  </View>

                  <View
                    style={[styles.sectionDivider, { marginVertical: 0 }]}
                  />
                  <Text
                    style={[
                      styles.sectionTitle,
                      { fontSize: 14, marginBottom: 8, marginTop: 10 },
                    ]}
                  >
                    Previous Reading
                  </Text>

                  <View style={[styles.detailHolder, styles.rowContainer]}>
                    <View style={styles.columnItem}>
                      <Text style={styles.detailName}>Prev Gas Date:</Text>
                      <Text style={styles.detail}>
                        {data.prev_gas_date
                          ? formatDate(data.prev_gas_date)
                          : "-"}
                      </Text>
                    </View>
                    <View style={styles.columnItem}>
                      <Text style={styles.detailName}>Prev Meter:</Text>
                      <Text style={styles.detail}>{data.prev_meter || 0}</Text>
                    </View>
                  </View>

                  <View style={[styles.detailHolder, styles.rowContainer]}>
                    <View style={styles.columnItem}>
                      <Text style={styles.detailName}>Prev No Liters:</Text>
                      <Text style={styles.detail}>
                        {data.prev_no_liters || 0}
                      </Text>
                    </View>
                    <View style={styles.columnItem}>
                      <Text style={styles.detailName}>Prev Price:</Text>
                      <Text style={styles.detail}>
                        {data.prev_price
                          ? formatCurrency(data.prev_price)
                          : "-"}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.detailHolder, { borderBottomWidth: 1 }]}>
                    <Text style={styles.detailName}>Prev Total Amt:</Text>
                    <Text style={styles.detail}>
                      {data.prev_total_amt
                        ? formatCurrency(data.prev_total_amt)
                        : "-"}
                    </Text>
                  </View>
                </>
              )}
              <View
                style={[
                  styles.detailHolder,
                  styles.rowContainer,
                  { borderBottomWidth: 1, marginTop: 8 },
                ]}
              >
                <View style={styles.columnItem}>
                  <Text style={styles.detailName}>Entry Date:</Text>
                  <Text style={styles.detail}>
                    {formatDate(data.entry_date)}
                  </Text>
                </View>

                <View style={styles.columnItem}>
                  <Text style={styles.detailName}>Expected Date:</Text>
                  <Text style={styles.detail}>
                    {formatDate(data.expected_date)}
                  </Text>
                </View>
              </View>
            </View>
          </Collapsible>

          <View
            style={[
              styles.detailHolder,
              { borderBottomWidth: 1, borderTopWidth: 1, marginTop: 8 },
            ]}
          >
            <Text
              style={[
                styles.detailName,
                { fontSize: 18, color: colors.foreground },
              ]}
            >
              {formatCurrency(data.amount)}
            </Text>
          </View>
        </View>

        <View style={styles.separator} />
        <TabHeader
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          getBadgeCount={getTabCount}
          showSearch={false}
          activeColor={colors.primary}
          fullWidth={true}
          backgroundColor={colors.accent}
          style={{
            borderColor: colors.border,
            zIndex: 100,
            elevation: 5,
            backgroundColor: colors.accent,
          }}
        />

        <View style={styles.tabContentContainer}>
          {activeTab === "details" && (
            <View style={{ gap: 0 }}>
              {data.order_lines?.map((line, index) => (
                <OrderLineItem
                  key={line.id || index}
                  line={line}
                  orderId={orderId!}
                  isLast={index === (data.order_lines?.length || 0) - 1}
                  onPress={() => setSelectedLineItem(line)}
                  readOnly={isFinalized}
                />
              ))}
              {!data.order_lines?.length && (
                <Text style={styles.emptyText}>No items found.</Text>
              )}
            </View>
          )}

          {activeTab === "comments" && (
            <View style={styles.commentsTabContainer}>
              <View style={styles.commentSection}>
                <View style={styles.commentHeaderRow}>
                  <Text style={styles.commentTitle}>Remarks</Text>
                  <View style={styles.commentIcons}>
                    {isEditingRemarks ? (
                      <>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={handleSaveRemarks}
                          disabled={updateRemarksMutation.isPending}
                          hitSlop={touchSlop}
                        >
                          {updateRemarksMutation.isPending ? (
                            <ActivityIndicator
                              size="small"
                              color={colors.primary}
                            />
                          ) : (
                            <Check size={18} color={colors.primary} />
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={handleCancelEdit}
                          disabled={updateRemarksMutation.isPending}
                          hitSlop={touchSlop}
                        >
                          <X size={18} color={colors.primary} />
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={handleCopyRemarks}
                          hitSlop={touchSlop}
                        >
                          <Copy size={18} color={colors.mutedForeground} />
                        </TouchableOpacity>

                        {!isFinalized && (
                          <>
                            <TouchableOpacity
                              activeOpacity={0.7}
                              onPress={handleDeleteRemarks}
                              hitSlop={touchSlop}
                            >
                              <Trash2
                                size={18}
                                color={colors.mutedForeground}
                              />
                            </TouchableOpacity>
                            <TouchableOpacity
                              activeOpacity={0.7}
                              onPress={handleEditRemarks}
                              hitSlop={touchSlop}
                            >
                              <Pencil
                                size={18}
                                color={colors.mutedForeground}
                              />
                            </TouchableOpacity>
                          </>
                        )}
                      </>
                    )}
                  </View>
                </View>

                {isEditingRemarks ? (
                  <TextInput
                    style={[styles.commentText, styles.editInput]}
                    value={editedRemarks}
                    onChangeText={setEditedRemarks}
                    multiline
                    autoFocus
                    placeholder="Enter remarks..."
                    placeholderTextColor={colors.mutedForeground}
                  />
                ) : (
                  <Text style={styles.commentText}>
                    {(data as any).remarks || "No remarks available."}
                  </Text>
                )}
              </View>

              <View style={styles.commentSection}>
                <Text style={styles.commentTitle}>Comments</Text>
                <Text style={styles.commentText}>
                  {data.comments || "No comments available."}
                </Text>
              </View>
            </View>
          )}

          {activeTab === "history" && (
            <View style={styles.historyTabContainer}>
              {historyItems.length > 0 ? (
                historyItems.map((item, index) => (
                  <View key={index} style={styles.historyItem}>
                    <Text style={styles.historyText}>{item}</Text>
                  </View>
                ))
              ) : (
                <Text style={[styles.emptyText, { marginTop: 20 }]}>
                  No history available.
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {showToast && (
        <Animated.View style={[styles.toastContainer, toastAnimatedStyle]}>
          <View style={styles.toastContent}>
            <Check size={16} color="#FFFFFF" strokeWidth={3} />
            <Text style={styles.toastText}>Remarks copied to clipboard</Text>
          </View>
        </Animated.View>
      )}

      <ConfirmationSheet
        visible={confirmationState.visible}
        onClose={closeConfirmation}
        onConfirm={handleConfirm}
        title={modalConfig.title}
        description={modalConfig.description}
        confirmText={modalConfig.confirmText}
        confirmVariant={modalConfig.variant}
        isLoading={isProcessing}
      />

      <OrderLineDetailSheet
        line={selectedLineItem}
        orderId={orderId!}
        onClose={() => setSelectedLineItem(null)}
        readOnly={isFinalized}
      />
    </>
  );
};

export default OrderDetail;

// Update Styles
const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    actionCard: {
      flexDirection: "row",
      backgroundColor: colors.accent,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      gap: 8,
      width: "100%",
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    headerToggle: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 4,
    },
    sectionHeader: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 13,
      textTransform: "uppercase",
      color: colors.mutedForeground,
    },
    detailHolder: {
      backgroundColor: colors.accent,
      borderTopWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 5,
    },
    rowContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    columnItem: {
      flex: 1,
    },
    detailName: {
      fontFamily: "Inter_500Medium",
      fontSize: 14,
      color: colors.accentForeground,
    },
    detail: {
      fontFamily: "Inter_500Medium",
      fontSize: 12,
      color: colors.mutedForeground,
    },
    badgeContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 99,
      borderWidth: 1,
      gap: 6,
    },
    badgeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    badgeText: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
    },
    tabContentContainer: {
      paddingTop: 10,
      minHeight: 400,
    },
    historyTabContainer: {
      paddingBottom: 20,
    },
    historyItem: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: colors.background,
    },
    historyText: {
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      fontSize: 13,
      lineHeight: 20,
    },
    textContentContainer: {
      padding: 16,
      backgroundColor: colors.accent,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    textContent: {
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
      fontSize: 14,
      lineHeight: 20,
    },
    emptyText: {
      textAlign: "center",
      color: colors.mutedForeground,
      marginTop: 20,
    },
    sectionDivider: {
      height: 1,
      backgroundColor: colors.border,
      width: "100%",
    },
    sectionTitle: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 16,
      paddingHorizontal: 16,
      color: colors.foreground,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
    },
    commentsTabContainer: {
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 24,
      backgroundColor: colors.background,
      minHeight: 300,
    },
    commentSection: {
      marginBottom: 24,
    },
    commentHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    commentIcons: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    commentTitle: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 15,
      color: colors.foreground,
      marginBottom: 8,
    },
    commentText: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      color: colors.mutedForeground,
      lineHeight: 22,
    },
    editInput: {
      minHeight: 60,
      textAlignVertical: "top",
      marginTop: 4,
    },
    toastContainer: {
      position: "absolute",
      bottom: 50,
      left: 0,
      right: 0,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      pointerEvents: "none",
    },
    toastContent: {
      backgroundColor: "#18181b",
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 99,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    toastText: {
      color: "#FFFFFF",
      fontFamily: "Inter_600SemiBold",
      fontSize: 13,
    },
  });
