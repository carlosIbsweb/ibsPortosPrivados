import React, { useEffect, useState } from 'react';
import { Text, View, ActivityIndicator, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import axios from 'axios';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

function WebViewScreen({ route }) {
  return <WebView source={{ uri: route.params.url }} style={{ flex: 1 }} />;
}

function DynamicScreen({ route }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>{route.params.content}</Text>
    </View>
  );
}

function ListScreen({ route, navigation }) {
  const items = route.params?.items || []; // Handle the case when items are undefined

  if (items.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text>No items to display</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => {
            if (item.target?.params) {
              switch (item.target.type) {
                case 'webview':
                  navigation.navigate('WebView', { url: item.target.params.url });
                  break;
                case 'dynamic':
                  navigation.navigate('Dynamic', { content: item.target.params.content });
                  break;
                case 'list':
                  navigation.navigate('List', { items: item.target.params.items });
                  break;
                default:
                  break;
              }
            }
          }}
        >
          <Ionicons name={item.icon} size={24} color="black" />
          <Text style={styles.listItemText}>{item.title}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const HomeStack = createNativeStackNavigator();

function DynamicStackScreen({ route }) {
  const { screenConfig } = route.params;

  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="List" component={ListScreen} />
      <HomeStack.Screen name="WebView" component={WebViewScreen} />
      <HomeStack.Screen name="Dynamic" component={DynamicScreen} />
      {screenConfig.map((screen, index) => (
        <HomeStack.Screen
          key={index}
          name={screen.name}
          component={ListScreen} // Using ListScreen as the base component
          initialParams={screen.params}
        />
      ))}
    </HomeStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

function App({ tabConfig }) {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            const tab = tabConfig.find(tab => tab.name === route.name);
            const icon = tab?.icon || 'md-alert'; // Use a default icon if not found
            return <Ionicons name={icon} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        {tabConfig.map((tab, index) => (
          <Tab.Screen
            key={index}
            name={tab.name}
            component={DynamicStackScreen}
            initialParams={{ screenConfig: tab.screens }}
          />
        ))}
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function AppWrapper() {
  const [isLoading, setIsLoading] = useState(true);
  const [tabConfig, setTabConfig] = useState([]);

  useEffect(() => {
    axios.get('https://portosprivados.org.br/api.php')
      .then(response => {
        setTabConfig(response.data.tabs || []); // Handle case when tabs are undefined
        setIsLoading(false);
      })
      .catch(error => {
        console.error(error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (tabConfig.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text>No tabs to display</Text>
      </View>
    );
  }

  return <App tabConfig={tabConfig} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  listItemText: {
    marginLeft: 10,
  },
});
