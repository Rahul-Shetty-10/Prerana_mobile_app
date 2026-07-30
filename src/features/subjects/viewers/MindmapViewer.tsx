import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { Alert, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Badge } from "../../../shared/components/Badge";
import { Card } from "../../../shared/components/Card";
import { AppIcon } from "../../../shared/icons";
import { colors, radius, spacing, typography } from "../../../shared/theme";
import { MindmapViewerProps } from "../types";
import { ViewerToolbar } from "./ViewerToolbar";
import { HTML_TO_IMAGE_SOURCE } from "./htmlToImageSource";

// ─── Complete Detailed Node Content ──────────────────────────────────────────

interface NodeDetail {
  title: string;
  explanation: string;
  keyPoints: string[];
  examples: string;
  relatedConcepts: string[];
}

const MINDMAP_DATA: Record<string, NodeDetail> = {
  "node-root": {
    title: "Chemical Reactions & Equations",
    explanation: "The central concept of chemistry mapping how chemical transformations occur, how they are represented, balanced, and categorized under conservation laws.",
    keyPoints: [
      "Follows the Law of Conservation of Mass.",
      "Involves breaking of old chemical bonds and forming of new ones.",
      "Symbolically represented by balanced chemical equations."
    ],
    examples: "Reactants (LHS) ──> Products (RHS)",
    relatedConcepts: ["Reactants", "Products", "Law of Conservation of Mass", "Stochiometry"]
  },
  "node-reactions": {
    title: "Chemical Reactions",
    explanation: "A process in which one or more starting substances (reactants) react to form new substances (products) with entirely different chemical properties.",
    keyPoints: [
      "Accompanied by key observations: gas evolution, color changes, precipitate formation.",
      "Can be exothermic (release heat) or endothermic (absorb heat).",
      "Atoms are rearranged, not created or destroyed."
    ],
    examples: "Burning of coal: C(s) + O₂(g) ──> CO₂(g) + Heat",
    relatedConcepts: ["Chemical Change", "Reactants", "Products", "Exothermic Processes"]
  },
  "node-equations": {
    title: "Chemical Equations",
    explanation: "A concise and symbolic representation of a chemical reaction using symbols and chemical formulas of the reactants and products.",
    keyPoints: [
      "Skeletal equations are unbalanced; balanced equations have equal atoms on both sides.",
      "State symbols enhance the equation's information: (s), (l), (g), (aq).",
      "Reaction conditions (heat, catalyst, pressure) are written above/below the arrow."
    ],
    examples: "Magnesium burning: 2Mg(s) + O₂(g) ──> 2MgO(s)",
    relatedConcepts: ["Stoichiometry", "Chemical Formulas", "Aqueous Solutions"]
  },
  "node-balancing": {
    title: "Balancing Equations",
    explanation: "The process of equalizing the number of atoms of each element on both sides of a chemical equation to satisfy the Law of Conservation of Mass.",
    keyPoints: [
      "Uses the 'Hit and Trial' method to assign coefficients.",
      "Coefficients are added in front of formulas, never changing the subscripts.",
      "Ensures that total mass remains conserved throughout the reaction."
    ],
    examples: "Balanced Iron & Water: 3Fe(s) + 4H₂O(g) ──> Fe₃O₄(s) + 4H₂(g)",
    relatedConcepts: ["Law of Conservation of Mass", "Stoichiometric Coefficients", "Hit & Trial Method"]
  },
  "node-types": {
    title: "Types of Reactions",
    explanation: "Chemical reactions are structurally categorized based on how atoms and ions are reorganized to form new compounds.",
    keyPoints: [
      "Helps predict reaction outcomes based on reactant patterns.",
      "Divided into combination, decomposition, displacement, and double displacement.",
      "Many reactions can also be redox or precipitation reactions."
    ],
    examples: "Decomposition of limestone vs combination of hydrogen and oxygen.",
    relatedConcepts: ["Reaction Classification", "Reactivity Series", "Precipitation"]
  },
  "node-combination": {
    title: "Combination Reaction",
    explanation: "A reaction where two or more simple reactants combine together to form a single product.",
    keyPoints: [
      "Usually highly exothermic, releasing heat energy.",
      "Often involves burning or combustion of elements in oxygen.",
      "Key to synthesizing larger chemical structures."
    ],
    examples: "Quicklime and water: CaO(s) + H₂O(l) ──> Ca(OH)₂(aq) + Heat",
    relatedConcepts: ["Synthesis", "Exothermic Reactions", "Quicklime & Slaked Lime"]
  },
  "node-decomposition": {
    title: "Decomposition Reaction",
    explanation: "A reaction in which a single compound breaks down into two or more simpler substances.",
    keyPoints: [
      "Endothermic process requiring energy to break bonds.",
      "Types: Thermal (heat), Electrolytic (electricity), and Photolytic (light).",
      "Opposite of combination reactions."
    ],
    examples: "Electrolysis of Water: 2H₂O(l) ──> 2H₂(g) + O₂(g)",
    relatedConcepts: ["Thermal Decomposition", "Electrolysis", "Photolysis of Silver Chloride"]
  },
  "node-displacement": {
    title: "Displacement Reaction",
    explanation: "A reaction in which a more reactive element displaces a less reactive element from its salt solution.",
    keyPoints: [
      "Governed by the Reactivity Series of metals.",
      "Typically fast, single replacement ionic reactions.",
      "Usually accompanied by a visible change in solution color."
    ],
    examples: "Iron in copper sulphate: Fe(s) + CuSO₄(aq) ──> FeSO₄(aq) + Cu(s)",
    relatedConcepts: ["Reactivity Series", "Single Replacement", "Metal Activity"]
  },
  "node-double": {
    title: "Double Displacement",
    explanation: "A chemical reaction in which two compounds react by exchanging ions to form two new compounds.",
    keyPoints: [
      "Often forms an insoluble solid called a precipitate.",
      "Commonly occurs between aqueous solutions of ionic compounds.",
      "Also known as neutralization or precipitation reactions."
    ],
    examples: "Barium sulfate precipitation: Na₂SO₄(aq) + BaCl₂(aq) ──> BaSO₄(s) + 2NaCl(aq)",
    relatedConcepts: ["Precipitate Formation", "Ion Exchange", "Neutralization"]
  },
  "node-oxidation": {
    title: "Oxidation",
    explanation: "A chemical process characterized by the gain of oxygen, loss of hydrogen, or loss of electrons by a substance.",
    keyPoints: [
      "Substance gaining oxygen is oxidized.",
      "Acts as a reducing agent by donating electrons.",
      "Critical for respiration, combustion, and cellular energy."
    ],
    examples: "Copper oxidation: 2Cu(s) + O₂(g) ──> 2CuO(s) (Black coating)",
    relatedConcepts: ["Oxidizing Agent", "Electron Loss", "Combustion"]
  },
  "node-reduction": {
    title: "Reduction",
    explanation: "A process involving the loss of oxygen, gain of hydrogen, or gain of electrons by a chemical substance.",
    keyPoints: [
      "Substance losing oxygen is reduced.",
      "Complementary process to oxidation.",
      "Acts as an oxidizing agent by accepting electrons."
    ],
    examples: "Reduction of CuO: CuO(s) + H₂(g) ──> Cu(s) + H₂O(g)",
    relatedConcepts: ["Redox Reactions", "Reducing Agent", "Electron Gain"]
  },
  "node-corrosion": {
    title: "Corrosion",
    explanation: "The slow and gradual eating up of metals by the action of air, moisture, or chemical acids on their surface.",
    keyPoints: [
      "A natural oxidation process that degrades metal integrity.",
      "Rusting of iron is the most common example.",
      "Prevented by oiling, painting, galvanization, or alloying."
    ],
    examples: "Rusting of iron: Fe₂O₃·xH₂O (Reddish-brown hydrated oxide)",
    relatedConcepts: ["Rusting", "Galvanization", "Sacrificial Protection"]
  },
  "node-rancidity": {
    title: "Rancidity",
    explanation: "The condition produced by the slow oxidation of fats and oils in food materials, resulting in unpleasant odors and taste.",
    keyPoints: [
      "Spoils the nutritional value and safety of food products.",
      "Prevented by storing food in airtight containers.",
      "Commonly prevented by flushing packaging with inert Nitrogen gas."
    ],
    examples: "Spoilage of butter/oil; chips bags flushed with Nitrogen.",
    relatedConcepts: ["Food Preservation", "Antioxidants", "Slow Oxidation"]
  },
  "node-applications": {
    title: "Applications",
    explanation: "Understanding chemical reactions allows us to synthesize new materials, generate energy, and control chemical deterioration in real-life applications.",
    keyPoints: [
      "Used in metallurgy for extracting pure metals from ores.",
      "Vital in the pharmaceutical industry to synthesize life-saving drugs.",
      "Enables the manufacturing of batteries, plastics, and fertilizers."
    ],
    examples: "Galvanizing iron to construct long-lasting bridges.",
    relatedConcepts: ["Industrial Chemistry", "Metallurgy", "Rust Prevention"]
  }
};

