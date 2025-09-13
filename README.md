# Municipal Building Laptop Tracking System

A comprehensive React Native application built with Expo for tracking laptop entries and exits in a municipal building environment. Features real-time statistics, bulk operations, and detailed reporting.

![Expo](https://img.shields.io/badge/expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#D04A37)
![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

## 🚀 Features

### Core Functionality
- **Real-time Tracking**: Monitor laptop entries and exits in real-time
- **Barcode Scanning**: Scan device IDs for quick check-in/check-out
- **Bulk Operations**: Process mass entries/exits for events and meetings
- **Visitor Management**: Register and track visitor laptop usage
- **Data Export**: Export log data to CSV format

### Dashboard & Analytics
- **Live Statistics**: Today's entries, exits, and current occupancy
- **Weekly Reports**: Comprehensive activity summaries
- **Peak Hour Analysis**: Identify busiest times of day
- **Device Activity**: Most frequently used devices tracking

### Management Features
- **Employee Database**: Manage registered employees and their devices
- **Data Management**: Clear logs and manage application data
- **Settings Configuration**: Customize app behavior and notifications

## 📋 Prerequisites

- Node.js 16+ 
- npm or yarn
- Expo CLI (optional)
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MatShaddai/xikenarha.git
   cd xikenarha
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on different platforms**
   - **iOS**: Press `i` in the terminal or scan QR code with Expo Go
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go
   - **Web**: Press `w` in the terminal

## 🏗️ Project Structure

```
xikenarha/
├── app/                 # Main application screens
│   ├── _layout.tsx     # Root layout component
│   ├── index.tsx       # Home dashboard
│   ├── scanner.tsx     # Barcode scanning
│   ├── log.tsx         # Activity history
│   ├── reports.tsx     # Analytics & statistics
│   ├── settings.tsx    # Configuration & management
│   ├── bulk.tsx        # Mass operations
│   └── menu.tsx        # Navigation menu
├── components/         # Reusable components
│   └── LogEntry.tsx    # Log entry display component
├── utils/             # Utility functions
│   └── dataManager.ts # Data storage and management
├── assets/            # Static assets
└── README.md          # This file
```

## 🎯 Usage

### Home Dashboard
The main screen displays:
- Current statistics (entries, exits, occupancy)
- Quick action buttons for scanning
- Status information
- Pull-to-refresh functionality

### Scanning Devices
1. Tap "Scan Entry" or "Scan Exit"
2. Use device camera to scan barcode
3. System automatically records the transaction
4. Statistics update in real-time

### Bulk Operations
1. Navigate to Bulk Operations from menu
2. Select employees for mass operation
3. Choose entry or exit mode
4. Add event description
5. Confirm to process all selected

### Reports & Analytics
- View daily and weekly summaries
- See most active devices
- Identify peak usage hours
- Register visitor entries

### Settings
- Manage employee database
- Configure app settings
- Clear log data
- View app information

## 🔧 Technical Details

### Tech Stack
- **Frontend**: React Native with Expo
- **Routing**: Expo Router (file-based routing)
- **Styling**: React Native StyleSheet + Tailwind CSS (NativeWind)
- **Icons**: Lucide React Native
- **State Management**: React useState/useEffect
- **Storage**: AsyncStorage (local data persistence)

### Key Dependencies
```json
{
  "expo": "^51.0.0",
  "react": "18.2.0",
  "react-native": "0.74.1",
  "expo-router": "^3.4.0",
  "lucide-react-native": "^0.300.0",
  "nativewind": "^4.0.1"
}
```

## 📊 Data Management

The application uses local storage with the following data structure:

### Log Entries
```typescript
interface LogEntry {
  id: string;
  timestamp: string;
  deviceId: string;
  employeeName: string;
  action: 'entry' | 'exit';
}
```

### Employees
```typescript
interface Employee {
  id: string;
  name: string;
  department?: string;
  email?: string;
}
```

## 🚀 Deployment

### Building for Production

1. **Configure build settings**
   ```bash
   npx expo prebuild
   ```

2. **Build for platforms**
   ```bash
   # iOS
   npx eas build --platform ios

   # Android
   npx eas build --platform android
   ```

3. **Submit to app stores**
   - Follow Expo's submission guidelines
   - Configure app store metadata
   - Test thoroughly before release

### Environment Variables
Create `.env` file for environment-specific configuration:
```
API_URL=your_api_url_here
APP_VERSION=1.0.0
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use TypeScript for type safety
- Follow React Native best practices
- Use descriptive variable names
- Add comments for complex logic
- Ensure responsive design

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Expo documentation](https://docs.expo.dev/)
2. Search existing [GitHub issues](https://github.com/MatShaddai/xikenarha/issues)
3. Create a new issue with detailed description

## 🙏 Acknowledgments

- Expo team for excellent development tools
- React Native community for components and libraries
- Lucide for beautiful icons
- NativeWind for Tailwind CSS integration

---

**Note**: This is a demonstration application for municipal building laptop tracking. For production use, consider adding backend integration, user authentication, and enhanced security features.
