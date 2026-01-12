import React from 'react';
import Svg, { Circle, Polyline } from 'react-native-svg';

interface MiniSparklineProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}

export const MiniSparkline = ({ 
  data, 
  color, 
  width = 120, 
  height = 40 
}: MiniSparklineProps) => {
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const lastX = width;
  const lastY = height - ((data[data.length - 1] - min) / range) * height;

  return (
    <Svg width={width} height={height}>
      <Polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <Circle cx={lastX} cy={lastY} r="4" fill={color} />
    </Svg>
  );
};