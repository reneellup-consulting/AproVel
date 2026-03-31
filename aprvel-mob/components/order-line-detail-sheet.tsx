import { useAvatarColor } from '@/hooks/use-avatar-color';
import { useSideSheetSwipe } from '@/hooks/use-side-sheet-swipe';
import { useAppColors } from '@/hooks/useAppColors';
import { AppColors } from '@/interfaces/color';
import { PurchaseOrderLine } from '@/interfaces/db-types';
import { updateOrderLine } from '@/services/order-service';
import { formatCurrency, toProperCase } from '@/utils/formatters';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineStatusSelector } from './line-status-selector';
import { LineDetailsSection } from './ui/line-details-section';
import { RemarksSection } from './ui/remarks-section';

interface OrderLineDetailSheetProps {
  line: PurchaseOrderLine | null;
  orderId: string | number; // Added orderId
  onClose: () => void;
  readOnly?: boolean;
}

export const OrderLineDetailSheet = ({
  line,
  orderId,
  onClose,
  readOnly,
}: OrderLineDetailSheetProps) => {
  const visible = !!line;
  const scrollViewRef = useRef<ScrollView>(null);
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(colors, insets);

  const [localStatus, setLocalStatus] = useState<string | null>(null);
  const [localRemarks, setLocalRemarks] = useState('');
  const [isEditingRemarks, setIsEditingRemarks] = useState(false);

  const queryClient = useQueryClient();

  // --- HOOKS ---
  const { slideAnim, panResponder, handleClose, PANEL_WIDTH } =
    useSideSheetSwipe(visible, onClose, () => setIsEditingRemarks(false));

  useEffect(() => {
    if (line) {
      setLocalStatus(line.line_status || 'Hold');
      setLocalRemarks(line.reason || '');
    }
  }, [line]);

  const displaySource = line?.facility_department || line?.charge_to;
  const facilityName = displaySource?.split(' ')[0] || 'Facility';
  const deptName = displaySource ? toProperCase(displaySource) : '-';
  const initials = displaySource
    ? displaySource.substring(0, 2).toUpperCase()
    : 'FA';

  const mutation = useMutation({
    mutationFn: async () => {
      if (!line || !orderId) return;
      return updateOrderLine(orderId, line.id, {
        line_status:
          (localStatus === 'Release' ? 'Released' : localStatus) || undefined,
        reason: localRemarks,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order'] });
      handleClose();
    },
    onError: (error: any) => {
      console.error('Failed to update line:', error);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    },
  });

  const handleSave = () => {
    mutation.mutate();
  };

  const avatarColors = useAvatarColor(displaySource, colors);

  if (!line) return null;

  return (
    <Modal
      animationType='none'
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Backdrop: Clicks close the modal */}
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : insets.top}
          style={styles.keyboardContainer}
          pointerEvents='box-none'
        >
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.sheetContainer,
              { width: PANEL_WIDTH, transform: [{ translateX: slideAnim }] },
            ]}
          >
            {/* --- VISUAL GRABBER HANDLE --- */}
            <View style={styles.grabberContainer} pointerEvents='none'>
              <View style={styles.grabberBar} />
            </View>

            {/* Header */}
            <View style={styles.headerContainer}>
              <View style={styles.headerTopRow}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {!!line.code_no && (
                    <>
                      <Text style={styles.headerCode}>{line.code_no}</Text>
                      {' → '}
                    </>
                  )}
                  {line.item}
                </Text>
                <Pressable
                  onPress={handleClose}
                  hitSlop={10}
                  style={{ marginLeft: 8 }}
                >
                  <X size={24} color={colors.mutedForeground} />
                </Pressable>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>
                  <Text style={styles.metaLabel}>RQB: </Text>
                  {line.requestor || '-'}
                  <Text style={styles.metaLabel}> CT: </Text>
                  {line.charge_to || '-'}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaText}>
                  <Text style={styles.metaLabel}>QTY: </Text>
                  {line.quantity} {line.unit_of_measure}
                  <Text style={styles.metaLabel}> Unit Cost: </Text>
                  {formatCurrency(line.unit_cost).replace('Php', '')}
                </Text>
              </View>
              <Text style={styles.bigTotal}>{formatCurrency(line.total)}</Text>
            </View>

            {/* Scrollable Body */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.scrollContent}
              contentContainerStyle={[
                styles.scrollInner,
                { paddingBottom: isEditingRemarks ? 300 : 100 },
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps='handled'
              automaticallyAdjustKeyboardInsets={true}
              keyboardDismissMode='on-drag'
            >
              {/* Line Status */}
              <View style={[styles.section, { paddingTop: 10 }]}>
                <Text style={styles.sectionLabel}>Line Status</Text>
                <LineStatusSelector
                  status={localStatus}
                  onChange={(newStatus) => setLocalStatus(newStatus)}
                  readOnly={readOnly}
                />
              </View>

              {/* Facility */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>
                  {line.facility_department
                    ? 'Facility and Department'
                    : 'Charge To'}
                </Text>
                <View style={styles.facilityRow}>
                  <View
                    style={[
                      styles.facilityIconBox,
                      { backgroundColor: avatarColors.bg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.facilityAvatarText,
                        { color: avatarColors.fg },
                      ]}
                    >
                      {initials}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.facilityTitle}>{facilityName}</Text>
                    <Text style={styles.facilitySubtitle} numberOfLines={1}>
                      {deptName}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Details */}
              <LineDetailsSection line={line} colors={colors} />

              {/* Remarks */}
              <RemarksSection
                line={line}
                colors={colors}
                isEditing={isEditingRemarks}
                setIsEditing={setIsEditingRemarks}
                scrollViewRef={scrollViewRef}
                readOnly={readOnly}
                remarks={localRemarks}
                onChangeRemarks={setLocalRemarks}
              />
            </ScrollView>

            {/* Footer */}
            {!readOnly ? (
              <View style={styles.footer}>
                {/* Secondary Action: Cancel */}
                <TouchableOpacity
                  style={[styles.btnBase, styles.btnSecondary]}
                  onPress={handleClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.btnTextSecondary}>Cancel</Text>
                </TouchableOpacity>

                {/* Primary Action: Save (Dominant) */}
                <TouchableOpacity
                  style={[styles.btnBase, styles.btnPrimary]}
                  onPress={handleSave}
                  disabled={mutation.isPending}
                  activeOpacity={0.8}
                >
                  {mutation.isPending ? (
                    <ActivityIndicator color='#FFF' size='small' />
                  ) : (
                    <Text style={styles.btnTextPrimary}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.footer}>
                <TouchableOpacity
                  style={[styles.btnBase, styles.btnSecondary, { flex: 1 }]}
                  onPress={handleClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.btnTextSecondary}>Close</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const makeStyles = (colors: AppColors, insets: EdgeInsets) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    keyboardContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    sheetContainer: {
      height: '100%',
      backgroundColor: colors.background,
      shadowColor: '#000',
      shadowOffset: { width: -2, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,
    },
    // --- NEW GRABBER STYLES ---
    grabberContainer: {
      position: 'absolute',
      left: -5,
      top: 0,
      bottom: 0,
      width: 24,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 20,
    },
    grabberBar: {
      width: 4,
      height: 48,
      borderRadius: 2,
      backgroundColor: colors.border,
      opacity: 0.7,
    },
    // --------------------------
    headerContainer: {
      backgroundColor: colors.accent,
      paddingHorizontal: 16,
      paddingTop: 50,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 4,
    },
    headerTitle: {
      flex: 1,
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
      color: colors.foreground,
      lineHeight: 22,
    },
    headerCode: { fontFamily: 'Inter_700Bold' },
    metaRow: { marginBottom: 4 },
    metaText: {
      fontSize: 12,
      fontFamily: 'Inter_500Medium',
      color: colors.accentForeground,
    },
    metaLabel: {
      fontFamily: 'Inter_500Medium',
      color: colors.mutedForeground,
      fontSize: 12,
    },
    bigTotal: {
      fontSize: 24,
      fontFamily: 'Inter_600SemiBold',
      color: colors.accentForeground,
      marginTop: 5,
    },
    scrollContent: { flex: 1 },
    scrollInner: {
      paddingHorizontal: 16,
      paddingTop: 10,
      gap: 24,
    },
    section: {
      gap: 8,
    },
    sectionLabel: {
      fontSize: 14,
      fontFamily: 'Inter_600SemiBold',
      color: colors.foreground,
    },
    facilityRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    facilityIconBox: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#E2E8F0',
      justifyContent: 'center',
      alignItems: 'center',
    },
    facilityAvatarText: {
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
      color: colors.foreground,
    },
    facilityTitle: {
      fontSize: 14,
      fontFamily: 'Inter_600SemiBold',
      color: colors.foreground,
    },
    facilitySubtitle: {
      fontSize: 13,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: Math.max(insets.bottom, 16),
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
      gap: 12,
    },
    btnBase: {
      height: 48,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    btnSecondary: {
      flex: 1,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    btnPrimary: {
      flex: 2,
      backgroundColor: '#F97316',
      shadowColor: '#F97316',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
    },
    btnTextSecondary: {
      fontSize: 14,
      fontFamily: 'Inter_600SemiBold',
      color: colors.foreground,
    },
    btnTextPrimary: {
      fontSize: 14,
      fontFamily: 'Inter_600SemiBold',
      color: '#FFFFFF',
    },
  });
