import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  Share,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, Stack } from "expo-router";
import {
  ArrowLeft,
  ArrowUpDown,
  Download,
  Clock,
  User,
  Search,
  X,
} from "lucide-react-native";
import { getLogEntries, exportLogData, LogEntry } from "../utils/dataManager";

export default function LogScreen() {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<LogEntry[]>([]);
  const [sortBy, setSortBy] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [filterAction, setFilterAction] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    loadLogEntries();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [logEntries, sortBy, sortOrder, filterAction, searchQuery]);

  const loadLogEntries = async () => {
    try {
      setLoading(true);
      const entries = await getLogEntries();
      setLogEntries(entries);
    } catch (error) {
      console.error('Error loading log entries:', error);
      Alert.alert('Error', 'Failed to load log entries');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...logEntries];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.employeeName.toLowerCase().includes(query) ||
        entry.deviceId.toLowerCase().includes(query)
      );
    }

    // Apply action filter
    if (filterAction !== "all") {
      filtered = filtered.filter((entry) => entry.action === filterAction);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "timestamp") {
        return sortOrder === "asc"
          ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else {
        return sortOrder === "asc"
          ? a.employeeName.localeCompare(b.employeeName)
          : b.employeeName.localeCompare(a.employeeName);
      }
    });

    setFilteredEntries(filtered);
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const exportLog = async () => {
    try {
      setExporting(true);
      const csvData = await exportLogData();
      
      // Create a blob and share directly (modern approach without file system)
      if (Platform.OS === 'web') {
        // Web approach: create a download link
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `laptop_log_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // Mobile approach: use React Native's Share API with text content
        await Share.share({
          message: csvData,
          title: 'Laptop Log Export',
        });
      }
    } catch (error) {
      console.error('Error exporting log:', error);
      Alert.alert('Export Error', 'Failed to export log entries');
    } finally {
      setExporting(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowSearch(false);
  };

  const renderLogEntry = ({ item }: { item: LogEntry }) => {
    const isEntry = item.action === "entry";
    const backgroundColor = isEntry ? "bg-green-50" : "bg-red-50";
    const borderColor = isEntry ? "border-green-200" : "border-red-200";
    const textColor = isEntry ? "text-green-700" : "text-red-700";
    const actionText = isEntry ? "Entry" : "Exit";

    const formattedDate = new Date(item.timestamp).toLocaleString();

    return (
      <View
        className={`p-4 mb-2 mx-2 rounded-lg border ${backgroundColor} ${borderColor}`}
      >
        <View className="flex-row justify-between items-center">
          <Text className="font-bold text-gray-800">{item.employeeName}</Text>
          <View
            className={`px-2 py-1 rounded ${isEntry ? "bg-green-200" : "bg-red-200"}`}
          >
            <Text className={textColor}>{actionText}</Text>
          </View>
        </View>
        <Text className="text-gray-600 mt-1">Device ID: {item.deviceId}</Text>
        <Text className="text-gray-500 text-sm mt-1">{formattedDate}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-gray-600">Loading log entries...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 bg-gray-100">
        {/* Header */}
        <View className="bg-blue-600 p-4 flex-row justify-between items-center">
          <Link href="/" asChild>
            <TouchableOpacity className="flex-row items-center">
              <ArrowLeft size={24} color="white" />
              <Text className="text-white text-lg ml-2">Back</Text>
            </TouchableOpacity>
          </Link>
          <Text className="text-white text-xl font-bold">
            Laptop Log ({filteredEntries.length})
          </Text>
          <View className="flex-row">
            <TouchableOpacity 
              className="mr-3 p-1" 
              onPress={() => setShowSearch(!showSearch)}
            >
              <Search size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={exportLog} disabled={exporting}>
              {exporting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Download size={24} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        {showSearch && (
          <View className="bg-white p-4 border-b border-gray-200">
            <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
              <Search size={20} color="#6b7280" />
              <TextInput
                className="flex-1 ml-2 text-base"
                placeholder="Search by name or device ID..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={showSearch}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={clearSearch}>
                  <X size={20} color="#6b7280" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Sorting and filtering options */}
        <View className="bg-white p-4 flex-row justify-between items-center border-b border-gray-200">
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => toggleSort("timestamp")}
          >
            <Clock
              size={18}
              color={sortBy === "timestamp" ? "#2563eb" : "#6b7280"}
            />
            <Text
              className={`ml-1 ${sortBy === "timestamp" ? "text-blue-600 font-bold" : "text-gray-500"}`}
            >
              Sort by Time
            </Text>
            {sortBy === "timestamp" && (
              <ArrowUpDown size={16} color="#2563eb" className="ml-1" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => toggleSort("employeeName")}
          >
            <User
              size={18}
              color={sortBy === "employeeName" ? "#2563eb" : "#6b7280"}
            />
            <Text
              className={`ml-1 ${sortBy === "employeeName" ? "text-blue-600 font-bold" : "text-gray-500"}`}
            >
              Sort by Name
            </Text>
            {sortBy === "employeeName" && (
              <ArrowUpDown size={16} color="#2563eb" className="ml-1" />
            )}
          </TouchableOpacity>
        </View>

        {/* Filter buttons */}
        <View className="flex-row justify-around bg-white py-2 border-b border-gray-200">
          <TouchableOpacity
            className={`px-4 py-2 rounded-full ${filterAction === "all" ? "bg-blue-100" : "bg-gray-100"}`}
            onPress={() => setFilterAction("all")}
          >
            <Text
              className={`${filterAction === "all" ? "text-blue-600" : "text-gray-600"}`}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 rounded-full ${filterAction === "entry" ? "bg-green-100" : "bg-gray-100"}`}
            onPress={() => setFilterAction("entry")}
          >
            <Text
              className={`${filterAction === "entry" ? "text-green-600" : "text-gray-600"}`}
            >
              Entries
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 rounded-full ${filterAction === "exit" ? "bg-red-100" : "bg-gray-100"}`}
            onPress={() => setFilterAction("exit")}
          >
            <Text
              className={`${filterAction === "exit" ? "text-red-600" : "text-gray-600"}`}
            >
              Exits
            </Text>
          </TouchableOpacity>
        </View>

        {/* Log entries list */}
        {filteredEntries.length > 0 ? (
          <FlatList
            data={filteredEntries}
            keyExtractor={(item) => item.id}
            renderItem={renderLogEntry}
            contentContainerClassName="pb-4"
            refreshing={loading}
            onRefresh={loadLogEntries}
          />
        ) : (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500 text-lg">
              {searchQuery ? "No matching entries found" : "No log entries found"}
            </Text>
            {searchQuery && (
              <TouchableOpacity 
                className="mt-4 bg-blue-500 px-4 py-2 rounded-lg"
                onPress={clearSearch}
              >
                <Text className="text-white font-medium">Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
