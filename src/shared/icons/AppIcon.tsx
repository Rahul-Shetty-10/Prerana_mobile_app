import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { TextStyle } from "react-native";

import type { IconName } from "./types";
export type { IconName };

export interface AppIconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: TextStyle;
}

export function AppIcon({ name, size = 20, color = "#FFF7F3", style }: AppIconProps) {
  return <Ionicons color={color} name={name} size={size} style={style} />;
}