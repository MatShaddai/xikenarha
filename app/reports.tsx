import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, Stack } from "expo-router";
import {
  ArrowLeft,
  Users,
  UserPlus,
  Building,
  BarChart3,
  Calendar,
  TrendingUp,
} from "lucide-react-native";
import { getLogEntries, saveLogEntry, getEmployees } from "../utils/dataManager";

export default function ReportsScreen() {
  const [stats, setStats] = useState({
    totalEntries: 0,
    todayEntries: 0,
    todayExits: 0,
    weeklyEntries: 0,
    currentlyInside: 0,
    totalVisitors: 0,
    todayVisitors: 0,
    mostActiveDevices: [] as [string, number][],
    peakHour: 9,
    averageDaily: 0,
    lastActivity: null as string | null,
  });
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [visitorForm, setVisitorForm] = useState({
    visitorName: "",
    hostEmployee: "",
    purpose: "",
    deviceId: "",
  });
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statistics, employeeList] = await Promise.all([
        getDetailedStatistics(),
        getEmployees(),
      ]);
      setStats(statistics);
      setEmployees(employeeList);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDetailedStatistics = async () => {
    try {
      const entries = await getLogEntries();
      const today = new Date().toDateString();
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const todayEntries = entries.filter(entry => 
        new Date(entry.timestamp).toDateString() === today && entry.action === 'entry'
      ).length;
      
      const todayExits = entries.filter(entry => 
        new Date(entry.timestamp).toDateString() === today && entry.action === 'exit'
      ).length;
      
      const weeklyEntries = entries.filter(entry => 
        new Date(entry.timestamp) >= weekAgo && entry.action === 'entry'
      ).length;
      
      const currentlyInside = Math.max(0, todayEntries - todayExits);
      
      // Calculate most active devices
      const deviceCounts = {};
      entries.forEach(entry => {
        deviceCounts[entry.deviceId] = (deviceCounts[entry.deviceId] || 0) + 1;
      });
      
      const mostActiveDevices = Object.entries(deviceCounts)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 5) as [string, number][];
      
      // Calculate peak hour
      const hourCounts = {};
      entries.forEach(entry => {
        const hour = new Date(entry.timestamp).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });
      
      const peakHour = Object.entries(hourCounts)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 9;
      
      const averageDaily = Math.round(entries.length / Math.max(1, 
        Math.ceil((Date.now() - new Date(entries[entries.length - 1]?.timestamp || Date.now()).getTime()) / (24 * 60 * 60 * 1000))
      ));
      
      return {
        totalEntries: entries.length,
        todayEntries,
        todayExits,
        weeklyEntries,
        currentlyInside,
        totalVisitors: 0, // We don't have visitor tracking in the basic storage
        todayVisitors: 0,
        mostActiveDevices,
        peakHour: parseInt(peakHour),
        averageDaily,
        lastActivity: entries[0]?.timestamp || null,
      };
    } catch (error) {
      console.error('Error getting detailed statistics:', error);
      return {
        totalEntries: 0,
        todayEntries: 0,
        todayExits: 0,
        weeklyEntries: 0,
        currentlyInside: 0,
        totalVisitors: 0,
        todayVisitors: 0,
        mostActiveDevices: [],
        peakHour: 9,
        averageDaily: 0,
        lastActivity: null,
      };
    }
  };

  const handleVisitorEntry = async () => {
    if (!visitorForm.visitorName || !visitorForm.deviceId) {
      Alert.alert("Error", "Please fill in visitor name and device ID");
      return;
    }

    try {
      // Save visitor as a regular log entry with visitor prefix
      await saveLogEntry({
        timestamp: new Date().toISOString(),
        deviceId: visitorForm.deviceId,
        employeeName: `VISITOR: ${visitorForm.visitorName} (Host: ${visitorForm.hostEmployee || 'Unknown'})`,
        action: "entry",
      });

      setVisitorForm({
        visitorName: "",
        hostEmployee: "",
        purpose: "",
        deviceId: "",
      });
      setShowVisitorModal(false);
      await loadData();
      Alert.alert("Success", "Visitor entry recorded");
    } catch (error) {
      Alert.alert("Error", "Failed to record visitor entry");
    }
  };

  const formatPeakHour = (hour: number) => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="bg-purple-600 p-4 flex-row justify-between items-center">
        <Link href="/" asChild>
          <TouchableOpacity className="flex-row items-center">
            <ArrowLeft size={24} color="white" />
            <Text className="text-white text-lg ml-2">Back</Text>
          </TouchableOpacity>
        </Link>
        <Text className="text-white text-xl font-bold">Reports & Analytics</Text>
        <TouchableOpacity onPress={() => setShowVisitorModal(true)}>
          <UserPlus size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {/* Quick Stats Grid */}
        <View className="p-4">
          <Text className="text-lg font-bold mb-4">Overview</Text>
          <View className="flex-row flex-wrap justify-between">
            <View className="bg-white p-4 rounded-lg w-[48%] mb-4">
              <Building size={24} color="#3b82f6" />
              <Text className="text-2xl font-bold mt-2">{stats.currentlyInside}</Text>
              <Text className="text-gray-600">Currently Inside</Text>
            </View>
            <View className="bg-white p-4 rounded-lg w-[48%] mb-4">
              <Calendar size={24} color="#10b981" />
              <Text className="text-2xl font-bold mt-2">{stats.todayEntries}</Text>
              <Text className="text-gray-600">Today's Entries</Text>
            </View>
            <View className="bg-white p-4 rounded-lg w-[48%] mb-4">
              <Users size={24} color="#f59e0b" />
              <Text className="text-2xl font-bold mt-2">{stats.todayVisitors}</Text>
              <Text className="text-gray-600">Today's Visitors</Text>
            </View>
            <View className="bg-white p-4 rounded-lg w-[48%] mb-4">
              <TrendingUp size={24} color="#8b5cf6" />
              <Text className="text-2xl font-bold mt-2">{stats.averageDaily}</Text>
              <Text className="text-gray-600">Daily Average</Text>
            </View>
          </View>
        </View>

        {/* Weekly Summary */}
        <View className="bg-white mx-4 mb-4 p-4 rounded-lg">
          <Text className="text-lg font-bold mb-3">Weekly Summary</Text>
          <View className="flex-row justify-between items-center py-2">
            <Text className="text-gray-600">Total Entries This Week</Text>
            <Text className="font-bold text-lg">{stats.weeklyEntries}</Text>
          </View>
          <View className="flex-row justify-between items-center py-2">
            <Text className="text-gray-600">Peak Activity Hour</Text>
            <Text className="font-bold text-lg">{formatPeakHour(stats.peakHour)}</Text>
          </View>
          <View className="flex-row justify-between items-center py-2">
            <Text className="text-gray-600">Total Visitors</Text>
            <Text className="font-bold text-lg">{stats.totalVisitors}</Text>
          </View>
        </View>

        {/* Most Active Devices */}
        <View className="bg-white mx-4 mb-4 p-4 rounded-lg">
          <Text className="text-lg font-bold mb-3">Most Active Devices</Text>
          {stats.mostActiveDevices.length > 0 ? (
            stats.mostActiveDevices.map(([deviceId, count], index) => (
              <View key={deviceId} className="flex-row justify-between items-center py-2">
                <View className="flex-row items-center">
                  <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center mr-3">
                    <Text className="text-blue-600 font-bold text-sm">{index + 1}</Text>
                  </View>
                  <Text className="font-medium">{deviceId}</Text>
                </View>
                <Text className="text-gray-600">{count} scans</Text>
              </View>
            ))
          ) : (
            <Text className="text-gray-500 text-center py-4">No activity data available</Text>
          )}
        </View>

        {/* Quick Actions */}
        <View className="bg-white mx-4 mb-8 p-4 rounded-lg">
          <Text className="text-lg font-bold mb-3">Quick Actions</Text>
          <TouchableOpacity
            className="bg-green-500 p-4 rounded-lg flex-row items-center justify-center mb-3"
            onPress={() => setShowVisitorModal(true)}
          >
            <UserPlus size={20} color="white" />
            <Text className="text-white ml-2 font-medium">Register Visitor</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-blue-500 p-4 rounded-lg flex-row items-center justify-center"
            onPress={loadData}
          >
            <BarChart3 size={20} color="white" />
            <Text className="text-white ml-2 font-medium">Refresh Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Visitor Registration Modal */}
      <Modal
        visible={showVisitorModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="p-4 border-b border-gray-200">
            <View className="flex-row justify-between items-center">
              <Text className="text-xl font-bold">Register Visitor</Text>
              <TouchableOpacity onPress={() => setShowVisitorModal(false)}>
                <Text className="text-blue-500 font-medium">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 p-4">
            <Text className="font-medium mb-2">Visitor Name *</Text>
            <TextInput
              className="bg-gray-100 p-3 rounded-lg mb-4"
              placeholder="Enter visitor's full name"
              value={visitorForm.visitorName}
              onChangeText={(text) => setVisitorForm({ ...visitorForm, visitorName: text })}
            />

            <Text className="font-medium mb-2">Device ID *</Text>
            <TextInput
              className="bg-gray-100 p-3 rounded-lg mb-4"
              placeholder="Scan or enter device barcode"
              value={visitorForm.deviceId}
              onChangeText={(text) => setVisitorForm({ ...visitorForm, deviceId: text.toUpperCase() })}
              autoCapitalize="characters"
            />

            <Text className="font-medium mb-2">Host Employee</Text>
            <TextInput
              className="bg-gray-100 p-3 rounded-lg mb-4"
              placeholder="Employee they're visiting"
              value={visitorForm.hostEmployee}
              onChangeText={(text) => setVisitorForm({ ...visitorForm, hostEmployee: text })}
            />

            <Text className="font-medium mb-2">Purpose of Visit</Text>
            <TextInput
              className="bg-gray-100 p-3 rounded-lg mb-6"
              placeholder="Meeting, delivery, maintenance, etc."
              value={visitorForm.purpose}
              onChangeText={(text) => setVisitorForm({ ...visitorForm, purpose: text })}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              className="bg-green-500 p-4 rounded-lg"
              onPress={handleVisitorEntry}
            >
              <Text className="text-white text-center font-bold text-lg">Register Entry</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
