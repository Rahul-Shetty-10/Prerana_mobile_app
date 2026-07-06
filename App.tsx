import { Ionicons } from "@expo/vector-icons";
import {
  ClerkProvider,
  isClerkAPIResponseError,
  useAuth,
  useClerk,
  useSignIn,
} from "@clerk/clerk-expo";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { appConfig } from "./src/config";
import { mobileApi } from "./src/api/mobileApi";
import { tokenCache } from "./src/lib/tokenCache";

export default function App() {
  if (isLiveClerkKeyBlockedOnLocalhost()) {
    return (
      <ScreenShell centered>
        <Text style={styles.title}>Production Clerk cannot run on localhost web</Text>
        <Text style={styles.muted}>
          Use the development Clerk key for Expo web, or test the live key from smartguru.in/native mobile.
        </Text>
      </ScreenShell>
    );
  }

  return (
    <ClerkProvider publishableKey={appConfig.clerkPublishableKey} tokenCache={tokenCache}>
      <StatusBar style="light" />
      <Root />
    </ClerkProvider>
  );
}

function Root() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!appConfig.clerkPublishableKey) {
    return (
      <ScreenShell>
        <Text style={styles.title}>Missing Clerk config</Text>
        <Text style={styles.muted}>Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY before starting Expo.</Text>
      </ScreenShell>
    );
  }

  if (!isLoaded) {
    return (
      <ScreenShell centered>
        <ActivityIndicator color="#f5a08d" />
        <Text style={styles.muted}>Loading session...</Text>
      </ScreenShell>
    );
  }

  return isSignedIn ? <SignedInHome /> : <SignInScreen />;
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

function SignedInHome() {
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const [error, setError] = useState("");
  const [sessionJson, setSessionJson] = useState("");
  const [dashboardJson, setDashboardJson] = useState("");
  const [isFetchingSession, setIsFetchingSession] = useState(false);
  const [isFetchingDashboard, setIsFetchingDashboard] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    async function verifyTokenTemplate() {
      try {
        await getToken({ template: "convex" });
      } catch (err) {
        setError(getErrorMessage(err));
      }
    }

    void verifyTokenTemplate();
  }, [getToken]);

  async function handleSignOut() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    setError("");
    try {
      await signOut();
    } catch (err) {
      setError(getErrorMessage(err));
      setIsSigningOut(false);
    }
  }

  async function handleFetchSession() {
    if (isFetchingSession) {
      return;
    }

    setIsFetchingSession(true);
    setError("");
    setSessionJson("");
    try {
      const data = await mobileApi<unknown>("/session", {
        getToken,
        tenantSlug: appConfig.tenantSlug,
      });
      setSessionJson(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsFetchingSession(false);
    }
  }

  async function handleFetchDashboard() {
    if (isFetchingDashboard) {
      return;
    }

    setIsFetchingDashboard(true);
    setError("");
    setDashboardJson("");
    try {
      const data = await mobileApi<unknown>("/student/dashboard", {
        getToken,
        tenantSlug: appConfig.tenantSlug,
      });
      setDashboardJson(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsFetchingDashboard(false);
    }
  }

  return (
    <SafeAreaView style={styles.blankSafeArea}>
      <ScrollView contentContainerStyle={styles.signedInContent}>
        <View style={styles.blankHeader}>
          <Pressable disabled={isSigningOut} onPress={handleSignOut} style={styles.signOutButton}>
            {isSigningOut ? (
              <ActivityIndicator color="#fff7f3" />
            ) : (
              <Text style={styles.signOutButtonText}>Sign out</Text>
            )}
          </Pressable>
        </View>

        <EndpointTestCard
          iconName="person-circle-outline"
          isLoading={isFetchingSession}
          onPress={handleFetchSession}
          path="GET /session"
          title="Test session endpoint"
        />

        <Pressable
          disabled={isFetchingDashboard}
          onPress={handleFetchDashboard}
          style={({ pressed }) => [
            styles.testCard,
            pressed && !isFetchingDashboard ? styles.testCardPressed : null,
          ]}
        >
          <View style={styles.testCardHeader}>
            <Ionicons color="#f5a08d" name="speedometer-outline" size={22} />
            <Text style={styles.testCardTitle}>Test dashboard endpoint</Text>
          </View>
          <Text style={styles.testCardSubtitle}>GET /student/dashboard</Text>
          <View style={styles.testCardButton}>
            {isFetchingDashboard ? (
              <ActivityIndicator color="#241817" />
            ) : (
              <Text style={styles.testCardButtonText}>Fetch dashboard data</Text>
            )}
          </View>
        </Pressable>

        {error ? <Text style={styles.blankErrorText}>{error}</Text> : null}

        {sessionJson ? (
          <View style={styles.responsePanel}>
            <Text style={styles.responseTitle}>Session response</Text>
            <Text selectable style={styles.responseJson}>
              {sessionJson}
            </Text>
          </View>
        ) : null}

        {dashboardJson ? (
          <View style={styles.responsePanel}>
            <Text style={styles.responseTitle}>Dashboard response</Text>
            <Text selectable style={styles.responseJson}>
              {dashboardJson}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
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

function getErrorMessage(error: unknown) {
  if (isClerkAPIResponseError(error)) {
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

function isLiveClerkKeyBlockedOnLocalhost() {
  if (
    Platform.OS !== "web" ||
    !appConfig.clerkPublishableKey.startsWith("pk_live_") ||
    typeof window === "undefined" ||
    !window.location
  ) {
    return false;
  }

  return ["localhost", "127.0.0.1"].includes(window.location.hostname);
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
    borderRadius: 8,
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
    borderRadius: 8,
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
    borderRadius: 8,
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
    borderRadius: 8,
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
    borderRadius: 8,
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
    borderRadius: 8,
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
    borderRadius: 8,
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
