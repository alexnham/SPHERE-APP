import React, { useEffect, useRef, useState } from 'react';
import { Text, Animated, Easing } from 'react-native';
import { formatCurrency } from '../../lib/utils';

interface AnimatedMoneyProps {
  value: number;
  style?: any;
  duration?: number;
  delay?: number;
}

export const AnimatedMoney: React.FC<AnimatedMoneyProps> = ({
  value,
  style,
  duration = 1500,
  delay = 0,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayAmount, setDisplayAmount] = useState(0);
  const previousValue = useRef<number | null>(null);
  const listenerId = useRef<string | null>(null);

  useEffect(() => {
    // Get the starting value (previous value or 0 for first render)
    const startValue = previousValue.current ?? 0;
    
    // Update previous value
    previousValue.current = value;

    // Reset animation
    animatedValue.setValue(0);
    setDisplayAmount(startValue);

    // Remove previous listener if exists
    if (listenerId.current) {
      animatedValue.removeListener(listenerId.current);
    }

    // Create animation
    const animation = Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic), // Smooth easing
      useNativeDriver: false,
    });

    // Listen to animation updates
    listenerId.current = animatedValue.addListener(({ value: progress }) => {
      const currentValue = Math.floor(startValue + (value - startValue) * progress);
      setDisplayAmount(currentValue);
    });

    animation.start();

    return () => {
      animation.stop();
      if (listenerId.current) {
        animatedValue.removeListener(listenerId.current);
      }
    };
  }, [value, duration, delay]);

  return (
    <Text style={style}>
      {formatCurrency(displayAmount)}
    </Text>
  );
};
