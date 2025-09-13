import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { Link, Stack } from "expo-router";
import {
  ArrowLeft,
  Users,
  Plus,
  Save,
  Trash2,
  CheckSquare,
  Square,
} from "lucide-react-native";
import { getEmployees, saveLogEntry, Employee } from "../utils/dataManager";

export default function BulkOperationsScreen() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [operationType, setOperationType] = useState<"entry" | "exit">("entry");
  const [showModal, setShowModal] = useState(false);
  const [eventName, setEventName] = useState("");
  const [processing, setProcessing] = useState(false);

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

  const toggleEmployeeSelection = (employeeId: string) => {
    const newSelection = new Set(selectedEmployees);
    if (newSelection.has(employeeId)) {
      newSelection.delete(employeeId);
    } else {
      newSelection.add(employeeId);
    }
    setSelectedEmployees(newSelection);
  };

  const selectAll = () => {
    if (selectedEmployees.size === employees.length) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(employees.map(emp => emp.id)));
    }
  };

  const processBulkOperation = async () => {
    if (selectedEmployees.size === 0) {
      Alert.alert("Error", "Please select at least one employee");
      return;
    }

    if (!eventName.trim()) {
      Alert.alert("Error", "Please enter an event name");
      return;
    }

    try {
      setProcessing(true);
      
      // Process each entry individually using saveLogEntry
      for (const employeeId of selectedEmployees) {
        const employee = employees.find(emp => emp.id === employeeId);
        await saveLogEntry({
          timestamp: new Date().toISOString(),
          deviceId: employeeId,
          employeeName: employee?.name || "Unknown Employee",
          action: operationType,
        });
      }
      
      Alert.alert(
        "Success", 
        `Successfully processed ${operationType} for ${selectedEmployees.size} employees`,
        [
          {
            text: "OK",
            onPress: () => {
              setSelectedEmployees(new Set());
              setEventName("");
              setShowModal(false);
            }
          }
        ]
      );
    } catch (error) {
      console.error("Error processing bulk operation:", error);
      Alert.alert("Error", "Failed to process bulk operation");
    } finally {
      setProcessing(false);
    }
  };

  const renderEmployee = ({ item }: { item: Employee }) => {
    const isSelected = selectedEmployees.has(item.id);
    
    return (
      <TouchableOpacity
        className={`p-4 mb-2 rounded-lg border ${
          isSelected ? "bg-blue-50 border-blue-300" : "bg-white border-gray-200"
        }`}
        onPress={() => toggleEmployeeSelection(item.id)}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="font-medium text-gray-800">{item.name}</Text>
            <Text className="text-gray-600">ID: {item.id}</Text>
            {item.department && (
              <Text className="text-gray-500 text-sm">{item.department}</Text>
            )}
          </View>
          {isSelected ? (
            <CheckSquare size={24} color="#3b82f6" />
          ) : (
            <Square size={24} color="#9ca3af" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="bg-orange-600 p-4 flex-row justify-between items-center">
        <Link href="/" asChild>
          <TouchableOpacity className="flex-row items-center">
            <ArrowLeft size={24} color="white" />
            <Text className="text-white text-lg ml-2">Back</Text>
          </TouchableOpacity>
        </Link>
        <Text className="text-white text-xl font-bold">Bulk Operations</Text>
        <View style={{ width: 60 }} />
      </View>

      <View className="flex-1">
        {/* Operation Type Selector */}
        <View className="bg-white p-4 border-b border-gray-200">
          <Text className="font-bold mb-3">Operation Type</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className={`flex-1 p-3 rounded-lg ${
                operationType === "entry" ? "bg-green-500" : "bg-gray-200"
              }`}
              onPress={() => setOperationType("entry")}
            >
              <Text
                className={`text-center font-medium ${
                  operationType === "entry" ? "text-white" : "text-gray-700"
                }`}
              >
                Mass Entry
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 p-3 rounded-lg ${
                operationType === "exit" ? "bg-red-500" : "bg-gray-200"
              }`}
              onPress={() => setOperationType("exit")}
            >
              <Text
                className={`text-center font-medium ${
                  operationType === "exit" ? "text-white" : "text-gray-700"
                }`}
              >
                Mass Exit
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Selection Controls */}
        <View className="bg-white p-4 border-b border-gray-200">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="font-bold">
              Select Employees ({selectedEmployees.size}/{employees.length})
            </Text>
            <TouchableOpacity
              className="bg-blue-500 px-4 py-2 rounded-lg"
              onPress={selectAll}
            >
              <Text className="text-white font-medium">
                {selectedEmployees.size === employees.length ? "Deselect All" : "Select All"}
              </Text>
            </TouchableOpacity>
          </View>
          
          {selectedEmployees.size > 0 && (
            <TouchableOpacity
              className="bg-green-500 p-3 rounded-lg flex-row items-center justify-center"
              onPress={() => setShowModal(true)}
            >
              <Save size={20} color="white" />
              <Text className="text-white ml-2 font-medium">
                Process {operationType === "entry" ? "Entry" : "Exit"} for {selectedEmployees.size} employees
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Employee List */}
        <FlatList
          data={employees}
          keyExtractor={(item) => item.id}
          renderItem={renderEmployee}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-8">
              <Users size={48} color="#9ca3af" />
              <Text className="text-gray-500 text-lg mt-4">No employees found</Text>
              <Text className="text-gray-400 text-center mt-2">
                Add employees in Settings to use bulk operations
              </Text>
            </View>
          }
        />
      </View>

      {/* Confirmation Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="p-4 border-b border-gray-200">
            <View className="flex-row justify-between items-center">
              <Text className="text-xl font-bold">Confirm Bulk Operation</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text className="text-blue-500 font-medium">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-1 p-4">
            <View className="bg-gray-50 p-4 rounded-lg mb-6">
              <Text className="font-medium mb-2">Operation Summary</Text>
              <Text className="text-gray-600">
                Type: <Text className="font-medium">{operationType === "entry" ? "Mass Entry" : "Mass Exit"}</Text>
              </Text>
              <Text className="text-gray-600">
                Employees: <Text className="font-medium">{selectedEmployees.size}</Text>
              </Text>
              <Text className="text-gray-600">
                Time: <Text className="font-medium">{new Date().toLocaleString()}</Text>
              </Text>
            </View>

            <Text className="font-medium mb-2">Event Name *</Text>
            <TextInput
              className="bg-gray-100 p-3 rounded-lg mb-6"
              placeholder="e.g., Morning Meeting, Fire Drill, Lunch Break"
              value={eventName}
              onChangeText={setEventName}
              multiline
            />

            <Text className="text-gray-600 text-sm mb-6">
              This will record {operationType} for all selected employees at the current time.
              This action cannot be undone.
            </Text>

            <TouchableOpacity
              className={`p-4 rounded-lg ${processing ? "bg-gray-400" : "bg-green-500"}`}
              onPress={processBulkOperation}
              disabled={processing}
            >
              <Text className="text-white text-center font-bold text-lg">
                {processing ? "Processing..." : `Confirm ${operationType === "entry" ? "Entry" : "Exit"}`}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}