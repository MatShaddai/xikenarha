import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  Switch,
} from "react-native";
import { Link, Stack } from "expo-router";
import {
  ArrowLeft,
  Users,
  Trash2,
  Plus,
  Save,
  Database,
  Bell,
  Shield,
} from "lucide-react-native";
import { getEmployees, saveLogEntry, clearAllLogEntries, Employee } from "../utils/dataManager";

export default function SettingsScreen() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newEmployee, setNewEmployee] = useState({
    id: "",
    name: "",
    department: "",
    email: "",
  });
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const employeeList = await getEmployees();
      setEmployees(employeeList);
    } catch (error) {
      console.error("Error loading employees:", error);
    }
  };

  const handleAddEmployee = async () => {
    if (!newEmployee.id || !newEmployee.name) {
      Alert.alert("Error", "Please fill in ID and Name fields");
      return;
    }

    // Check if employee ID already exists
    const existingEmployee = employees.find(emp => emp.id === newEmployee.id);
    if (existingEmployee) {
      Alert.alert("Error", "Employee ID already exists");
      return;
    }

    try {
      // Since we don't have addEmployee function, we'll need to implement it differently
      // For now, we'll show an alert that this feature needs backend implementation
      Alert.alert("Info", "Employee management requires backend implementation. Using default employees for now.");
      setNewEmployee({ id: "", name: "", department: "", email: "" });
      setShowAddEmployee(false);
    } catch (error) {
      console.error("Error adding employee:", error);
      Alert.alert("Error", "Failed to add employee");
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all log entries. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              await clearAllLogEntries();
              Alert.alert("Success", "All log entries have been cleared");
            } catch (error) {
              Alert.alert("Error", "Failed to clear log entries");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="bg-blue-600 p-4 flex-row justify-between items-center">
        <Link href="/" asChild>
          <TouchableOpacity className="flex-row items-center">
            <ArrowLeft size={24} color="white" />
            <Text className="text-white text-lg ml-2">Back</Text>
          </TouchableOpacity>
        </Link>
        <Text className="text-white text-xl font-bold">Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView className="flex-1">
        {/* App Settings */}
        <View className="bg-white m-4 rounded-lg p-4">
          <View className="flex-row items-center mb-4">
            <Shield size={24} color="#3b82f6" />
            <Text className="text-lg font-bold ml-2">App Settings</Text>
          </View>

          <View className="flex-row justify-between items-center py-3 border-b border-gray-200">
            <View>
              <Text className="font-medium">Push Notifications</Text>
              <Text className="text-gray-500 text-sm">Get alerts for scan activities</Text>
            </View>
            <Switch value={notifications} onValueChange={setNotifications} />
          </View>

          <View className="flex-row justify-between items-center py-3">
            <View>
              <Text className="font-medium">Auto Backup</Text>
              <Text className="text-gray-500 text-sm">Automatically backup data daily</Text>
            </View>
            <Switch value={autoBackup} onValueChange={setAutoBackup} />
          </View>
        </View>

        {/* Employee Management */}
        <View className="bg-white m-4 rounded-lg p-4">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Users size={24} color="#3b82f6" />
              <Text className="text-lg font-bold ml-2">Employee Database</Text>
            </View>
            <TouchableOpacity
              className="bg-blue-500 px-3 py-2 rounded-lg flex-row items-center"
              onPress={() => setShowAddEmployee(!showAddEmployee)}
            >
              <Plus size={16} color="white" />
              <Text className="text-white ml-1">Add</Text>
            </TouchableOpacity>
          </View>

          {showAddEmployee && (
            <View className="bg-gray-50 p-4 rounded-lg mb-4">
              <Text className="font-medium mb-3">Add New Employee</Text>
              <TextInput
                className="bg-white p-3 rounded-lg mb-2 border border-gray-200"
                placeholder="Employee ID (e.g., CA12345)"
                value={newEmployee.id}
                onChangeText={(text) => setNewEmployee({ ...newEmployee, id: text.toUpperCase() })}
                autoCapitalize="characters"
              />
              <TextInput
                className="bg-white p-3 rounded-lg mb-2 border border-gray-200"
                placeholder="Full Name"
                value={newEmployee.name}
                onChangeText={(text) => setNewEmployee({ ...newEmployee, name: text })}
              />
              <TextInput
                className="bg-white p-3 rounded-lg mb-2 border border-gray-200"
                placeholder="Department (optional)"
                value={newEmployee.department}
                onChangeText={(text) => setNewEmployee({ ...newEmployee, department: text })}
              />
              <TextInput
                className="bg-white p-3 rounded-lg mb-3 border border-gray-200"
                placeholder="Email (optional)"
                value={newEmployee.email}
                onChangeText={(text) => setNewEmployee({ ...newEmployee, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <View className="flex-row gap-2">
                <TouchableOpacity
                  className="flex-1 bg-green-500 p-3 rounded-lg flex-row items-center justify-center"
                  onPress={handleAddEmployee}
                >
                  <Save size={16} color="white" />
                  <Text className="text-white ml-1 font-medium">Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-gray-500 p-3 rounded-lg"
                  onPress={() => {
                    setShowAddEmployee(false);
                    setNewEmployee({ id: "", name: "", department: "", email: "" });
                  }}
                >
                  <Text className="text-white text-center font-medium">Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <Text className="text-gray-600 mb-2">Registered Employees ({employees.length})</Text>
          {employees.map((employee) => (
            <View key={employee.id} className="bg-gray-50 p-3 rounded-lg mb-2">
              <Text className="font-medium">{employee.name}</Text>
              <Text className="text-gray-600">ID: {employee.id}</Text>
              {employee.department && (
                <Text className="text-gray-500 text-sm">{employee.department}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Data Management */}
        <View className="bg-white m-4 rounded-lg p-4">
          <View className="flex-row items-center mb-4">
            <Database size={24} color="#3b82f6" />
            <Text className="text-lg font-bold ml-2">Data Management</Text>
          </View>

          <TouchableOpacity
            className="bg-red-500 p-4 rounded-lg flex-row items-center justify-center"
            onPress={handleClearAllData}
          >
            <Trash2 size={20} color="white" />
            <Text className="text-white ml-2 font-medium">Clear All Log Data</Text>
          </TouchableOpacity>
          <Text className="text-gray-500 text-sm mt-2 text-center">
            This will permanently delete all scan history
          </Text>
        </View>

        {/* App Info */}
        <View className="bg-white m-4 rounded-lg p-4 mb-8">
          <Text className="text-lg font-bold mb-2">App Information</Text>
          <Text className="text-gray-600">Version: 1.0.0</Text>
          <Text className="text-gray-600">Build: MVP-001</Text>
          <Text className="text-gray-500 text-sm mt-2">
            Municipal Building Laptop Tracking System
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}