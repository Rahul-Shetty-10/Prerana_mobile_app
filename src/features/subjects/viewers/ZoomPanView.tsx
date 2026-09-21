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

  // Swap width and height when rotated by 90 or 270 degrees to keep correct landscape aspect ratio in portrait container
  const isRotated = rotation % 180 !== 0;
  const innerWidth = isRotated ? height : width;
  const innerHeight = isRotated ? width : height;

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
    if (touches.length >= 2) {
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

  const rotationRef = useRef(rotation);
  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  const initialDistance = useRef(0);
  const pinchStartScale = useRef(1);
  const isPinching = useRef(false);
  const panStartTranslate = useRef({ x: 0, y: 0 });

  const panResponder = useRef(
    PanResponder.create({
      // Intercept gesture starts immediately at capture level if pinch-zooming or already zoomed in
      onStartShouldSetPanResponderCapture: (evt) => {
        const numTouches = evt.nativeEvent.touches ? evt.nativeEvent.touches.length : 0;
        return numTouches >= 2 || zoomScaleRef.current > 1.05;
      },
      onMoveShouldSetPanResponderCapture: (evt) => {
        const numTouches = evt.nativeEvent.touches ? evt.nativeEvent.touches.length : 0;
        return numTouches >= 2 || zoomScaleRef.current > 1.05;
      },
      onStartShouldSetPanResponder: (evt) => {
        const numTouches = evt.nativeEvent.touches ? evt.nativeEvent.touches.length : 0;
        return numTouches >= 2 || zoomScaleRef.current > 1.05;
      },
      onMoveShouldSetPanResponder: (evt) => {
        const numTouches = evt.nativeEvent.touches ? evt.nativeEvent.touches.length : 0;
        return numTouches >= 2 || zoomScaleRef.current > 1.05;
      },
      onPanResponderTerminationRequest: () => {
        return !(isPinching.current || zoomScaleRef.current > 1.05);
      },
      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches && touches.length >= 2) {
          isPinching.current = true;
          initialDistance.current = getDistance(evt);
          pinchStartScale.current = lastScale.current;
        } else {
          isPinching.current = false;
          panStartTranslate.current = { x: lastTranslate.current.x, y: lastTranslate.current.y };
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;
        const numTouches = touches ? touches.length : 0;

        if (numTouches >= 2) {
          const currentDistance = getDistance(evt);
          if (!isPinching.current || initialDistance.current === 0) {
            if (currentDistance > 0) {
              isPinching.current = true;
              initialDistance.current = currentDistance;
              pinchStartScale.current = lastScale.current;
            }
          } else if (initialDistance.current > 0 && currentDistance > 0) {
            const nextScale = pinchStartScale.current * (currentDistance / initialDistance.current);
            const clampedScale = Math.max(0.8, Math.min(nextScale, 4.0));
            scale.setValue(clampedScale);
            setZoomScale(clampedScale);
          }
        } else if (numTouches === 1 && !isPinching.current) {
          const dx = gestureState.dx;
          const dy = gestureState.dy;
          translateX.setValue(panStartTranslate.current.x + dx);
          translateY.setValue(panStartTranslate.current.y + dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const wasPinching = isPinching.current;
        isPinching.current = false;
        initialDistance.current = 0;

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
          const targetX = wasPinching
            ? lastTranslate.current.x
            : panStartTranslate.current.x + (gestureState.dx || 0);
          const targetY = wasPinching
            ? lastTranslate.current.y
            : panStartTranslate.current.y + (gestureState.dy || 0);

          const currentRotation = rotationRef.current;
          const currentIsRotated = currentRotation % 180 !== 0;
          const effW = currentIsRotated ? height : width;
          const effH = currentIsRotated ? width : height;

          const maxDragX = (effW * currentScale - effW) / 2 + 50;
          const maxDragY = (effH * currentScale - effH) / 2 + 50;

          let boundedX = Math.max(-maxDragX, Math.min(targetX, maxDragX));
          let boundedY = Math.max(-maxDragY, Math.min(targetY, maxDragY));

          lastTranslate.current = { x: boundedX, y: boundedY };

          if (boundedX !== targetX || boundedY !== targetY) {
            Animated.parallel([
              Animated.spring(translateX, { toValue: boundedX, useNativeDriver: true, friction: 8, tension: 50 }),
              Animated.spring(translateY, { toValue: boundedY, useNativeDriver: true, friction: 8, tension: 50 }),
            ]).start();
          } else {
            translateX.setValue(boundedX);
            translateY.setValue(boundedY);
          }
        }
      },
    })
  ).current;

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
