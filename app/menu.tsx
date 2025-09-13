import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, Stack, useRouter } from "expo-router";
import {
  ArrowLeft,
  ClipboardList,
  BarChart3,
  Users2,
  Settings,
  UserPlus,
  Database,
  FileText,
  Shield,
  Activity,
  Users,
  TrendingUp,
} from "lucide-react-native";

export default function MenuScreen() {
  const router = useRouter();

  const menuSections = [
    {
      title: "Tracking & Logs",
      icon: Activity,
      color: "#3b82f6",
      items: [
        {
          title: "View Log",
          subtitle: "Browse all entry/exit records",
          icon: ClipboardList,
          route: "/log",
          color: "#2196F3",
        },
        {
          title: "Bulk Operations",
          subtitle: "Mass entry/exit for events",
          icon: Users2,
          route: "/bulk",
          color: "#f59e0b",
        },
      ],
    },
    {
      title: "Analytics & Reports",
      icon: TrendingUp,
      color: "#8b5cf6",
      items: [
        {
          title: "Reports & Analytics",
          subtitle: "Detailed insights and statistics",
          icon: BarChart3,
          route: "/reports",
          color: "#8b5cf6",
        },
      ],
    },
    {
      title: "Management",
      icon: Shield,
      color: "#10b981",
      items: [
        {
          title: "Settings",
          subtitle: "App configuration and employees",
          icon: Settings,
          route: "/settings",
          color: "#6b7280",
        },
      ],
    },
  ];

  const navigateTo = (route: string) => {
    router.push(route);
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
        <Text className="text-white text-xl font-bold">Menu</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView className="flex-1">
        <View className="p-4">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            Laptop Tracking System
          </Text>
          <Text className="text-gray-600 mb-6">
            Choose from the options below to manage your tracking system
          </Text>

          {menuSections.map((section, sectionIndex) => (
            <View key={sectionIndex} className="mb-6">
              {/* Section Header */}
              <View className="flex-row items-center mb-3">
                <View
                  className="w-8 h-8 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${section.color}20` }}
                >
                  <section.icon size={18} color={section.color} />
                </View>
                <Text className="text-lg font-bold text-gray-800">
                  {section.title}
                </Text>
              </View>

              {/* Section Items */}
              <View className="bg-white rounded-lg overflow-hidden">
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity
                    key={itemIndex}
                    className={`p-4 flex-row items-center ${
                      itemIndex < section.items.length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }`}
                    onPress={() => navigateTo(item.route)}
                  >
                    <View
                      className="w-12 h-12 rounded-lg items-center justify-center mr-4"
                      style={{ backgroundColor: `${item.color}15` }}
                    >
                      <item.icon size={24} color={item.color} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-medium text-gray-800">
                        {item.title}
                      </Text>
                      <Text className="text-gray-600 text-sm mt-1">
                        {item.subtitle}
                      </Text>
                    </View>
                    <ArrowLeft
                      size={20}
                      color="#9ca3af"
                      style={{ transform: [{ rotate: "180deg" }] }}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* Quick Actions */}
          <View className="bg-white rounded-lg p-4 mt-4">
            <Text className="text-lg font-bold text-gray-800 mb-3">
              Quick Actions
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-green-500 p-4 rounded-lg items-center"
                onPress={() => router.push({ pathname: "/scanner", params: { mode: "enter" } })}
              >
                <UserPlus size={24} color="white" />
                <Text className="text-white font-medium mt-2">Scan Entry</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-red-500 p-4 rounded-lg items-center"
                onPress={() => router.push({ pathname: "/scanner", params: { mode: "leave" } })}
              >
                <Users size={24} color="white" />
                <Text className="text-white font-medium mt-2">Scan Exit</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* App Info */}
          <View className="bg-white rounded-lg p-4 mt-4 mb-8">
            <View className="flex-row items-center mb-2">
              <Database size={20} color="#6b7280" />
              <Text className="text-gray-600 ml-2">All data stored locally</Text>
            </View>
            <View className="flex-row items-center">
              <FileText size={20} color="#6b7280" />
              <Text className="text-gray-600 ml-2">Version 1.0.0 - MVP</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}