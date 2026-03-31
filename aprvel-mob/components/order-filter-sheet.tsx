import { WheelPicker } from '@/components/ui/wheel-picker';
import { useAppColors } from '@/hooks/useAppColors';
import { AppColors } from '@/interfaces/color';
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export interface FilterState {
  startDate: Date | null;
  endDate: Date | null;
  status: string[];
  po_type?: string[];
}

interface DateRangeSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (filters: FilterState) => void;
  initialFilters?: FilterState;
  minDate?: Date;
  maxDate?: Date;
  showTypeFilter?: boolean;
  hiddenStatuses?: string[];
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 13 }, (_, i) => currentYear - 10 + i);

const STATUS_OPTIONS = [
  'Pending',
  'Approved',
  'Rejected',
  'Received',
  'Partially Received',
];
const TYPE_OPTIONS = ['General', 'Fuel'];

const PRESETS = [
  { label: 'Today', id: 'today' },
  { label: 'Yesterday', id: 'yesterday' },
  { label: 'Last 7 days', id: 'last7' },
  { label: 'Last 30 days', id: 'last30' },
  { label: 'This Month', id: 'thisMonth' },
];

export const OrderFilterSheet = ({
  visible,
  onClose,
  onConfirm,
  initialFilters,
  minDate,
  maxDate,
  showTypeFilter = false,
  hiddenStatuses = [],
}: DateRangeSheetProps) => {
  const colors = useAppColors();
  const styles = makeStyles(colors);
  const slideAnim = useRef(new Animated.Value(500)).current;

  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterState>({
    startDate: null,
    endDate: null,
    status: [],
    po_type: [],
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 0,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) slideAnim.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) handleClose();
        else
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 5,
          }).start();
      },
    }),
  ).current;

  useEffect(() => {
    if (visible) {
      setShowMonthPicker(false);
      setShowYearPicker(false);
      slideAnim.setValue(500);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 5,
      }).start();

      if (initialFilters) {
        setTempFilters({
          ...initialFilters,
          po_type: initialFilters.po_type || [],
        });
        setCurrentViewDate(
          initialFilters.startDate
            ? new Date(initialFilters.startDate)
            : new Date(),
        );
      } else {
        setTempFilters({
          startDate: null,
          endDate: null,
          status: [],
          po_type: [],
        });
        setCurrentViewDate(new Date());
      }
    }
  }, [visible, initialFilters]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 500,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const handleConfirm = () => {
    handleClose();
    setTimeout(() => onConfirm(tempFilters), 100);
  };

  const handleReset = () => {
    setTempFilters({
      startDate: null,
      endDate: null,
      status: [],
      po_type: [],
    });
    setCurrentViewDate(new Date());
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(
      currentViewDate.getFullYear(),
      currentViewDate.getMonth(),
      day,
    );
    if (minDate && selectedDate < minDate) return;
    if (maxDate && selectedDate > maxDate) return;

    setTempFilters((prev) => {
      if (!prev.startDate || (prev.startDate && prev.endDate)) {
        return { ...prev, startDate: selectedDate, endDate: null };
      }
      if (selectedDate < prev.startDate) {
        return { ...prev, startDate: selectedDate, endDate: null };
      }
      return { ...prev, endDate: selectedDate };
    });
  };

  const calendarData = useMemo(() => {
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const weeks: (number | null)[][] = [];
    let currentWeek: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) currentWeek.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }
    return { weeks, year, month };
  }, [currentViewDate]);

  return (
    <Modal
      animationType='fade'
      transparent
      visible={visible}
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <Animated.View
          style={[
            styles.sheetContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View {...panResponder.panHandlers}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <TouchableOpacity onPress={handleReset} hitSlop={10}>
                <Text style={styles.resetText}>Reset</Text>
              </TouchableOpacity>
              <Text style={styles.title}>Filters</Text>
              <TouchableOpacity onPress={handleClose} hitSlop={10}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            <Text style={styles.sectionTitle}>Quick select</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
              style={{ marginBottom: 12 }}
            >
              {PRESETS.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.chip}
                  onPress={() => {
                    const end = new Date();
                    let start = new Date();
                    if (p.id === 'yesterday') {
                      start.setDate(start.getDate() - 1);
                      end.setDate(end.getDate() - 1);
                    } else if (p.id === 'last7')
                      start.setDate(end.getDate() - 6);
                    else if (p.id === 'last30')
                      start.setDate(end.getDate() - 29);
                    else if (p.id === 'thisMonth')
                      start = new Date(end.getFullYear(), end.getMonth(), 1);
                    setTempFilters((prev) => ({
                      ...prev,
                      startDate: start,
                      endDate: end,
                    }));
                    setCurrentViewDate(new Date(start));
                  }}
                >
                  <Text style={styles.chipText}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>Date range</Text>
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                style={styles.navButton}
                onPress={() =>
                  setCurrentViewDate(
                    new Date(
                      currentViewDate.setMonth(currentViewDate.getMonth() - 1),
                    ),
                  )
                }
              >
                <ChevronLeft size={24} color={colors.text} />
              </TouchableOpacity>
              <View style={styles.headerSelectors}>
                <TouchableOpacity
                  style={[
                    styles.selectorBtn,
                    showMonthPicker && styles.selectorBtnActive,
                  ]}
                  onPress={() => {
                    setShowMonthPicker(!showMonthPicker);
                    setShowYearPicker(false);
                  }}
                >
                  <Text style={styles.monthTitle}>
                    {MONTHS[calendarData.month]}
                  </Text>
                  <ChevronDown size={16} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.selectorBtn,
                    showYearPicker && styles.selectorBtnActive,
                  ]}
                  onPress={() => {
                    setShowYearPicker(!showYearPicker);
                    setShowMonthPicker(false);
                  }}
                >
                  <Text style={styles.monthTitle}>{calendarData.year}</Text>
                  <ChevronDown size={16} color={colors.text} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.navButton}
                onPress={() =>
                  setCurrentViewDate(
                    new Date(
                      currentViewDate.setMonth(currentViewDate.getMonth() + 1),
                    ),
                  )
                }
              >
                <ChevronRight size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {showMonthPicker ? (
              <WheelPicker
                key='months'
                data={MONTHS}
                selectedValue={MONTHS[calendarData.month]}
                onValueChange={(_, i) =>
                  setCurrentViewDate(
                    new Date(new Date(currentViewDate).setMonth(i)),
                  )
                }
              />
            ) : showYearPicker ? (
              <WheelPicker
                key='years'
                data={YEARS}
                selectedValue={calendarData.year}
                onValueChange={(v) =>
                  setCurrentViewDate(
                    new Date(new Date(currentViewDate).setFullYear(Number(v))),
                  )
                }
              />
            ) : (
              <View style={styles.calendarContainer}>
                <View style={styles.weekRow}>
                  {DAYS.map((d) => (
                    <Text key={d} style={styles.dayLabel}>
                      {d}
                    </Text>
                  ))}
                </View>
                {calendarData.weeks.map((week, wi) => (
                  <View key={wi} style={styles.weekRow}>
                    {week.map((day, di) => {
                      if (!day) return <View key={di} style={styles.dayCell} />;
                      const date = new Date(
                        calendarData.year,
                        calendarData.month,
                        day,
                      );

                      const isToday =
                        new Date().toDateString() === date.toDateString();

                      const isStart =
                        tempFilters.startDate?.toDateString() ===
                        date.toDateString();
                      const isEnd =
                        tempFilters.endDate?.toDateString() ===
                        date.toDateString();
                      const inRange =
                        tempFilters.startDate &&
                        tempFilters.endDate &&
                        date > tempFilters.startDate &&
                        date < tempFilters.endDate;

                      return (
                        <View key={di} style={styles.dayCell}>
                          {(inRange || isStart || isEnd) && (
                            <View
                              style={[
                                styles.rangeBg,
                                isStart && styles.rangeBgStart,
                                isEnd && styles.rangeBgEnd,
                                inRange && styles.rangeBgMiddle,
                              ]}
                            />
                          )}
                          <TouchableOpacity
                            onPress={() => handleDateSelect(day)}
                            style={[
                              styles.dayButton,
                              (isStart || isEnd) && styles.selectedEndpoint,
                              isToday &&
                                !isStart &&
                                !isEnd &&
                                styles.todayContainer,
                            ]}
                          >
                            <Text
                              style={[
                                styles.dayText,
                                isToday && styles.todayText,
                                (isStart || isEnd) && styles.selectedDayText,
                              ]}
                            >
                              {day}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            )}

            <View style={styles.rangeDisplay}>
              <Text style={styles.rangeDateText}>
                {tempFilters.startDate?.toLocaleDateString() || 'Start'}
              </Text>
              <ArrowRight size={16} color={colors.textMuted} />
              <Text style={styles.rangeDateText}>
                {tempFilters.endDate?.toLocaleDateString() || 'End'}
              </Text>
            </View>

            {showTypeFilter && (
              <>
                <Text style={styles.sectionTitle}>Order Type</Text>
                <View style={styles.chipsContainer}>
                  {TYPE_OPTIONS.map((t) => {
                    const active = tempFilters.po_type?.includes(t);
                    return (
                      <TouchableOpacity
                        key={t}
                        style={[styles.chip, active && styles.chipActive]}
                        onPress={() =>
                          setTempFilters((p) => ({
                            ...p,
                            po_type: active
                              ? p.po_type?.filter((x) => x !== t)
                              : [...(p.po_type || []), t],
                          }))
                        }
                      >
                        <Text
                          style={[
                            styles.chipText,
                            active && styles.chipTextActive,
                          ]}
                        >
                          {t} {active && '✓'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            <Text style={styles.sectionTitle}>Order status</Text>
            <View style={styles.chipsContainer}>
              {STATUS_OPTIONS.filter((s) => !hiddenStatuses.includes(s)).map(
                (s) => {
                  const active = tempFilters.status.includes(s);
                  return (
                    <TouchableOpacity
                      key={s}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() =>
                        setTempFilters((p) => ({
                          ...p,
                          status: active
                            ? p.status.filter((x) => x !== s)
                            : [...p.status, s],
                        }))
                      }
                    >
                      <Text
                        style={[
                          styles.chipText,
                          active && styles.chipTextActive,
                        ]}
                      >
                        {s} {active && '✓'}
                      </Text>
                    </TouchableOpacity>
                  );
                },
              )}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.footerBtnOutline}
              onPress={handleReset}
            >
              <Text style={styles.footerBtnTextOutline}>Clear all</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.footerBtnFilled}
              onPress={handleConfirm}
            >
              <Text style={styles.footerBtnTextFilled}>
                Apply (
                {tempFilters.status.length +
                  (tempFilters.po_type?.length || 0) +
                  (tempFilters.startDate || tempFilters.endDate ? 1 : 0)}
                )
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    backdrop: { ...StyleSheet.absoluteFillObject },
    sheetContainer: {
      backgroundColor: colors.accent,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 24,
      paddingBottom: Platform.OS === 'ios' ? 40 : 24,
      height: '85%',
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: colors.muted,
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 8,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 10,
    },
    resetText: {
      color: colors.red,
      fontSize: 14,
      fontFamily: 'Inter_500Medium',
    },
    title: {
      fontSize: 18,
      fontFamily: 'Inter_600SemiBold',
      color: colors.text,
    },
    closeText: { fontSize: 20, color: colors.textMuted },
    scrollContent: { flex: 1 },
    sectionTitle: {
      fontSize: 16,
      fontFamily: 'Inter_500Medium',
      color: colors.text,
      marginTop: 16,
      marginBottom: 12,
    },
    calendarHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    headerSelectors: { flexDirection: 'row', gap: 8 },
    selectorBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: colors.muted,
    },
    selectorBtnActive: { backgroundColor: colors.secondary },
    monthTitle: {
      fontSize: 15,
      fontFamily: 'Inter_600SemiBold',
      color: colors.text,
    },
    navButton: { padding: 8, backgroundColor: colors.muted, borderRadius: 8 },
    calendarContainer: { marginBottom: 16 },
    weekRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    dayLabel: {
      flex: 1,
      textAlign: 'center',
      fontSize: 12,
      color: colors.textMuted,
    },
    dayCell: {
      flex: 1,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dayButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2,
    },
    selectedEndpoint: { backgroundColor: colors.primary },

    // NEW STYLE FOR TODAY CONTAINER
    todayContainer: {
      borderWidth: 1,
      borderColor: colors.primary,
    },

    dayText: { fontSize: 14, color: colors.text },
    todayText: {
      color: colors.primary,
      fontFamily: 'Inter_600SemiBold',
      fontWeight: '600',
    },
    selectedDayText: { color: '#FFF', fontWeight: 'bold' },
    rangeBg: {
      position: 'absolute',
      height: 32,
      backgroundColor: colors.primary + '20',
    },
    rangeBgStart: { width: '50%', right: 0 },
    rangeBgEnd: { width: '50%', left: 0 },
    rangeBgMiddle: { width: '100%' },
    rangeDisplay: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      marginVertical: 12,
    },
    rangeDateText: { fontSize: 14, color: colors.text },
    chipsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 20,
    },
    chip: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: { color: colors.text },
    chipTextActive: { color: '#FFF' },
    footer: {
      flexDirection: 'row',
      gap: 12,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    footerBtnOutline: {
      flex: 1,
      padding: 14,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    footerBtnTextOutline: { color: colors.text, fontWeight: '600' },
    footerBtnFilled: {
      flex: 1,
      padding: 14,
      borderRadius: 8,
      backgroundColor: colors.primary,
      alignItems: 'center',
    },
    footerBtnTextFilled: { color: '#FFF', fontWeight: '600' },
  });
