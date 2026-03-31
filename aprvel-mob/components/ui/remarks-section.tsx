import { AppColors } from '@/interfaces/color';
import { PurchaseOrderLine } from '@/interfaces/db-types';
import * as Clipboard from 'expo-clipboard';
import { Check, Copy, Pencil, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface RemarksSectionProps {
  line: PurchaseOrderLine;
  colors: AppColors;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  scrollViewRef: React.RefObject<any>;
  readOnly?: boolean;
}

export const RemarksSection = ({
  line,
  colors,
  isEditing,
  setIsEditing,
  scrollViewRef,
  readOnly,
  remarks,
  onChangeRemarks,
}: RemarksSectionProps & {
  remarks: string;
  onChangeRemarks: (text: string) => void;
}) => {
  const styles = makeStyles(colors);
  const [selection, setSelection] = useState<{ start: number; end: number }>();

  const handleEditRemarks = () => {
    if (readOnly) return;
    const text = remarks;
    setSelection({ start: text.length, end: text.length });
    setIsEditing(true);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 300);
  };

  const handleCancelEdit = () => {
    Keyboard.dismiss();
    setIsEditing(false);
    onChangeRemarks(line?.reason || '');
  };

  const handleSaveRemarks = () => {
    Keyboard.dismiss();
    setIsEditing(false);
  };

  const handleCopyRemarks = async () => {
    const textToCopy = line?.reason || '';
    if (textToCopy) {
      await Clipboard.setStringAsync(textToCopy);
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.commentSection}>
        <View style={styles.commentHeaderRow}>
          <Text style={styles.sectionLabel}>Remarks</Text>
          <View style={styles.commentIcons}>
            {isEditing ? (
              <>
                <TouchableOpacity onPress={handleSaveRemarks} hitSlop={10}>
                  <Check size={18} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCancelEdit} hitSlop={10}>
                  <X size={18} color={colors.primary} />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity onPress={handleCopyRemarks} hitSlop={10}>
                  <Copy size={18} color={colors.mutedForeground} />
                </TouchableOpacity>
                {!readOnly && (
                  <TouchableOpacity onPress={handleEditRemarks} hitSlop={10}>
                    <Pencil size={18} color={colors.mutedForeground} />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>

        {isEditing ? (
          <TextInput
            style={[styles.commentText, styles.editInput]}
            value={remarks}
            onChangeText={onChangeRemarks}
            multiline
            autoFocus
            placeholder='Enter remarks...'
            placeholderTextColor={colors.mutedForeground}
            selection={selection}
            onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
            onFocus={() => {
              setTimeout(
                () =>
                  scrollViewRef.current?.scrollToEnd({
                    animated: true,
                  }),
                200,
              );
            }}
          />
        ) : (
          <View style={styles.remarksBox}>
            <Text style={styles.remarksText}>
              {remarks || 'No remarks provided.'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    section: {
      gap: 8,
    },
    sectionLabel: {
      fontSize: 14,
      fontFamily: 'Inter_600SemiBold',
      color: colors.foreground,
    },
    commentSection: { gap: 12 },
    commentHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    commentIcons: { flexDirection: 'row', gap: 16, alignItems: 'center' },
    commentText: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
      lineHeight: 20,
    },
    editInput: {
      backgroundColor: colors.background,
      minHeight: 100,
      textAlignVertical: 'top',
    },
    remarksBox: {
      backgroundColor: colors.background,
      minHeight: 100,
      justifyContent: 'flex-start',
    },
    remarksText: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
    },
  });
