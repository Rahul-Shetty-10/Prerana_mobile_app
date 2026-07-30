import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import * as FileSystem from "expo-file-system/legacy";
import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Asset } from "expo-asset";
import * as XLSX from "xlsx";
import { TableViewerProps } from "../types";
import { Badge } from "../../../shared/components";
import { AppIcon } from "../../../shared/icons";
import { colors, radius, shadows, spacing, typography } from "../../../shared/theme";
export function TableViewer({ title }: TableViewerProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors, isDark);


  const [columns, setColumns] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [zoomScale, setZoomScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Search + sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (colKey: string) => {
    if (sortKey === colKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(colKey);
      setSortDir("asc");
    }
  };

  // Filtered + sorted rows derived from raw rows
  const filteredRows = useMemo(() => {
    let result = rows;

    // Search filter — case-insensitive match in any column
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some(
          (v) => typeof v === "string" && v.toLowerCase().includes(q)
        )
      );
    }

    // Column sort
    if (sortKey) {
      result = [...result].sort((a, b) => {
        const av = String(a[sortKey] || "").toLowerCase();
        const bv = String(b[sortKey] || "").toLowerCase();
        const cmp = av.localeCompare(bv, undefined, { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [rows, searchQuery, sortKey, sortDir]);

  const handleDownload = async () => {
    try {
      const asset = Asset.fromModule(require("../../../chapter/Table.xlsx"));
      await asset.downloadAsync();
      await Linking.openURL(asset.uri);
    } catch (err) {
      // Error handled silently
    }
  };

  useEffect(() => {
    async function loadTable() {
      try {
        setIsLoading(true);
        const asset = Asset.fromModule(require("../../../chapter/Table.xlsx"));
        await asset.downloadAsync();
        const localUri = asset.localUri;

        let base64: string;
        if (localUri) {
          // Read file directly via expo-file-system (bypasses Android fetch file:// restriction)
          base64 = await FileSystem.readAsStringAsync(localUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
        } else {
          // Fallback: fetch from remote CDN URI
          const response = await fetch(asset.uri);
          const arrayBuffer = await response.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          let binary = "";
          bytes.forEach((b) => (binary += String.fromCharCode(b)));
          base64 = btoa(binary);
        }

        // Decode base64 → binary → Uint8Array for xlsx
        const binaryStr = atob(base64);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }

        const workbook = XLSX.read(bytes, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length === 0) return;

        const headerCols = jsonData[0].map((colName) => String(colName || "").trim());
        const mappedColumns = headerCols.map((colName) => {
          let width = 120;
          if (
            colName === "Chemical Equation" ||
            colName === "Reactants" ||
            colName === "Observations" ||
            colName === "Key Findings"
          ) {
            width = 200;
          }
          return { key: colName, title: colName, width };
        });

        const mappedRows = jsonData
          .slice(1)
          .map((row, rowIdx) => {
            const rowObj: any = { id: `row-${rowIdx}` };
            headerCols.forEach((colName, colIdx) => {
              rowObj[colName] = row[colIdx] !== undefined ? String(row[colIdx]).trim() : "";
            });
            return rowObj;
          })
          .filter((r) => Object.values(r).some((v) => v !== ""));

        setColumns(mappedColumns);
        setRows(mappedRows);
      } catch (err) {
        // Parse error handled silently
      } finally {
        setIsLoading(false);
      }
    }
    loadTable();
  }, []);

  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(prev + 0.2, 2.0));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => Math.max(prev - 0.2, 0.6));
  };

  const handleReset = () => {
    setZoomScale(1);
    setRotation(0);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const renderTableHeader = () => (
    <View style={styles.headerRowGrid}>
      {columns.map((col) => {
        const cellWidth = col.width || 140;
        const isActive = sortKey === col.key;
        return (
          <Pressable
            key={col.key}
            onPress={() => handleSort(col.key)}
            style={[styles.headerCell, { width: cellWidth, minWidth: cellWidth }]}
          >
            <View style={styles.headerCellInner}>
              <Text numberOfLines={2} style={[styles.headerText, isActive && styles.headerTextActive]}>
                {col.title}
              </Text>
              {isActive ? (
                <AppIcon
                  color={colors.primary.main}
                  name={sortDir === "asc" ? "arrow-up-outline" : "arrow-down-outline"}
                  size={12}
                />
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );

  const renderTableRows = (sourceRows: any[]) => (
    <View>
      {sourceRows.length === 0 ? (
        <View style={styles.noResultsRow}>
          <AppIcon color={themeColors.textMuted} name="search-outline" size={18} />
          <Text style={styles.noResultsText}>No matching rows found</Text>
        </View>
      ) : sourceRows.map((row, rowIdx) => {
        const isEven = rowIdx % 2 === 0;
        return (
          <View
            key={row.id}
            style={[styles.dataRowGrid, isEven ? styles.evenRow : styles.oddRow]}
          >
            {columns.map((col) => {
              const cellWidth = col.width || 140;
              // Highlight search match
              const cellVal = row[col.key] || "-";
              const isMatch =
                searchQuery.trim() &&
                cellVal.toLowerCase().includes(searchQuery.toLowerCase());
              return (
                <View
                  key={`${row.id}-${col.key}`}
                  style={[styles.dataCell, { width: cellWidth, minWidth: cellWidth }]}
                >
                  <Text style={[styles.dataCellText, isMatch && styles.dataCellHighlight]}>
                    {cellVal}
                  </Text>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );

  const renderTableView = (fullScreenMode: boolean, sourceRows: any[]) => (
    <ScrollView
      contentContainerStyle={styles.tableScrollContent}
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator={true}
    >
      <View
        style={[
          styles.tableWrapper,
          {
            transform: [{ scale: zoomScale }, { rotate: `${rotation}deg` }],
          },
        ]}
      >
        {fullScreenMode ? (
          <ScrollView
            nestedScrollEnabled
            showsVerticalScrollIndicator={true}
            stickyHeaderIndices={[0]}
          >
            {renderTableHeader()}
            {renderTableRows(sourceRows)}
          </ScrollView>
        ) : (
          <View>
            {renderTableHeader()}
            {renderTableRows(sourceRows)}
          </View>
        )}
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.card}>
      {/* Table Title & Toolbar Header */}
      <View style={styles.headerRow}>
        <Text numberOfLines={1} style={styles.tableTitle}>
          {title || "Activity Observations Table"}
        </Text>
        <Badge label="EXCEL TABLE" variant="primary" />
      </View>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <AppIcon color={themeColors.textMuted} name="search-outline" size={16} />
        <TextInput
          onChangeText={setSearchQuery}
          placeholder="Search table..."
          placeholderTextColor={themeColors.textMuted}
          style={styles.searchInput}
          value={searchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <AppIcon color={themeColors.textMuted} name="close-circle-outline" size={16} />
          </Pressable>
        )}
      </View>

      {/* Row count + sort info */}
      {!isLoading && (
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {filteredRows.length} of {rows.length} rows
            {sortKey ? ` · Sorted by ${sortKey} ${sortDir === "asc" ? "↑" : "↓"}` : ""}
          </Text>
          {(searchQuery || sortKey) && (
            <Pressable onPress={() => { setSearchQuery(""); setSortKey(null); }}>
              <Text style={styles.clearText}>Clear filters</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Toolbar Controls */}
      <View style={styles.toolbar}>
        <Text style={styles.zoomIndicator}>ZOOM: {Math.round(zoomScale * 100)}%</Text>
        <View style={styles.controlsRow}>
          <Pressable
            onPress={handleZoomOut}
            style={({ pressed }) => [styles.toolBtn, pressed && styles.pressed]}
          >
            <AppIcon color={themeColors.textPrimary} name="remove-outline" size={16} />
          </Pressable>
          <Pressable
            onPress={handleZoomIn}
            style={({ pressed }) => [styles.toolBtn, pressed && styles.pressed]}
          >
            <AppIcon color={themeColors.textPrimary} name="add-outline" size={16} />
          </Pressable>
          <Pressable
            onPress={handleRotate}
            style={({ pressed }) => [styles.toolBtn, pressed && styles.pressed]}
          >
            <AppIcon color={themeColors.textPrimary} name="sync-outline" size={16} />
          </Pressable>
          <Pressable
            onPress={() => setIsFullScreen(true)}
            style={({ pressed }) => [styles.toolBtn, pressed && styles.pressed]}
          >
            <AppIcon color={themeColors.textPrimary} name="expand-outline" size={16} />
          </Pressable>
          <Pressable
            onPress={handleDownload}
            style={({ pressed }) => [styles.toolBtn, pressed && styles.pressed]}
          >
            <AppIcon color={isDark ? colors.primary.light : colors.primary.main} name="download-outline" size={16} />
          </Pressable>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary.main} size="small" />
          <Text style={styles.loadingText}>Loading Table Data...</Text>
        </View>
      ) : (
        <View style={styles.tableScrollContainer}>
          {renderTableView(false, filteredRows)}
        </View>
      )}

      {/* Full Screen Overlay Modal */}
      <Modal animationType="slide" transparent={false} visible={isFullScreen}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title || "Observations Table"}</Text>
            <View style={styles.modalHeaderControls}>
              <Pressable
                onPress={handleRotate}
                style={({ pressed }) => [styles.toolBtn, pressed && styles.pressed]}
              >
                <AppIcon color={themeColors.textPrimary} name="sync-outline" size={16} />
              </Pressable>
              <Pressable
                onPress={handleDownload}
                style={({ pressed }) => [styles.toolBtn, pressed && styles.pressed]}
              >
                <AppIcon color={isDark ? colors.primary.light : colors.primary.main} name="download-outline" size={16} />
              </Pressable>
              <Pressable
                onPress={() => setIsFullScreen(false)}
                style={({ pressed }) => [styles.modalCloseBtn, pressed && styles.pressed]}
              >
                <AppIcon color={themeColors.textPrimary} name="close-outline" size={20} />
              </Pressable>
            </View>
          </View>
          {/* Search inside modal */}
          <View style={[styles.searchBar, { margin: spacing.sm }]}>
            <AppIcon color={themeColors.textMuted} name="search-outline" size={16} />
            <TextInput
              onChangeText={setSearchQuery}
              placeholder="Search..."
              placeholderTextColor={themeColors.textMuted}
              style={styles.searchInput}
              value={searchQuery}
            />
          </View>
          <View style={styles.modalBody}>{renderTableView(true, filteredRows)}</View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (themeColors: any, isDark: boolean) => StyleSheet.create({
  card: {
    backgroundColor: themeColors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    ...shadows.sm,
    gap: spacing.sm,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: themeColors.borderSubtle,
    paddingBottom: spacing.xs,
    gap: spacing.xs,
  },
  tableTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
    flex: 1,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: themeColors.surfaceSecondary,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  zoomIndicator: {
    fontSize: typography.fontSize.xs - 1,
    fontWeight: typography.fontWeight.bold,
    color: isDark ? colors.primary.light : colors.primary.main,
  },
  controlsRow: {
    flexDirection: "row",
    gap: spacing.xs - 2,
  },
  toolBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.xs,
    backgroundColor: themeColors.surface,
    borderWidth: 1,
    borderColor: themeColors.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    paddingVertical: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  loadingText: {
    fontSize: typography.fontSize.xs,
    color: themeColors.textMuted,
  },
  tableScrollContainer: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: themeColors.border,
    overflow: "hidden",
    backgroundColor: themeColors.surfaceSecondary,
  },
  tableScrollContent: {
    flexGrow: 1,
  },
  tableWrapper: {
    flexDirection: "column",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: themeColors.surfaceSecondary,
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginHorizontal: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: themeColors.textPrimary,
    paddingVertical: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  metaText: {
    fontSize: typography.fontSize.xs - 1,
    color: themeColors.textMuted,
  },
  clearText: {
    fontSize: typography.fontSize.xs - 1,
    color: colors.primary.main,
    fontWeight: typography.fontWeight.bold,
  },
  headerRowGrid: {
    flexDirection: "row",
    backgroundColor: themeColors.surfaceHighlighted,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  headerCell: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs + 2,
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: themeColors.borderSubtle,
  },
  headerCellInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  noResultsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    padding: spacing.lg,
  },
  noResultsText: {
    fontSize: typography.fontSize.sm,
    color: themeColors.textMuted,
  },
  headerText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    color: isDark ? colors.primary.light : colors.primary.main,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dataRowGrid: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: themeColors.borderSubtle,
  },
  evenRow: {
    backgroundColor: themeColors.surfaceSecondary,
  },
  oddRow: {
    backgroundColor: themeColors.surface,
  },
  dataCell: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs + 2,
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: themeColors.borderSubtle,
  },
  headerTextActive: {
    color: colors.primary.main,
  },
  dataCellText: {
    fontSize: typography.fontSize.xs + 1,
    color: themeColors.textPrimary,
    lineHeight: typography.lineHeight.sm + 2,
  },
  dataCellHighlight: {
    color: isDark ? colors.primary.light : colors.primary.main,
    fontWeight: typography.fontWeight.bold,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: themeColors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  modalTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.heavy,
    color: themeColors.textPrimary,
    flex: 1,
  },
  modalHeaderControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: themeColors.surfaceSecondary,
    borderWidth: 1,
    borderColor: themeColors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: {
    flex: 1,
    padding: spacing.sm,
  },
  pressed: {
    opacity: 0.75,
  },
});