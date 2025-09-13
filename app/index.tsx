import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { ScanLine, LogIn, LogOut, Menu, Wifi, WifiOff, Clock } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import { getStatistics } from "../utils/storage";
import { getLogEntries } from "../utils/dataManager";

export default function HomeScreen() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalEntries: 0,
    todayEntries: 0,
    todayExits: 0,
    currentlyInside: 0,
    lastActivity: null,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const loadStatistics = async () => {
    try {
      const entries = await getLogEntries();
      const today = new Date().toDateString();
      
      const todayEntries = entries.filter(entry => 
        new Date(entry.timestamp).toDateString() === today && entry.action === 'entry'
      ).length;
      
      const todayExits = entries.filter(entry => 
        new Date(entry.timestamp).toDateString() === today && entry.action === 'exit'
      ).length;
      
      const currentlyInside = todayEntries - todayExits;
      const lastActivity = entries.length > 0 ? entries[0].timestamp : null;
      
      setStats({
        totalEntries: entries.length,
        todayEntries,
        todayExits,
        currentlyInside: Math.max(0, currentlyInside),
        lastActivity,
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStatistics();
    setRefreshing(false);
  };

  const navigateToScanner = (mode: "enter" | "leave") => {
    router.push({
      pathname: "/scanner",
      params: { mode },
    });
  };

  const openMenu = () => {
    router.push("/menu");
  };

  const formatLastActivity = (timestamp: string | null) => {
    if (!timestamp) return "No activity";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Municipal Building</Text>
            <Text style={styles.subtitle}>Laptop Tracking System</Text>
          </View>
          <TouchableOpacity style={styles.menuButton} onPress={openMenu}>
            <Menu size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Today's Overview</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.entryCard]}>
              <LogIn size={24} color="#22c55e" />
              <Text style={styles.statNumber}>{stats.todayEntries}</Text>
              <Text style={styles.statLabel}>Entries</Text>
            </View>
            <View style={[styles.statCard, styles.exitCard]}>
              <LogOut size={24} color="#ef4444" />
              <Text style={styles.statNumber}>{stats.todayExits}</Text>
              <Text style={styles.statLabel}>Exits</Text>
            </View>
            <View style={[styles.statCard, styles.insideCard]}>
              <ScanLine size={24} color="#3b82f6" />
              <Text style={styles.statNumber}>{stats.currentlyInside}</Text>
              <Text style={styles.statLabel}>Inside</Text>
            </View>
            <View style={[styles.statCard, styles.totalCard]}>
              <Clock size={24} color="#8b5cf6" />
              <Text style={styles.statNumber}>{stats.totalEntries}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
          <View style={styles.lastActivityContainer}>
            <Clock size={16} color="#666" />
            <Text style={styles.lastActivityText}>
              Last activity: {formatLastActivity(stats.lastActivity)}
            </Text>
          </View>
        </View>

        {/* Main Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.enterButton]}
            onPress={() => navigateToScanner("enter")}
          >
            <LogIn size={32} color="white" />
            <Text style={styles.buttonText}>Scan Entry</Text>
            <Text style={styles.buttonSubtext}>Record laptop entry</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.leaveButton]}
            onPress={() => navigateToScanner("leave")}
          >
            <LogOut size={32} color="white" />
            <Text style={styles.buttonText}>Scan Exit</Text>
            <Text style={styles.buttonSubtext}>Record laptop exit</Text>
          </TouchableOpacity>
        </View>

        {/* Status Bar */}
        <View style={styles.statusBar}>
          <View style={styles.statusItem}>
            {isOnline ? (
              <Wifi size={16} color="#10b981" />
            ) : (
              <WifiOff size={16} color="#ef4444" />
            )}
            <Text style={[styles.statusText, { color: isOnline ? "#10b981" : "#ef4444" }]}>
              {isOnline ? "Online" : "Offline"}
            </Text>
          </View>
          <Text style={styles.statusText}>
            Data stored locally
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Security Desk • Pull to refresh • Tap menu for more options</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  menuButton: {
    padding: 8,
  },
  statsContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
  },
  entryCard: {
    borderColor: "#22c55e20",
    backgroundColor: "#22c55e08",
  },
  exitCard: {
    borderColor: "#ef444420",
    backgroundColor: "#ef444408",
  },
  insideCard: {
    borderColor: "#3b82f620",
    backgroundColor: "#3b82f608",
  },
  totalCard: {
    borderColor: "#8b5cf620",
    backgroundColor: "#8b5cf608",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  lastActivityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  lastActivityText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
  },
  buttonContainer: {
    gap: 20,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  enterButton: {
    backgroundColor: "#4CAF50",
  },
  leaveButton: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
    marginTop: 8,
  },
  buttonSubtext: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginTop: 4,
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    marginTop: 30,
    padding: 12,
    borderRadius: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  footer: {
    marginTop: 20,
    alignItems: "center",
  },
  footerText: {
    color: "#666",
    fontSize: 12,
    textAlign: "center",
  },
});