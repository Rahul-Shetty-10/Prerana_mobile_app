import React, { useRef, useEffect } from "react";
import {
  Animated,
  PanResponder,
  View,
  GestureResponderEvent,
} from "react-native";

interface ZoomPanViewProps {
  children: React.ReactNode | ((dims: { width: number; height: number }) => React.ReactNode);
  width: number;
  height: number;
  zoomScale: number;
  setZoomScale: (scale: number) => void;
  rotation: number;
}

export function ZoomPanView({
  children,
  width,
  height,
  zoomScale,
  setZoomScale,
  rotation,
}: ZoomPanViewProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const lastScale = useRef(1);
  const lastTranslate = useRef({ x: 0, y: 0 });
  const pinchStartScale = useRef(1);
  const initialDistance = useRef(0);
  const isPinching = useRef(false);

  // Sync zoomScale changes from parent toolbar
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: zoomScale,
        useNativeDriver: true,
        friction: 8,
        tension: 50,
      }),
      ...(zoomScale === 1
        ? [
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true, friction: 8, tension: 50 }),
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 8, tension: 50 }),
          ]
        : []),
    ]).start();
    lastScale.current = zoomScale;
    if (zoomScale === 1) {
      lastTranslate.current = { x: 0, y: 0 };
    }
  }, [zoomScale]);

  // Sync rotation changes using Animated spring to prevent Native Driver bugs with static values in transforms
  useEffect(() => {
    Animated.spring(rotationAnim, {
      toValue: rotation,
      useNativeDriver: true,
      friction: 8,
      tension: 50,
    }).start();
  }, [rotation]);

  const rotateStr = rotationAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  const getDistance = (evt: GestureResponderEvent) => {
    const touches = evt.nativeEvent.touches;
    if (touches && touches.length >= 2) {
      const dx = touches[0].pageX - touches[1].pageX;
      const dy = touches[0].pageY - touches[1].pageY;
      return Math.sqrt(dx * dx + dy * dy);
    }
    return 0;
  };

  const zoomScaleRef = useRef(zoomScale);
  useEffect(() => {
    zoomScaleRef.current = zoomScale;
  }, [zoomScale]);

  const panResponder = useRef(
    PanResponder.create({
      // Intercept gesture starts immediately at capture level if pinch-zooming or already zoomed in
      onStartShouldSetPanResponderCapture: (evt) => {
        return evt.nativeEvent.touches.length >= 2 || zoomScaleRef.current > 1.05;
      },
      onMoveShouldSetPanResponderCapture: (evt) => {
        return evt.nativeEvent.touches.length >= 2 || zoomScaleRef.current > 1.05;
      },
      onStartShouldSetPanResponder: (evt) => {
        return evt.nativeEvent.touches.length >= 2 || zoomScaleRef.current > 1.05;
      },
      onMoveShouldSetPanResponder: (evt) => {
        return evt.nativeEvent.touches.length >= 2 || zoomScaleRef.current > 1.05;
      },
      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches && touches.length >= 2) {
          isPinching.current = true;
          initialDistance.current = getDistance(evt);
          pinchStartScale.current = lastScale.current;
        } else {
          isPinching.current = false;
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;

        if (touches && touches.length >= 2) {
          if (!isPinching.current || initialDistance.current === 0) {
            isPinching.current = true;
            initialDistance.current = getDistance(evt);
            pinchStartScale.current = lastScale.current;
          }
          const currentDistance = getDistance(evt);
          if (initialDistance.current > 0 && currentDistance > 0) {
            const ratio = currentDistance / initialDistance.current;
            const nextScale = pinchStartScale.current * ratio;
            const clampedScale = Math.max(0.8, Math.min(nextScale, 4.0));
            scale.setValue(clampedScale);
            setZoomScale(clampedScale);
          }
        } else if (touches && touches.length === 1 && !isPinching.current) {
          const dx = gestureState.dx;
          const dy = gestureState.dy;
          translateX.setValue(lastTranslate.current.x + dx);
          translateY.setValue(lastTranslate.current.y + dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        isPinching.current = false;

        let currentScale = 1;
        try {
          // @ts-ignore
          currentScale = scale.__getValue();
        } catch (_) {}

        if (currentScale <= 1.05) {
          Animated.parallel([
            Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 8, tension: 50 }),
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true, friction: 8, tension: 50 }),
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 8, tension: 50 }),
          ]).start();
          lastScale.current = 1;
          lastTranslate.current = { x: 0, y: 0 };
          setZoomScale(1);
        } else {
          lastScale.current = currentScale;
          lastTranslate.current = {
            x: lastTranslate.current.x + gestureState.dx,
            y: lastTranslate.current.y + gestureState.dy,
          };

          const isRotated = rotation % 180 !== 0;
          const effectiveW = isRotated ? height : width;
          const effectiveH = isRotated ? width : height;

          const maxDragX = (effectiveW * currentScale - effectiveW) / 2 + 50;
          const maxDragY = (effectiveH * currentScale - effectiveH) / 2 + 50;

          let boundedX = Math.max(-maxDragX, Math.min(lastTranslate.current.x, maxDragX));
          let boundedY = Math.max(-maxDragY, Math.min(lastTranslate.current.y, maxDragY));

          if (boundedX !== lastTranslate.current.x || boundedY !== lastTranslate.current.y) {
            Animated.parallel([
              Animated.spring(translateX, { toValue: boundedX, useNativeDriver: true, friction: 8, tension: 50 }),
              Animated.spring(translateY, { toValue: boundedY, useNativeDriver: true, friction: 8, tension: 50 }),
            ]).start();
            lastTranslate.current = { x: boundedX, y: boundedY };
          }
        }
      },
    })
  ).current;

  const isRotated = rotation % 180 !== 0;
  const innerWidth = isRotated ? height : width;
  const innerHeight = isRotated ? width : height;

  return (
    <View
      style={{
        width,
        height,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
      }}
      {...panResponder.panHandlers}
    >
      <Animated.View
        style={{
          width: innerWidth,
          height: innerHeight,
          transform: [
            { scale },
            { translateX },
            { translateY },
            { rotate: rotateStr },
          ],
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {typeof children === "function"
          ? (children as Function)({ width: innerWidth, height: innerHeight })
          : children}
      </Animated.View>
    </View>
  );
}
