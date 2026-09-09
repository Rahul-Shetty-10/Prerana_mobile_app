import { Ionicons } from "@expo/vector-icons";
import {
  ClerkProvider,
  isClerkAPIResponseError,
  useAuth,
  useClerk,
  useSignIn,
} from "@clerk/expo";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  LogBox,
} from "react-native";

LogBox.ignoreLogs([
  "InteractionManager has been deprecated and will be removed in a future release",
]);
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { appConfig } from "./src/config";
import { DashboardScreen } from "./src/features/dashboard";
import { tokenCache } from "./src/lib/tokenCache";
import { RootNavigator } from "./src/navigation";
import { ThemeProvider } from "./src/shared/theme/ThemeContext";
import { mobileApi } from "./src/api/mobileApi";
import { performStudentSignOut } from "./src/features/profile/services/profileService";
import { setActiveUserId } from "./src/shared/services/userStorage";
import {
  MobileSession,
  clearMobileSession,
  loadMobileSession,
  saveMobileSession,
} from "./src/shared/session/sessionStore";
import { SessionProvider } from "./src/shared/session/SessionContext";

export default function App() {
  useEffect(() => {
    console.log("[SUBJECTS][APP] App launched");
    console.log("[SUBJECTS][APP] Environment config:", {
      apiBaseUrl: appConfig.apiBaseUrl,
      clerkPublishableKey: appConfig.clerkPublishableKey ? `PRESENT (${appConfig.clerkPublishableKey.substring(0, 15)}...)` : "MISSING",
    });
  }, []);

  if (!appConfig.clerkPublishableKey || !appConfig.apiBaseUrl) {
    return (
      <SafeAreaProvider>
        <ScreenShell centered>
          <Text style={styles.title}>Missing app configuration</Text>
          <Text style={styles.muted}>
            Set the production API URL and Clerk publishable key in the build environment before starting Expo.
          </Text>
        </ScreenShell>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ClerkProvider publishableKey={appConfig.clerkPublishableKey} tokenCache={tokenCache}>
        <ThemeProvider>
          <SessionProvider>
            <StatusBar style="light" />
            <Root />
          </SessionProvider>
        </ThemeProvider>
      </ClerkProvider>
    </SafeAreaProvider>
  );
}

(globalThis as any).appLaunchTime = Date.now();
console.log("[PERF][BOOT] App launch: 0ms");

function Root() {
  const { isLoaded, isSignedIn, getToken, signOut, userId } = useAuth();
  const [sessionState, setSessionState] = useState<'loading' | 'verifying' | 'verified' | 'failed'>('loading');

  const loggedClerkReady = useRef(false);
  const loggedAuth = useRef(false);
  const loggedGetToken = useRef(false);

  useEffect(() => {
    setActiveUserId(isSignedIn ? userId : null);
  }, [isSignedIn, userId]);

  useEffect(() => {
    if (isLoaded && !loggedClerkReady.current) {
      const elapsed = Date.now() - (globalThis as any).appLaunchTime;
      console.log(`[PERF][AUTH] Clerk loaded: ${elapsed}ms`);
      console.log(`[PERF][AUTH] isSignedIn: ${isSignedIn}`);
      loggedClerkReady.current = true;
    }
    if (isSignedIn && !loggedAuth.current) {
      console.log("[SUBJECTS][APP] User authenticated");
      loggedAuth.current = true;
    }
    if (typeof getToken === "function" && !loggedGetToken.current) {
      console.log("[SUBJECTS][APP] getToken available");
      loggedGetToken.current = true;
    }
  }, [isLoaded, isSignedIn, getToken]);

  useEffect(() => {
    console.log("[SUBJECTS][APP] Root useEffect run. isLoaded:", isLoaded, "isSignedIn:", isSignedIn);
    if (!isLoaded) return;

    if (!isSignedIn) {
      console.log("[SUBJECTS][APP] User is not signed in. Setting sessionState to loading.");
      setSessionState('loading');
      return;
    }

    let cancelled = false;

    const verifyBackendSession = async (isBackground: boolean) => {
      console.log(`[SUBJECTS][APP] verifyBackendSession started. isBackground: ${isBackground}`);
      const sessionStartTime = Date.now();
      console.log("[PERF][SESSION] GET /session started");
      try {
        console.log("[SUBJECTS][APP] Fetching /session from backend...");
        const data = await mobileApi<MobileSession>("/session", {
          getToken,
          tenantSlug: null,
        });
        const elapsed = Date.now() - sessionStartTime;
        console.log(`[PERF][SESSION] GET /session completed: ${elapsed}ms`);
        console.log("[PERF][SESSION] status=200");
        console.log("[SUBJECTS][APP] verifyBackendSession success. Role:", data?.role);
        if (!data || data.role !== "student") {
          throw new Error("User role is not student");
        }
        if (!data.tenantSlug) {
          throw new Error("Tenant slug is missing in session response");
        }
        if (cancelled) return;
        await saveMobileSession({
          role: data.role,
          tenantId: data.tenantId,
          tenantSlug: data.tenantSlug,
          tenantName: data.tenantName,
        });
        if (!cancelled) setSessionState("verified");
      } catch (error: any) {
        console.error("[SUBJECTS][APP] Backend session verification error:", error?.message || error);
        if (!isBackground) {
          await clearMobileSession();
          if (!cancelled) setSessionState("failed");
        } else {
          console.log("[SUBJECTS][APP] Background session verification failed, ignoring to prevent kicking user out.");
        }
      }
    };

    const initializeSession = async () => {
      console.log("[SUBJECTS][APP] initializeSession starting...");
      try {
        const cachedSession = await loadMobileSession();
        if (cachedSession && cachedSession.tenantSlug && cachedSession.role === "student") {
          if (!cancelled) setSessionState("verified");
          void verifyBackendSession(true);
        } else {
          if (!cancelled) setSessionState("verifying");
          await verifyBackendSession(false);
        }
      } catch (e: any) {
        console.error("[SUBJECTS][APP] initializeSession error:", e?.message || e);
        if (!cancelled) setSessionState("verifying");
        await verifyBackendSession(false);
      }
    };

    void initializeSession();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, getToken, userId]);

  const handleSignOut = async () => {
    try {
      await clearMobileSession();
      await performStudentSignOut(signOut, userId);
    } catch (e) {
      await clearMobileSession();
      await signOut();
    }
  };

  if (!isLoaded || (isSignedIn && sessionState === "loading")) {
    return (
      <ScreenShell centered>
        <ActivityIndicator color="#f5a08d" />
        <Text style={styles.muted}>Loading session...</Text>
      </ScreenShell>
    );
  }

  if (isSignedIn && sessionState === "verifying") {
    return (
      <ScreenShell centered>
        <ActivityIndicator color="#f5a08d" />
        <Text style={styles.muted}>Verifying account with backend...</Text>
      </ScreenShell>
    );
  }

  if (isSignedIn && sessionState === "failed") {
    return <SessionErrorScreen onSignOut={handleSignOut} />;
  }

  return isSignedIn && sessionState === "verified" ? (
    <SignedInHome mockGetToken={getToken} />
  ) : (
    <SignInScreen />
  );
}

function SessionErrorScreen({ onSignOut }: { onSignOut: () => Promise<void> }) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handlePress = async () => {
    setIsSigningOut(true);
    try {
      await onSignOut();
    } catch (e) {
      // Ignore
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <ScreenShell centered>
      <View style={styles.brandBlock}>
        <Text style={styles.eyebrow}>Verification Error</Text>
        <Text style={styles.title}>We couldn't verify your account.</Text>
        <Text style={styles.subtitle}>Please sign in again or contact your administrator.</Text>
      </View>

      <View style={[styles.panel, { width: "100%", marginTop: 24 }]}>
        <Pressable disabled={isSigningOut} onPress={handlePress} style={styles.primaryButton}>
          {isSigningOut ? (
            <ActivityIndicator color="#241817" />
          ) : (
            <Text style={styles.primaryButtonText}>✔ Sign Out</Text>
          )}
        </Pressable>
      </View>
    </ScreenShell>
  );
}

function SignInScreen() {
  const { signIn, fetchStatus } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignIn() {
    if (fetchStatus === "fetching" || isSubmitting) {
      return;
    }

    if (!email.trim() || !password) {
      Alert.alert("Missing details", "Enter email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signIn.create({
        identifier: email.trim(),
        password,
      });

      if (result.error) {
        throw result.error;
      }

      if (signIn.status === "complete") {
        const finalized = await signIn.finalize();
        if (finalized.error) {
          throw finalized.error;
        }
        return;
      }

      Alert.alert("More verification needed", "This account requires another sign-in step.");
    } catch (error) {
      Alert.alert("Sign in failed", getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScreenShell>
      <View style={styles.brandBlock}>
        <Text style={styles.eyebrow}>PRERANA 2.0</Text>
        <Text style={styles.title}>Mobile workspace</Text>
        <Text style={styles.subtitle}>Sign in with your student account to open the learning workspace.</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="name@example.com"
          placeholderTextColor="#8b7772"
          style={styles.input}
          value={email}
        />

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordInputShell}>
          <TextInput
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#8b7772"
            secureTextEntry={!isPasswordVisible}
            style={styles.passwordInput}
            value={password}
          />
          <Pressable
            accessibilityLabel={isPasswordVisible ? "Hide password" : "Show password"}
            accessibilityRole="button"
            onPress={() => setIsPasswordVisible((value) => !value)}
            style={styles.passwordIconButton}
          >
            <Ionicons color="#d7c6c0" name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} size={22} />
          </Pressable>
        </View>

        <Pressable disabled={isSubmitting} onPress={handleSignIn} style={styles.primaryButton}>
          {isSubmitting ? <ActivityIndicator color="#241817" /> : <Text style={styles.primaryButtonText}>Sign in</Text>}
        </Pressable>
      </View>
    </ScreenShell>
  );
}

