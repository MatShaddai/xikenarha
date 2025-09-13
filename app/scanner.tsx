import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Camera } from "expo-camera";
import { BarCodeScanner } from "expo-barcode-scanner";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Check, X, Keyboard } from "lucide-react-native";
import { saveLogEntry, findEmployeeByDeviceId } from "../utils/dataManager";

export default function ScannerScreen() {
  const router = useRouter();
  const { mode = "enter" } = useLocalSearchParams();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [barcodeValue, setBarcodeValue] = useState("");
  const [scanStatus, setScanStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [processing, setProcessing] = useState(false);

  // Mock employee data for demonstration
  const employeeData = {
    CA02528: "John Doe",
    CA03791: "Jane Smith",
    CA01456: "Robert Johnson",
    CA05872: "Emily Davis",
  };

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    handleScanResult(data);
  };

  const handleManualSubmit = () => {
    if (barcodeValue.trim() === "") {
      Alert.alert("Error", "Please enter a valid barcode");
      return;
    }
    handleScanResult(barcodeValue);
  };

  const handleScanResult = async (barcode: string) => {
    setProcessing(true);
    
    try {
      // Validate barcode format (simple validation for demo)
      const isValidFormat =
        /^CA\d{5}$/.test(barcode) || /^[A-Z]{2}\d{5}$/.test(barcode);

      if (isValidFormat) {
        // Look up employee in database
        const employee = await findEmployeeByDeviceId(barcode);
        const employeeName = employee ? employee.name : "Unknown Employee";

        // Save entry to storage
        const logEntry = {
          timestamp: new Date().toISOString(),
          deviceId: barcode,
          employeeName,
          action: mode === "enter" ? "entry" as const : "exit" as const,
        };

        await saveLogEntry(logEntry);

        setScanStatus("success");

        // Show success message and return to home after delay
        setTimeout(() => {
          router.replace("/");
        }, 1500);
      } else {
        setScanStatus("error");
        setTimeout(() => {
          setScanStatus("idle");
          setScanned(false);
          setProcessing(false);
        }, 1500);
      }
    } catch (error) {
      console.error("Error processing scan:", error);
      setScanStatus("error");
      setTimeout(() => {
        setScanStatus("idle");
        setScanned(false);
        setProcessing(false);
      }, 1500);
    }
  };

  const toggleManualEntry = () => {
    setManualEntry(!manualEntry);
    setScanned(manualEntry); // Enable scanner when closing manual entry
  };

  if (hasPermission === null) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <Text className="text-red-500 mb-4">No access to camera</Text>
        <TouchableOpacity
          className="bg-blue-500 px-4 py-2 rounded-md"
          onPress={() => router.replace("/")}
        >
          <Text className="text-white font-bold">Return to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white p-4 flex-row items-center justify-between border-b border-gray-200">
        <TouchableOpacity className="p-2" onPress={() => router.back()}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">
          {mode === "enter" ? "Scan Laptop Entry" : "Scan Laptop Exit"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Camera Scanner */}
      {!manualEntry && (
        <View className="flex-1">
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Scanning overlay */}
          <View className="flex-1 items-center justify-center">
            <View className="w-64 h-64 border-2 border-white opacity-70" />
            <Text className="text-white mt-4 text-lg">
              {scanStatus === "idle" ? "Position barcode within frame" : ""}
            </Text>
          </View>

          {/* Status indicators */}
          {scanStatus === "success" && (
            <View className="absolute inset-0 bg-black bg-opacity-70 items-center justify-center">
              <View className="bg-green-500 rounded-full p-4">
                <Check size={48} color="white" />
              </View>
              <Text className="text-white text-xl mt-4">
                Successfully Scanned!
              </Text>
            </View>
          )}

          {scanStatus === "error" && (
            <View className="absolute inset-0 bg-black bg-opacity-70 items-center justify-center">
              <View className="bg-red-500 rounded-full p-4">
                <X size={48} color="white" />
              </View>
              <Text className="text-white text-xl mt-4">Invalid Barcode</Text>
            </View>
          )}
        </View>
      )}

      {/* Manual Entry Form */}
      {manualEntry && (
        <View className="flex-1 p-6 justify-center">
          <Text className="text-xl font-bold mb-6 text-center">
            Manual Barcode Entry
          </Text>
          <TextInput
            className="border border-gray-300 rounded-md p-4 text-lg mb-6 bg-white"
            placeholder="Enter barcode (e.g., CA12345)"
            value={barcodeValue}
            onChangeText={setBarcodeValue}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            className="bg-blue-500 p-4 rounded-md mb-4"
            onPress={handleManualSubmit}
          >
            <Text className="text-white text-center font-bold text-lg">
              Submit
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Action Bar */}
      <View className="bg-white p-4 flex-row justify-between items-center border-t border-gray-200">
        <TouchableOpacity
          className="flex-1 items-center py-3"
          onPress={toggleManualEntry}
        >
          <View className="flex-row items-center">
            <Keyboard size={20} color="#4b5563" />
            <Text className="ml-2 text-gray-600 font-medium">
              {manualEntry ? "Use Scanner" : "Manual Entry"}
            </Text>
          </View>
        </TouchableOpacity>

        {!manualEntry && (
          <TouchableOpacity
            className="flex-1 items-center py-3"
            onPress={() => setScanned(false)}
            disabled={!scanned || scanStatus !== "idle"}
          >
            <Text
              className={`font-medium ${!scanned || scanStatus !== "idle" ? "text-gray-400" : "text-blue-500"}`}
            >
              Scan Again
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}