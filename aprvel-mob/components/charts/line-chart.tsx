import { useColor } from '@/hooks/useColor';
import { useEffect, useState } from 'react';
import { LayoutChangeEvent, View, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

interface ChartConfig {
  width?: number;
  height?: number;
  padding?: number;
  showGrid?: boolean;
  showLabels?: boolean;
  animated?: boolean;
  duration?: number;
  gradient?: boolean;
  interactive?: boolean;
  showYLabels?: boolean;
  yLabelCount?: number;
  yAxisWidth?: number;
  showHorizontalGrid?: boolean;
  showVerticalGrid?: boolean;
  bottomPaddingRatio?: number;
  paddingBottom?: number;
}

export type ChartDataPoint = {
  x: string | number;
  y: number;
  label?: string;
};

// Utility functions
const createPath = (points: { x: number; y: number }[]): string => {
  if (points.length === 0) return '';
  if (points.length === 1) return `M${points[0].x},${points[0].y}`;

  let path = `M${points[0].x},${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const curvature = 0.2;

    const cp1x = p1.x + (p2.x - p0.x) * curvature;
    const cp1y = p1.y + (p2.y - p0.y) * curvature;

    const cp2x = p2.x - (p3.x - p1.x) * curvature;
    const cp2y = p2.y - (p3.y - p1.y) * curvature;

    path += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }

  return path;
};

const createAreaPath = (
  points: { x: number; y: number }[],
  height: number,
): string => {
  if (points.length === 0) return '';

  let path = createPath(points);
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];

  path += ` L${lastPoint.x},${height} L${firstPoint.x},${height} Z`;

  return path;
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toFixed(0);
};

// Animated SVG Components
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// --- FIXED CHART POINT COMPONENT ---
type ChartPointProps = {
  point: { x: number; y: number };
  index: number;
  animationProgress: SharedValue<number>;
  color: string;
};

const ChartPoint = ({ point, animationProgress, color }: ChartPointProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    // Subtle animation:
    // Opacity follows the progress exactly.
    // Scale goes from 0.5 to 1.0 smoothly.
    const scale = interpolate(
      animationProgress.value,
      [0, 1],
      [0.5, 1],
      Extrapolation.CLAMP,
    );

    return {
      opacity: animationProgress.value,
      transform: [{ scale }],
    };
  });

  return (
    <AnimatedCircle
      cx={point.x}
      cy={point.y}
      r={4}
      fill={color}
      // IMPORTANT: Set origin to center so it scales in place
      origin={`${point.x}, ${point.y}`}
      animatedProps={animatedStyle}
    />
  );
};

type Props = {
  data: ChartDataPoint[];
  config?: ChartConfig;
  style?: ViewStyle;
};

export const LineChart = ({ data, config = {}, style }: Props) => {
  const [containerWidth, setContainerWidth] = useState(300);

  const {
    height = 200,
    padding = 20,
    showGrid = true,
    showLabels = true,
    animated = true,
    duration = 1000,
    gradient = false,
    interactive = false,
    showYLabels = true,
    yLabelCount = 5,
    yAxisWidth = 20,
    showHorizontalGrid = false,
    showVerticalGrid = false,
    bottomPaddingRatio = 0,
    paddingBottom,
  } = config;

  const chartWidth = containerWidth || config.width || 300;

  const primaryColor = useColor('primary');
  const mutedColor = useColor('mutedForeground');

  const animationProgress = useSharedValue(0);
  const touchX = useSharedValue(0);
  const showTooltip = useSharedValue(false);

  const areaAnimatedProps = useAnimatedProps(() => ({
    strokeDasharray: animated
      ? `${animationProgress.value * 1000} 1000`
      : undefined,
  }));

  const lineAnimatedProps = useAnimatedProps(() => ({
    strokeDasharray: animated
      ? `${animationProgress.value * 1000} 1000`
      : undefined,
  }));

  useEffect(() => {
    if (animated && data.length > 0) {
      animationProgress.value = 0;
      animationProgress.value = withTiming(1, { duration });
    } else {
      animationProgress.value = 1;
    }
  }, [data, animated, duration, animationProgress]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onStart((event) => {
      if (interactive) {
        touchX.value = event.x;
        showTooltip.value = true;
      }
    })
    .onUpdate((event) => {
      if (interactive) {
        touchX.value = event.x;
      }
    })
    .onEnd(() => {
      if (interactive) {
        showTooltip.value = false;
      }
    });

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width: measuredWidth } = event.nativeEvent.layout;
    if (measuredWidth > 0) {
      setContainerWidth(measuredWidth);
    }
  };

  const hasData = data.length > 0;

  const maxValue = hasData ? Math.max(...data.map((d) => d.y)) : 0;
  const rawMinValue = hasData ? Math.min(...data.map((d) => d.y)) : 0;
  const rawRange = maxValue - rawMinValue || 1;

  const buffer = rawRange * (bottomPaddingRatio || 0);
  const minValue = rawMinValue - buffer;
  const valueRange = maxValue - minValue || 1;

  const effectivePaddingBottom = paddingBottom ?? padding;
  const leftPadding = showYLabels ? padding + yAxisWidth : padding;
  const innerChartWidth = chartWidth - leftPadding - padding;
  const chartHeight = height - padding - effectivePaddingBottom;

  const points = hasData
    ? data.map((point, index) => {
        const xOffset =
          data.length > 1
            ? (index / (data.length - 1)) * innerChartWidth
            : innerChartWidth / 2;
        return {
          x: leftPadding + xOffset,
          y: padding + ((maxValue - point.y) / valueRange) * chartHeight,
        };
      })
    : [];

  const pathData = createPath(points);
  const areaPathData = gradient
    ? createAreaPath(points, height - effectivePaddingBottom)
    : '';

  const yAxisLabels = [];
  if (showYLabels && hasData) {
    for (let i = 0; i < yLabelCount; i++) {
      const ratio = i / (yLabelCount - 1);
      const value = maxValue - ratio * valueRange;
      const y = padding + ratio * chartHeight;
      yAxisLabels.push({ value, y });
    }
  }

  return (
    <View style={[{ width: '100%', height }, style]} onLayout={handleLayout}>
      {hasData ? (
        <GestureDetector gesture={panGesture}>
          <Animated.View>
            <Svg width={chartWidth} height={height}>
              <Defs>
                {gradient && (
                  <LinearGradient
                    id='gradient'
                    x1='0%'
                    y1='0%'
                    x2='0%'
                    y2='100%'
                  >
                    <Stop
                      offset='0%'
                      stopColor={primaryColor}
                      stopOpacity='0.3'
                    />
                    <Stop
                      offset='100%'
                      stopColor={primaryColor}
                      stopOpacity='0.05'
                    />
                  </LinearGradient>
                )}
              </Defs>

              {/* Y-axis labels */}
              {showYLabels && (
                <G>
                  {yAxisLabels.map((label, index) => (
                    <SvgText
                      key={`y-label-${index}`}
                      x={leftPadding - 10}
                      y={label.y + 4}
                      textAnchor='end'
                      fontSize={10}
                      fill={mutedColor}
                    >
                      {formatNumber(label.value)}
                    </SvgText>
                  ))}
                </G>
              )}

              {/* Grid lines */}
              {(showGrid || showHorizontalGrid || showVerticalGrid) && (
                <G>
                  {(showHorizontalGrid || (showGrid && !showVerticalGrid)) &&
                    yAxisLabels.map((label, index) => (
                      <Line
                        key={`grid-h-${index}`}
                        x1={leftPadding}
                        y1={label.y}
                        x2={chartWidth - padding}
                        y2={label.y}
                        stroke={mutedColor}
                        strokeWidth={0.5}
                        opacity={0.3}
                      />
                    ))}

                  {(showVerticalGrid || (showGrid && !showHorizontalGrid)) &&
                    points.map((point, index) => (
                      <Line
                        key={`grid-v-${index}`}
                        x1={point.x}
                        y1={padding}
                        x2={point.x}
                        y2={height - effectivePaddingBottom}
                        stroke={mutedColor}
                        strokeWidth={0.5}
                        opacity={0.2}
                      />
                    ))}
                </G>
              )}

              {/* Area fill */}
              {gradient && (
                <AnimatedPath
                  d={areaPathData}
                  fill='url(#gradient)'
                  animatedProps={areaAnimatedProps}
                />
              )}

              {/* Line path */}
              <AnimatedPath
                d={pathData}
                stroke={primaryColor}
                strokeWidth={2}
                fill='none'
                strokeLinecap='round'
                strokeLinejoin='round'
                animatedProps={lineAnimatedProps}
              />

              {/* Data points */}
              {points.map((point, index) => (
                <ChartPoint
                  key={`point-${index}`}
                  point={point}
                  index={index}
                  animationProgress={animationProgress}
                  color={primaryColor}
                />
              ))}

              {/* X-axis labels */}
              {showLabels && (
                <G>
                  {data.map((point, index) => (
                    <SvgText
                      key={`x-label-${index}`}
                      x={points[index].x}
                      y={height - 5}
                      textAnchor='middle'
                      fontSize={10}
                      fill={mutedColor}
                    >
                      {point.label || point.x.toString()}
                    </SvgText>
                  ))}
                </G>
              )}
            </Svg>
          </Animated.View>
        </GestureDetector>
      ) : null}
    </View>
  );
};