function SignedInHome({ mockGetToken }: { mockGetToken?: any }) {
  let getToken = mockGetToken;
  if (!getToken) {
    const auth = useAuth();
    getToken = auth.getToken;
  }
  return <RootNavigator getToken={getToken} />;
}

function EndpointTestCard({
  iconName,
  isLoading,
  onPress,
  path,
  title,
}: {
  iconName: keyof typeof Ionicons.glyphMap;
  isLoading: boolean;
  onPress: () => void;
  path: string;
  title: string;
}) {
  return (
    <Pressable
      disabled={isLoading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.testCard,
        pressed && !isLoading ? styles.testCardPressed : null,
      ]}
    >
      <View style={styles.testCardHeader}>
        <Ionicons color="#f5a08d" name={iconName} size={22} />
        <Text style={styles.testCardTitle}>{title}</Text>
      </View>
      <Text style={styles.testCardSubtitle}>{path}</Text>
      <View style={styles.testCardButton}>
        {isLoading ? (
          <ActivityIndicator color="#241817" />
        ) : (
          <Text style={styles.testCardButtonText}>Fetch data</Text>
        )}
      </View>
    </Pressable>
  );
}

function ScreenShell({ centered = false, children }: { centered?: boolean; children: React.ReactNode }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.screenContent, centered ? styles.centeredContent : null]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

