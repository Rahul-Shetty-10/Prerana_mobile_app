import { Ionicons } from "@expo/vector-icons";
import {
  ClerkProvider,
  isClerkAPIResponseError,
  useAuth,
  useClerk,
  useSignIn,
} from "@clerk/clerk-expo";
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
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { appConfig } from "./src/config";
import { DashboardScreen } from "./src/features/dashboard";
import { tokenCache } from "./src/lib/tokenCache";
import { RootNavigator } from "./src/navigation";
import { ThemeProvider } from "./src/shared/theme/ThemeContext";

export default function App() {
  useEffect(() => {
    console.log("[SUBJECTS][APP] App launched");
    console.log("[SUBJECTS][APP] Environment config:", {
      apiBaseUrl: appConfig.apiBaseUrl,
      clerkPublishableKey: appConfig.clerkPublishableKey ? `PRESENT (${appConfig.clerkPublishableKey.substring(0, 15)}...)` : "MISSING",
      tenantSlug: appConfig.tenantSlug
    });
  }, []);

  if (!appConfig.clerkPublishableKey) {
    return (
      <SafeAreaProvider>
        <ScreenShell centered>
          <Text style={styles.title}>Missing Clerk config</Text>
          <Text style={styles.muted}>
            Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env file before starting Expo.
          </Text>
        </ScreenShell>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ClerkProvider publishableKey={appConfig.clerkPublishableKey} tokenCache={tokenCache}>
        <ThemeProvider>
          <StatusBar style="light" />
          <Root />
        </ThemeProvider>
      </ClerkProvider>
    </SafeAreaProvider>
  );
}

function Root() {
  const bypassClerk = false;
  
  let isLoaded = false;
  let isSignedIn = false;
  let getToken: any = null;

  try {
    const auth = useAuth();
    isLoaded = auth.isLoaded;
    isSignedIn = auth.isSignedIn ?? false;
    getToken = auth.getToken;
  } catch (e) {
    console.error("[SUBJECTS][APP] useAuth error caught:", e);
  }

  if (bypassClerk) {
    isLoaded = true;
    isSignedIn = true;
    getToken = async () => "mock-clerk-token";
  }

  const loggedClerkReady = useRef(false);
  const loggedAuth = useRef(false);
  const loggedGetToken = useRef(false);

  useEffect(() => {
    if (isLoaded && !loggedClerkReady.current) {
      console.log("[SUBJECTS][APP] Clerk ready, isLoaded = true");
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

  if (!isLoaded) {
    return (
      <ScreenShell centered>
        <ActivityIndicator color="#f5a08d" />
        <Text style={styles.muted}>Loading session...</Text>
      </ScreenShell>
    );
  }

  return isSignedIn ? <SignedInHome mockGetToken={getToken} /> : <SignInScreen />;
}

function SignInScreen() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignIn() {
    if (!isLoaded || isSubmitting) {
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

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
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
        <Text style={styles.subtitle}>Sign in with a student test account to open the learning workspace.</Text>
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
    try {
      const auth = useAuth();
      getToken = auth.getToken;
    } catch (e) {
      getToken = async () => "mock-clerk-token";
    }
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
