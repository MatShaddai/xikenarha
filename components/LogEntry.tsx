import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react-native";

interface LogEntryProps {
  timestamp: string;
  employeeName: string;
  deviceId: string;
  action: "entry" | "exit";
}

const LogEntry = ({
  timestamp = new Date().toLocaleString(),
  employeeName = "John Doe",
  deviceId = "CA12345",
  action = "entry",
}: LogEntryProps) => {
  const isEntry = action === "entry";

  return (
    <View
      className="flex-row items-center justify-between p-4 mb-2 rounded-lg bg-white border-l-4"
      style={{
        borderLeftColor: isEntry ? "#22c55e" : "#ef4444",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <View className="flex-1">
        <Text className="text-sm text-gray-500">{timestamp}</Text>
        <Text className="text-base font-medium">{employeeName}</Text>
        <Text className="text-sm text-gray-600">ID: {deviceId}</Text>
      </View>
      <View className="flex-row items-center">
        <Text
          className={`mr-2 font-medium ${isEntry ? "text-green-600" : "text-red-600"}`}
        >
          {isEntry ? "Entry" : "Exit"}
        </Text>
        {isEntry ? (
          <ArrowDownLeft size={20} color="#22c55e" />
        ) : (
          <ArrowUpRight size={20} color="#ef4444" />
        )}
      </View>
    </View>
  );
};

export default LogEntry;