interface ClerkErrorItem {
  message: string;
  longMessage?: string;
}

interface ClerkAPIResponseErrorObject {
  errors: ClerkErrorItem[];
}

function isClerkResponseError(error: unknown): error is ClerkAPIResponseErrorObject {
  return (
    isClerkAPIResponseError(error) &&
    typeof error === "object" &&
    error !== null &&
    "errors" in error &&
    Array.isArray((error as ClerkAPIResponseErrorObject).errors)
  );
}

function getErrorMessage(error: unknown) {
  if (isClerkResponseError(error)) {
    return error.errors.map((item) => item.longMessage || item.message).join("\n");
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Something went wrong.";
}

function getApiErrorMessage(error: unknown) {
  const message = getErrorMessage(error);
  if (message.includes("Invalid or expired Clerk token")) {
    return [
      message,
      "Check that EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY belongs to the same Clerk project used by the API.",
    ].join("\n");
  }

  return message;
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#241817",
  },
  blankSafeArea: {
    flex: 1,
    backgroundColor: "#241817",
  },
  blankHeader: {
    alignItems: "flex-end",
  },
  signedInContent: {
    gap: 18,
    padding: 20,
    paddingBottom: 40,
  },
  screenContent: {
    gap: 18,
    padding: 20,
    paddingBottom: 40,
  },
  centeredContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  brandBlock: {
    gap: 8,
    paddingTop: 24,
  },
  eyebrow: {
    color: "#f5a08d",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    color: "#fff7f3",
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 0,
  },
  subtitle: {
    color: "#d7c6c0",
    fontSize: 16,
    lineHeight: 23,
  },
  panel: {
    gap: 14,
    borderWidth: 1,
    borderColor: "#4c3934",
    borderRadius: 8,
    backgroundColor: "#2f2220",
    padding: 18,
  },
  sectionTitle: {
    color: "#fff7f3",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0,
  },
  label: {
    color: "#fff7f3",
    fontSize: 14,
    fontWeight: "700",
  },
  muted: {
    color: "#d7c6c0",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: "#5e4742",
    borderRadius: 20,
    color: "#fff7f3",
    paddingHorizontal: 14,
    fontSize: 16,
  },
  passwordInputShell: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#5e4742",
    borderRadius: 20,
  },
  passwordInput: {
    flex: 1,
    color: "#fff7f3",
    fontSize: 16,
    minHeight: 52,
    paddingLeft: 14,
    paddingRight: 8,
  },
  passwordIconButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    width: 52,
  },
  primaryButton: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#f5a08d",
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: "#241817",
    fontSize: 16,
    fontWeight: "800",
  },
  errorText: {
    color: "#ffb3a7",
    fontSize: 14,
    lineHeight: 20,
  },
  blankErrorText: {
    color: "#ffb3a7",
    fontSize: 14,
    lineHeight: 20,
  },
  signOutButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 96,
    borderWidth: 1,
    borderColor: "#7b5b54",
    borderRadius: 20,
    paddingHorizontal: 14,
  },
  signOutButtonText: {
    color: "#fff7f3",
    fontSize: 14,
    fontWeight: "800",
  },
  testCard: {
    gap: 14,
    borderWidth: 1,
    borderColor: "#5e4742",
    borderRadius: 20,
    backgroundColor: "#2f2220",
    padding: 18,
  },
  testCardPressed: {
    opacity: 0.82,
  },
  testCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  testCardTitle: {
    color: "#fff7f3",
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
  },
  testCardSubtitle: {
    color: "#d7c6c0",
    fontSize: 14,
    fontWeight: "700",
  },
  testCardButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#f5a08d",
    paddingHorizontal: 14,
  },
  testCardButtonText: {
    color: "#241817",
    fontSize: 15,
    fontWeight: "800",
  },
  responsePanel: {
    gap: 10,
    borderWidth: 1,
    borderColor: "#4c3934",
    borderRadius: 20,
    backgroundColor: "#1d1413",
    padding: 14,
  },
  responseTitle: {
    color: "#fff7f3",
    fontSize: 16,
    fontWeight: "800",
  },
  responseJson: {
    color: "#d7c6c0",
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 18,
  },
});