export function MindmapViewer({ title }: MindmapViewerProps) {
  const { theme, isDark } = useTheme();
  const themeColors = colors[theme as "light" | "dark"];
  const styles = getStyles(themeColors);

  const webViewRef = useRef<WebView>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("node-root");
  const [zoomScale, setZoomScale] = useState<number>(0.45);
  const [panX, setPanX] = useState<number>(140);
  const [panY, setPanY] = useState<number>(50);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleLoadEnd = () => {
    const injectTheme = `if (typeof setTheme === 'function') { setTheme("${theme}", ${isDark}); }`;
    const injectState = `if (typeof initializeState === 'function') { initializeState(${zoomScale}, ${panX}, ${panY}, "${selectedNodeId}"); }`;
    webViewRef.current?.injectJavaScript(injectTheme + injectState);
  };

  // Synchronize theme with WebView
  useEffect(() => {
    if (Platform.OS === "web") return;
    const injectTheme = `if (typeof setTheme === 'function') { setTheme("${theme}", ${isDark}); }`;
    webViewRef.current?.injectJavaScript(injectTheme);
  }, [theme, isDark]);

  const handleZoomIn = () => {
    webViewRef.current?.injectJavaScript("if (typeof zoomIn === 'function') { zoomIn(); }");
  };

  const handleZoomOut = () => {
    webViewRef.current?.injectJavaScript("if (typeof zoomOut === 'function') { zoomOut(); }");
  };

  const handleReset = () => {
    webViewRef.current?.injectJavaScript("if (typeof resetView === 'function') { resetView(); }");
    setSelectedNodeId("node-root");
    setRotation(0);
  };

  const handleFit = () => {
    webViewRef.current?.injectJavaScript("if (typeof fitView === 'function') { fitView(); }");
  };

  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  const getFilename = () => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const YYYY = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const DD = pad(d.getDate());
    const HH = pad(d.getHours());
    const Min = pad(d.getMinutes());
    return `mind-map-${YYYY}-${MM}-${DD}-${HH}-${Min}.png`;
  };

  const triggerFileDownload = async (base64Data: string) => {
    const filename = getFilename();
    try {
      if (Platform.OS === "web") {
        const link = document.createElement("a");
        link.href = base64Data;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        Alert.alert("Success", "Mind Map downloaded successfully!");
      } else {
        const tempPath = `${FileSystem.documentDirectory}${filename}`;
        const base64DataClean = base64Data.replace(/^data:image\/png;base64,/, "");
        await FileSystem.writeAsStringAsync(tempPath, base64DataClean, {
          encoding: FileSystem.EncodingType.Base64,
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(tempPath, {
            mimeType: "image/png",
            dialogTitle: "Save Mind Map",
          });
          Alert.alert("Success", "Mind Map downloaded successfully!");
        }
      }
    } catch (err) {
      Alert.alert("Download Failed", "Unable to save the Mind Map image.");
    }
  };

  const handleMessagePayload = (msg: any) => {
    if (msg.type === "NODE_SELECTED") {
      setSelectedNodeId(msg.nodeId);
    } else if (msg.type === "TRANSFORM_UPDATE") {
      setZoomScale(msg.scale);
      setPanX(msg.panX);
      setPanY(msg.panY);
    } else if (msg.type === "MINDMAP_DOWNLOAD_SUCCESS") {
      setIsDownloading(false);
      triggerFileDownload(msg.base64);
    } else if (msg.type === "MINDMAP_DOWNLOAD_ERROR") {
      setIsDownloading(false);
      Alert.alert("Download Failed", msg.error || "Unable to generate Mind Map image.");
    }
  };

  const handleMessage = (event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      handleMessagePayload(msg);
    } catch (e) {
      // Fail silently
    }
  };

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const handleWebMessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);
        handleMessagePayload(msg);
      } catch (_) {}
    };
    window.addEventListener("message", handleWebMessage);
    return () => window.removeEventListener("message", handleWebMessage);
  }, []);

  const handleDownload = () => {
    setIsDownloading(true);
    const msg = JSON.stringify({ type: "DOWNLOAD_MINDMAP" });
    if (Platform.OS === "web") {
      iframeRef.current?.contentWindow?.postMessage(msg, "*");
    } else {
      webViewRef.current?.injectJavaScript("if (typeof triggerDownload === 'function') { triggerDownload(); } true;");
    }
  };

  const selectedNode = MINDMAP_DATA[selectedNodeId] || MINDMAP_DATA["node-root"];

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <script>
        ${HTML_TO_IMAGE_SOURCE}
      </script>
      <style>
        :root {
          --bg: ${isDark ? "#1a1514" : "#F8FAFC"};
          --card-bg: ${isDark ? "#221a19" : "#FFFFFF"};
          --border: ${isDark ? "#3D2B28" : "#E5E7EB"};
          --text: ${isDark ? "#FFF7F3" : "#111827"};
          --text-sec: ${isDark ? "#D7C6C0" : "#6B7280"};
          --accent: #E86A50;
          --accent-glow: rgba(232, 106, 80, 0.45);
        }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          padding: 0;
          width: 100vw;
          height: 100vh;
          background-color: var(--bg);
          font-family: -apple-system, sans-serif;
          overflow: hidden;
          user-select: none;
          -webkit-user-select: none;
        }
        #viewport {
          width: 100%;
          height: 100%;
          position: relative;
          cursor: grab;
        }
        #viewport:active {
          cursor: grabbing;
        }
        #canvas {
          position: absolute;
          width: 1450px;
          height: 800px;
          transform-origin: 0 0;
          transition: transform 0.1s ease-out;
        }
        svg {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: 1;
        }
        .node {
          position: absolute;
          background-color: var(--card-bg);
          border: 1.5px solid var(--border);
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
          padding: 8px 12px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s, box-shadow 0.2s, opacity 0.2s ease-out;
          z-index: 2;
          cursor: pointer;
        }
        .node.root {
          border: 2px solid var(--accent);
          border-radius: 16px;
        }
        .node.root .title {
          font-weight: 800;
          font-size: 15px;
          color: var(--accent);
        }
        .node .title {
          font-weight: 700;
          font-size: 12px;
          color: var(--text);
        }
        .node .subtitle {
          font-size: 9px;
          color: var(--text-sec);
          margin-top: 2px;
        }
        .node.selected {
          border: 2.5px solid var(--accent);
          box-shadow: 0 0 18px var(--accent-glow);
          transform: scale(1.08);
          z-index: 10;
        }
        path.connector {
          fill: none;
          stroke: var(--border);
          stroke-width: 2.5px;
          stroke-dasharray: 1000;
          stroke-dashoffset: 0;
          transition: stroke 0.2s, stroke-width 0.2s, filter 0.2s, opacity 0.2s;
        }
        path.connector.active {
          stroke: var(--accent);
          stroke-width: 4px;
          filter: drop-shadow(0 0 4px var(--accent-glow));
        }
        .node.collapsed-child {
          opacity: 0;
          pointer-events: none;
          transform: scale(0.5);
        }
        .toggle-btn {
          position: absolute;
          right: -10px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          border-radius: 10px;
          background-color: var(--accent);
          color: white;
          border: none;
          font-size: 14px;
          line-height: 18px;
          text-align: center;
          cursor: pointer;
          z-index: 12;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
      </style>
    </head>
    <body>
      <div id="viewport">
        <div id="canvas">
          <svg id="svg-canvas"></svg>

          <!-- ROOT -->
          <div class="node root selected" id="node-root" style="left: 600px; top: 350px; width: 220px; height: 75px;">
            <div class="title">Chemical Reactions</div>
            <div class="subtitle">& Equations (Root)</div>
          </div>

          <!-- LEFT BRANCHES -->
          <div class="node" id="node-reactions" style="left: 310px; top: 120px; width: 170px; height: 55px;">
            <div class="title">Chemical Reactions</div>
            <div class="subtitle">Basic Concept Map</div>
          </div>

          <div class="node" id="node-equations" style="left: 310px; top: 220px; width: 170px; height: 55px;">
            <div class="title">Chemical Equations</div>
            <div class="subtitle">Symbols & Representation</div>
          </div>

          <div class="node" id="node-balancing" style="left: 310px; top: 320px; width: 170px; height: 55px;">
            <div class="title">Balancing Equations</div>
            <div class="subtitle">Hit & Trial Method</div>
          </div>

          <div class="node" id="node-applications" style="left: 310px; top: 430px; width: 170px; height: 55px;">
            <div class="title">Applications</div>
            <div class="subtitle">Industrial Use Cases</div>
          </div>

          <div class="node" id="node-oxidation" style="left: 310px; top: 540px; width: 170px; height: 55px;">
            <div class="title">Oxidation</div>
            <div class="subtitle">Electron/Oxygen Transfer</div>
          </div>

          <div class="node" id="node-reduction" style="left: 310px; top: 640px; width: 170px; height: 55px;">
            <div class="title">Reduction</div>
            <div class="subtitle">Oxygen Loss / Electron Gain</div>
          </div>

          <!-- RIGHT BRANCHES -->
          <div class="node" id="node-types" style="left: 920px; top: 220px; width: 190px; height: 60px;">
            <div class="title">Types of Reactions</div>
            <div class="subtitle">Combination, Decomposition...</div>
            <button class="toggle-btn" id="toggle-types">−</button>
          </div>

          <div class="node" id="node-corrosion" style="left: 920px; top: 420px; width: 170px; height: 55px;">
            <div class="title">Corrosion</div>
            <div class="subtitle">Degradation of Metals</div>
          </div>

          <div class="node" id="node-rancidity" style="left: 920px; top: 550px; width: 170px; height: 55px;">
            <div class="title">Rancidity</div>
            <div class="subtitle">Oxidation of Fats & Oils</div>
          </div>

          <!-- SUB-BRANCHES of Types (Positioned right) -->
          <div class="node type-child" id="node-combination" style="left: 1220px; top: 100px; width: 180px; height: 55px;">
            <div class="title">Combination Reaction</div>
            <div class="subtitle">A + B ──> AB (Exothermic)</div>
          </div>

          <div class="node type-child" id="node-decomposition" style="left: 1220px; top: 180px; width: 180px; height: 55px;">
            <div class="title">Decomposition</div>
            <div class="subtitle">AB ──> A + B (Endothermic)</div>
          </div>

          <div class="node type-child" id="node-displacement" style="left: 1220px; top: 260px; width: 180px; height: 55px;">
            <div class="title">Displacement</div>
            <div class="subtitle">Metal Reactivity Series</div>
          </div>

          <div class="node type-child" id="node-double" style="left: 1220px; top: 340px; width: 180px; height: 55px;">
            <div class="title">Double Displacement</div>
            <div class="subtitle">Precipitation Formation</div>
          </div>

        </div>
      </div>

      <script>
        function setTheme(theme, isDark) {
          const root = document.documentElement;
          if (isDark) {
            root.style.setProperty('--bg', '#1a1514');
            root.style.setProperty('--card-bg', '#221a19');
            root.style.setProperty('--border', '#3D2B28');
            root.style.setProperty('--text', '#FFF7F3');
            root.style.setProperty('--text-sec', '#D7C6C0');
          } else {
            root.style.setProperty('--bg', '#F8FAFC');
            root.style.setProperty('--card-bg', '#FFFFFF');
            root.style.setProperty('--border', '#E5E7EB');
            root.style.setProperty('--text', '#111827');
            root.style.setProperty('--text-sec', '#6B7280');
          }
        }

        const rootNode = document.getElementById('node-root');
        const svg = document.getElementById('svg-canvas');

        // Connectors structure mapping
        const connections = [
          { from: 'node-root', to: 'node-reactions' },
          { from: 'node-root', to: 'node-equations' },
          { from: 'node-root', to: 'node-balancing' },
          { from: 'node-root', to: 'node-applications' },
          { from: 'node-root', to: 'node-oxidation' },
          { from: 'node-root', to: 'node-reduction' },
          
          { from: 'node-root', to: 'node-types' },
          { from: 'node-root', to: 'node-corrosion' },
          { from: 'node-root', to: 'node-rancidity' },

          { from: 'node-types', to: 'node-combination', isSub: true },
          { from: 'node-types', to: 'node-decomposition', isSub: true },
          { from: 'node-types', to: 'node-displacement', isSub: true },
          { from: 'node-types', to: 'node-double', isSub: true }
        ];

        let typesCollapsed = false;

        function drawConnectors() {
          svg.innerHTML = '';
          connections.forEach(conn => {
            const fromEl = document.getElementById(conn.from);
            const toEl = document.getElementById(conn.to);
            if (!fromEl || !toEl) return;

            // Skip drawing if child is collapsed
            if (conn.isSub && typesCollapsed) return;

            const fx = fromEl.offsetLeft + fromEl.offsetWidth / 2;
            const fy = fromEl.offsetTop + fromEl.offsetHeight / 2;
            const tx = toEl.offsetLeft + toEl.offsetWidth / 2;
            const ty = toEl.offsetTop + toEl.offsetHeight / 2;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            
            // Curved cubic bezier line
            const d = \`M \${fx} \${fy} C \${fx + (tx - fx)/2} \${fy}, \${tx - (tx - fx)/2} \${ty}, \${tx} \${ty}\`;
            
            path.setAttribute('d', d);
            path.setAttribute('class', 'connector');
            path.id = 'conn-' + conn.to;
            
            // Highlight connector path if selected
            if (selectedId === conn.to) {
              path.classList.add('active');
            }

            svg.appendChild(path);
          });
        }

        let selectedId = 'node-root';
        function selectNode(id) {
          selectedId = id;
          document.querySelectorAll('.node').forEach(n => n.classList.remove('selected'));
          document.querySelectorAll('path.connector').forEach(c => c.classList.remove('active'));

          const node = document.getElementById(id);
          if (node) {
            node.classList.add('selected');
            const conn = document.getElementById('conn-' + id);
            if (conn) conn.classList.add('active');

            postToParent({
              type: 'NODE_SELECTED',
              nodeId: id
            });
          }
          drawConnectors();
        }

        // Expand/Collapse right branches of Types of Reactions
        const toggleBtn = document.getElementById('toggle-types');
        toggleBtn.addEventListener('click', (e) => {
          typesCollapsed = !typesCollapsed;
          toggleBtn.innerText = typesCollapsed ? '+' : '−';
          
          document.querySelectorAll('.type-child').forEach(child => {
            if (typesCollapsed) {
              child.classList.add('collapsed-child');
            } else {
              child.classList.remove('collapsed-child');
            }
          });

          // Reset selection if selecting a collapsed subnode
          if (typesCollapsed && ['node-combination', 'node-decomposition', 'node-displacement', 'node-double'].includes(selectedId)) {
            selectNode('node-types');
          }

          drawConnectors();
          e.stopPropagation();
        });

        document.querySelectorAll('.node').forEach(node => {
          node.addEventListener('click', (e) => {
            selectNode(node.id);
            e.stopPropagation();
          });
        });

        // Touch Pan & Zoom Engine with Inertia and Double-Tap
        const viewport = document.getElementById('viewport');
        const canvas = document.getElementById('canvas');
        let scale = 0.45;
        let panX = 140;
        let panY = 50;
        let isDragging = false;
        let startX = 0, startY = 0;
        let lastTap = 0;

        // Inertia params
        let velX = 0;
        let velY = 0;
        let lastX = 0;
        let lastY = 0;
        let animFrameId = null;

        // Pinch params
        let initialDistance = 0;
        let initialScale = 0.45;

        function postToParent(data) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify(data));
          } else if (window.parent && window.parent !== window) {
            window.parent.postMessage(JSON.stringify(data), "*");
          }
        }

        function updateTransform() {
          canvas.style.transform = \`translate(\${panX}px, \${panY}px) scale(\${scale})\`;
          postToParent({
            type: 'TRANSFORM_UPDATE',
            scale: scale,
            panX: panX,
            panY: panY
          });
        }

        function runInertia() {
          if (isDragging) return;
          panX += velX;
          panY += velY;
          velX *= 0.92; // Friction factor
          velY *= 0.92;

          updateTransform();

          if (Math.abs(velX) > 0.1 || Math.abs(velY) > 0.1) {
            animFrameId = requestAnimationFrame(runInertia);
          }
        }

        // Center node
        function centerNode(id) {
          const el = document.getElementById(id);
          if (!el) return;
          const vWidth = viewport.clientWidth;
          const vHeight = viewport.clientHeight;

          const nodeCenterX = el.offsetLeft + el.offsetWidth / 2;
          const nodeCenterY = el.offsetTop + el.offsetHeight / 2;

          panX = vWidth / 2 - nodeCenterX * scale;
          panY = vHeight / 2 - nodeCenterY * scale;
          updateTransform();
        }

        // Zoom inputs
        window.zoomIn = function() {
          const oldScale = scale;
          scale = Math.min(scale + 0.1, 1.8);
          const centerX = viewport.clientWidth / 2;
          const centerY = viewport.clientHeight / 2;
          panX = centerX - (centerX - panX) * (scale / oldScale);
          panY = centerY - (centerY - panY) * (scale / oldScale);
          updateTransform();
        };

        window.zoomOut = function() {
          const oldScale = scale;
          scale = Math.max(scale - 0.1, 0.25);
          const centerX = viewport.clientWidth / 2;
          const centerY = viewport.clientHeight / 2;
          panX = centerX - (centerX - panX) * (scale / oldScale);
          panY = centerY - (centerY - panY) * (scale / oldScale);
          updateTransform();
        };

        window.resetView = function() {
          scale = 0.45;
          panX = 140;
          panY = 50;
          updateTransform();
          selectNode('node-root');
        };

        window.fitView = function() {
          const vWidth = viewport.clientWidth;
          const vHeight = viewport.clientHeight;
          scale = Math.min(vWidth / 1450, vHeight / 800) * 0.95;
          scale = Math.max(Math.min(scale, 1.8), 0.25);
          panX = (vWidth - 1450 * scale) / 2;
          panY = (vHeight - 800 * scale) / 2;
          updateTransform();
        };

        // Wheel zoom (desktop)
        window.addEventListener('wheel', (e) => {
          e.preventDefault();
          const zoomFactor = 1.08;
          const oldScale = scale;
          if (e.deltaY < 0) {
            scale = Math.min(scale * zoomFactor, 1.8);
          } else {
            scale = Math.max(scale / zoomFactor, 0.25);
          }
          const rect = viewport.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          panX = mouseX - (mouseX - panX) * (scale / oldScale);
          panY = mouseY - (mouseY - panY) * (scale / oldScale);
          updateTransform();
        }, { passive: false });

        // Bind Drag Gestures
        viewport.addEventListener('mousedown', (e) => {
          if (e.target.closest('.node')) return;
          isDragging = true;
          startX = e.clientX - panX;
          startY = e.clientY - panY;
          lastX = e.clientX;
          lastY = e.clientY;
          velX = 0;
          velY = 0;
          cancelAnimationFrame(animFrameId);
        });

        window.addEventListener('mousemove', (e) => {
          if (!isDragging) return;
          panX = e.clientX - startX;
          panY = e.clientY - startY;
          velX = e.clientX - lastX;
          velY = e.clientY - lastY;
          lastX = e.clientX;
          lastY = e.clientY;
          updateTransform();
        });

        window.addEventListener('mouseup', () => {
          if (isDragging) {
            isDragging = false;
            runInertia();
          }
        });

        // Touch gestures
        viewport.addEventListener('touchstart', (e) => {
          const now = Date.now();
          const targetNode = e.target.closest('.node');
          if (targetNode) {
            if (now - lastTap < 300) {
              centerNode(targetNode.id);
            }
            lastTap = now;
            return;
          }

          if (e.touches.length === 1) {
            isDragging = true;
            startX = e.touches[0].clientX - panX;
            startY = e.touches[0].clientY - panY;
            lastX = e.touches[0].clientX;
            lastY = e.touches[0].clientY;
            velX = 0;
            velY = 0;
            cancelAnimationFrame(animFrameId);
          } else if (e.touches.length === 2) {
            isDragging = false;
            initialDistance = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
            );
            initialScale = scale;
          }
        });

        viewport.addEventListener('touchmove', (e) => {
          if (e.touches.length === 1 && isDragging) {
            panX = e.touches[0].clientX - startX;
            panY = e.touches[0].clientY - startY;
            velX = e.touches[0].clientX - lastX;
            velY = e.touches[0].clientY - lastY;
            lastX = e.touches[0].clientX;
            lastY = e.touches[0].clientY;
            updateTransform();
          } else if (e.touches.length === 2) {
            e.preventDefault();
            const dist = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
            );
            if (initialDistance > 0) {
              const oldScale = scale;
              const factor = dist / initialDistance;
              scale = Math.max(Math.min(initialScale * factor, 1.8), 0.25);
              
              // Center the zoom on midpoint of fingers
              const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
              const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
              panX = midX - (midX - panX) * (scale / oldScale);
              panY = midY - (midY - panY) * (scale / oldScale);
              
              updateTransform();
            }
          }
        }, { passive: false });

        viewport.addEventListener('touchend', () => {
          if (isDragging) {
            isDragging = false;
            runInertia();
          }
        });

        window.initializeState = function(initScale, initPanX, initPanY, initNodeId) {
          scale = initScale;
          panX = initPanX;
          panY = initPanY;
          updateTransform();
          if (initNodeId) {
            selectedId = initNodeId;
            document.querySelectorAll('.node').forEach(n => n.classList.remove('selected'));
            document.querySelectorAll('path.connector').forEach(c => c.classList.remove('active'));
            const node = document.getElementById(initNodeId);
            if (node) {
              node.classList.add('selected');
              const conn = document.getElementById('conn-' + initNodeId);
              if (conn) conn.classList.add('active');
            }
            drawConnectors();
          }
        };

        window.addEventListener('message', (event) => {
          let data;
          try {
            data = JSON.parse(event.data);
          } catch(e) {
            return;
          }
          if (data && data.type === 'DOWNLOAD_MINDMAP') {
            triggerDownload();
          }
        });

        window.triggerDownload = function() {
          if (typeof htmlToImage === 'undefined') {
            postToParent({ type: 'MINDMAP_DOWNLOAD_ERROR', error: 'html-to-image library is not loaded yet.' });
            return;
          }

          const canvasEl = document.getElementById('canvas');
          const bgColor = getComputedStyle(document.body).backgroundColor || '#F8FAFC';

          const originalTransform = canvasEl.style.transform;
          const originalTransition = canvasEl.style.transition;
          
          canvasEl.style.transition = 'none';
          canvasEl.style.transform = 'translate(0, 0) scale(1)';

          setTimeout(() => {
            htmlToImage.toPng(canvasEl, {
              width: 1450,
              height: 800,
              backgroundColor: bgColor,
              skipFonts: true,
              style: {
                transform: 'translate(0, 0) scale(1)',
                transition: 'none'
              }
            })
            .then(function (dataUrl) {
              canvasEl.style.transform = originalTransform;
              canvasEl.style.transition = originalTransition;

              postToParent({
                type: 'MINDMAP_DOWNLOAD_SUCCESS',
                base64: dataUrl
              });
            })
            .catch(function (error) {
              canvasEl.style.transform = originalTransform;
              canvasEl.style.transition = originalTransition;

              postToParent({
                type: 'MINDMAP_DOWNLOAD_ERROR',
                error: error.toString()
              });
            });
          }, 100);
        };

        drawConnectors();
        setTimeout(() => {
          if (scale === 0.45 && panX === 140 && panY === 50) {
            fitView();
          }
        }, 150);
      </script>
    </body>
    </html>
  `;

  const renderCanvas = () => (
    <View style={[styles.canvasContainer, { transform: [{ rotate: `${rotation}deg` }] }]}>
      {Platform.OS === "web" ? (
        <iframe
          ref={iframeRef}
          srcDoc={htmlContent}
          style={{ width: "100%", height: "100%", border: "none" }}
          title="Concept Mind Map"
        />
      ) : (
        <WebView
          allowFileAccess
          allowUniversalAccessFromFileURLs
          onMessage={handleMessage}
          originWhitelist={["*"]}
          ref={webViewRef}
          source={{ html: htmlContent }}
          style={styles.webView}
          onLoadEnd={handleLoadEnd}
        />
      )}
    </View>
  );

  const renderDetail = () => (
    <View style={styles.detailContainer}>
      <View style={styles.detailHeader}>
        <View style={styles.nodeTitleRow}>
          <AppIcon color={colors.primary.main} name="git-network-outline" size={18} />
          <Text style={styles.detailTitle}>{selectedNode.title}</Text>
        </View>
      </View>

      <Text style={styles.detailDescription}>{selectedNode.explanation}</Text>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeading}>KEY KNOWLEDGE POINTS</Text>
      </View>
      <View style={styles.bulletsList}>
        {selectedNode.keyPoints.map((point, idx) => (
          <View key={idx} style={styles.bulletRow}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>{point}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeading}>EXAMPLES</Text>
      </View>
      <Text style={styles.examplesText}>{selectedNode.examples}</Text>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeading}>RELATED CONCEPTS</Text>
      </View>
      <View style={styles.relatedRow}>
        {selectedNode.relatedConcepts.map((concept, idx) => (
          <Badge key={idx} label={concept} variant="secondary" />
        ))}
      </View>
    </View>
  );

  return (
    <Card style={styles.outerCard} padding={0}>
      {/* Shared ViewerToolbar */}
      <ViewerToolbar
        isFullscreen={false}
        isDownloading={isDownloading}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onRotate={handleRotate}
        onToggleFullscreen={() => setIsFullscreen(true)}
        onDownload={handleDownload}
      />

      {/* SVG Canvas View - Render only if NOT in fullscreen */}
      {!isFullscreen ? renderCanvas() : <View style={styles.canvasContainer} />}

      {/* Selection detail card at the bottom */}
      {renderDetail()}

      {/* Fullscreen Modal */}
      <Modal
        animationType="fade"
        onRequestClose={() => setIsFullscreen(false)}
        visible={isFullscreen}
      >
        <SafeAreaView edges={["top", "bottom"]} style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setIsFullscreen(false)}
              style={styles.modalCloseBtn}
            >
              <AppIcon color="#FFFFFF" name="close-outline" size={22} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{title || "Concept Mind Map"}</Text>
          </View>

          <ViewerToolbar
            isFullscreen={true}
            isDownloading={isDownloading}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onRotate={handleRotate}
            onToggleFullscreen={() => setIsFullscreen(false)}
            onDownload={handleDownload}
          />

          <View style={styles.modalBody}>
            {/* SVG Canvas View - Render only in fullscreen */}
            {isFullscreen ? renderCanvas() : null}
          </View>
        </SafeAreaView>
      </Modal>
    </Card>
  );
}

const getStyles = (themeColors: any) =>
  StyleSheet.create({
    outerCard: {
      marginHorizontal: spacing.md,
      marginTop: spacing.md,
      overflow: "hidden",
    },
    canvasContainer: {
      height: 320,
      backgroundColor: themeColors.surfaceSecondary,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
      overflow: "hidden",
    },
    webView: {
      flex: 1,
      backgroundColor: "transparent",
    },
    detailContainer: {
      padding: spacing.md,
      backgroundColor: themeColors.surface,
    },
    detailHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.xs,
    },
    nodeTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    detailTitle: {
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.heavy,
      color: themeColors.textPrimary,
    },
    detailDescription: {
      fontSize: typography.fontSize.xs + 1,
      color: themeColors.textSecondary,
      lineHeight: typography.lineHeight.sm + 2,
      marginBottom: spacing.sm,
    },
    sectionHeaderRow: {
      borderBottomWidth: 1,
      borderBottomColor: themeColors.borderSubtle,
      paddingBottom: 4,
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
    },
    sectionHeading: {
      fontSize: typography.fontSize.xs - 1,
      fontWeight: typography.fontWeight.heavy,
      color: colors.primary.main,
      letterSpacing: 0.5,
    },
    bulletsList: {
      gap: 4,
    },
    bulletRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.xs,
    },
    bulletDot: {
      fontSize: typography.fontSize.sm,
      color: colors.primary.main,
      lineHeight: 18,
    },
    bulletText: {
      fontSize: typography.fontSize.xs + 1,
      color: themeColors.textSecondary,
      lineHeight: 18,
      flex: 1,
    },
    examplesText: {
      fontSize: typography.fontSize.xs + 1,
      fontWeight: typography.fontWeight.bold,
      color: themeColors.textPrimary,
      fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
      backgroundColor: themeColors.surfaceSecondary,
      padding: 8,
      borderRadius: radius.sm,
      marginTop: 4,
    },
    relatedRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xs,
      marginTop: 4,
    },
    // Modal styles
    modalSafeArea: {
      flex: 1,
      backgroundColor: "#0A0A0A",
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      gap: spacing.xs,
    },
    modalCloseBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(255,255,255,0.1)",
      alignItems: "center",
      justifyContent: "center",
    },
    modalTitle: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.heavy,
      color: "#FFFFFF",
      flex: 1,
    },
    modalBody: {
      flex: 1,
      backgroundColor: "#0A0A0A",
    },
  });