import React, { useEffect, useState, useRef } from 'react';
import { Text, View, ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, Image, BackHandler, Dimensions } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import axios from 'axios';
import { WebView } from 'react-native-webview';
import { Ionicons, Foundation, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import ContentLoader, { Rect } from "react-content-loader/native"


const WebViewScreen = ({ route }) => {
  const { width } = Dimensions.get('window');
  const webViewRef = useRef(null);
  const navigation = useNavigation();
  const routeScreen = route.params.list ? route.params : route.params.params;

  const [isLoading, setLoading] = useState(true);
  const [isInternalLoading, setInternalLoading] = useState(false);

  // Impedir o zoom no WebView
  const injectedJavaScript = `
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'viewport');
    meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    document.getElementsByTagName('head')[0].appendChild(meta);
  `;

  useEffect(() => {
    if (routeScreen?.title) {
      navigation.setOptions({ title: routeScreen.title });
    }

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [routeScreen?.title, navigation]);

  const onLoadStart = () => {
    setInternalLoading(true); // Inicia o estado de carregamento interno
  };

  const onLoadEnd = () => {
    setInternalLoading(false); // Termina o estado de carregamento interno
    setLoading(false); // Termina o estado de carregamento quando o WebView termina de carregar
  };

  const renderLoadingIndicator = () => (
    <ContentLoader
    viewBox={`0 0 ${width} 600`}
      height="600"
      width={width}
      backgroundColor="#f0f0f0"
      foregroundColor="#e0e0e0"
      padding="50"
    >
      {/* Header */}
      <Rect x="0" y="0" rx="4" ry="4" width={width} height="40" />
      
      {/* Profile Picture */}
      <Rect x="10" y="60" rx="50" ry="50" width="100" height="100" />
      
      {/* Title */}
      <Rect x="130" y="80" rx="4" ry="4" width="200" height="20" />
      <Rect x="130" y="110" rx="4" ry="4" width="150" height="15" />
      
      {/* Paragraphs */}
      <Rect x="0" y="200" rx="4" ry="4" width={width - 20} height="10" />
      <Rect x="0" y="220" rx="4" ry="4" width={width - 40} height="10" />
      <Rect x="0" y="240" rx="4" ry="4" width={width - 60} height="10" />
      <Rect x="0" y="260" rx="4" ry="4" width={width - 80} height="10" />
      
      {/* Image */}
      <Rect x="0" y="290" rx="4" ry="4" width={width} height="200" />
      
      {/* More Paragraphs */}
      <Rect x="0" y="510" rx="4" ry="4" width={width - 20} height="10" />
      <Rect x="0" y="530" rx="4" ry="4" width={width - 40} height="10" />
      <Rect x="0" y="550" rx="4" ry="4" width={width - 60} height="10" />
    </ContentLoader>
  );
  

  let styleWebview = isLoading ? {display:'none'} : {flex:1}

  return (
    <View style={styles.container}>
      {isLoading && ( // Mostra o indicador de atividade enquanto isLoading for true
        <View style={styles.loadingContainer}>
            {renderLoadingIndicator()}
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ uri: routeScreen.url }}
        style={styleWebview}
        injectedJavaScript={injectedJavaScript}
        onLoadStart={onLoadStart} // Evento disparado quando o WebView começa a carregar
        onLoadEnd={onLoadEnd} // Evento disparado quando o WebView termina de carregar
        scalesPageToFit={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={isInternalLoading} // Inicia o estado de carregamento interno
      />
    </View>
  );
};

function DynamicScreen({ route }) {
  const navigation = useNavigation();
  useEffect(() => {
    if (route.params?.title) {
      navigation.setOptions({ title: route.params.title });
    }
  }, [route.params?.title]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
      <Text>{route.params.content}</Text>
    </View>
  );
}

function ListScreen({route}) {
  const config = route.params.config??{iconeColor:'#000'};
  const routeScreen = route.params.list ? route.params : route.params.params
//console.error(route)

  const navigation = useNavigation();
  useEffect(() => {
    if (routeScreen?.title) {
      navigation.setOptions({ title: routeScreen.title, headerTintColor: routeScreen.color});
    }
  }, [routeScreen?.title]);

  const items = routeScreen?.items || []; // Handle the case when items are undefined

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
          style={config.listStyle??styles.listItem}
          onPress={() => {
            if (item.target?.params) {
              switch (item.target.type) {
                case 'webview':
                  navigation.navigate('WebView', { url: item.target.params.url, list: true, title: item.target.params.title, config:item.target.params.config });
                  break;
                case 'dynamic':
                  navigation.navigate('Dynamic', { content: item.target.params.content, list:true, title: item.target.params.title, config:item.target.params.config });
                  break;
                case 'list':
                  navigation.navigate('List', { items: item.target.params.items, list: true, title: item.target.params.title, config:item.target.params.config });
                  break
              }
            }
          }}
        >
        
          <IconesApp {...{ name:item.icon, size:30, color:config.iconeColor, type:item.iconType }} />
          <Text style={config.textStyle??styles.listItemText}>{item.title}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

function IconesApp(props){

  switch(props.type){

    case 'Ionicons':
      return <Ionicons name={props.name} size={props.size} color={props.color} />
      break;
      case 'Foundation':
        return <Foundation name={props.name} size={props.size} color={props.color} />
        break;
      case 'FontAwesome':
        return <FontAwesome name={props.name} size={props.size} color={props.color} />
        break
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons name={props.name} size={props.size} color={props.color} />
        break
  }

}

const HomeStack = createNativeStackNavigator();

function DynamicStackScreen({ route }) {
  const { screenConfig } = route.params;

  return (
    <HomeStack.Navigator>
      {screenConfig.map((screen, index) => (
        <HomeStack.Screen
          initialParams={screen}
          key={index} 
          name={screen.name}
          options={{title:screen.title, headerShown: screen?.header}}
          component={screen.type == 'list' ? ListScreen : screen.type == 'webview' ? WebViewScreen : DynamicScreen} // Using ListScreen as the base component
          
        />
      ))}
       <HomeStack.Screen name="List" component={ListScreen}/>
      <HomeStack.Screen name="WebView" component={WebViewScreen} />
      <HomeStack.Screen name="Dynamic" component={DynamicScreen} />
    </HomeStack.Navigator>
  );
}

function LogoTitle(props) {

  return (
    <View style={styles.logoContainer}>
      <Image
            style={{ width:  120,height: 50 }}
            source={{ uri: props.logo}}
            resizeMode="contain"
          />
    </View>
    
  );
}

const Tab = createBottomTabNavigator();

function App({ tabConfig, config }) {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size, iconType }) => {
            const tab = tabConfig.find(tab => tab.name === route.name);
            const icon = tab?.icon || 'md-alert'; // Use a default icon if not found 
            return <IconesApp {...{ name:icon, size:size, color:color, type:tab.iconType }} />
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
            options={{
              headerTitle: (props) => <LogoTitle {...{logo:config.logo}} />,
              headerTitleContainerStyle: {
                paddingVertical:0,
              },
              headerTintColor:"",
              headerTitleAlign: 'center',
              headerStyle: {
    
              },
              tabBarActiveTintColor: config.tabColor,
              tabBarInactiveTintColor: config.tabInativeColor,
              tabBarActiveBackgroundColor: config.tabBackColor,
              tabBarInactiveBackgroundColor: config.tabInativeBackColor,
            }}
            initialParams={{ screenConfig: tab.screens,config: config }}
          />
        ))}
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function AppWrapper() {
  const [isLoading, setIsLoading] = useState(true);
  const [tabConfig, setTabConfig] = useState([]);
  const [config, setConfig] = useState([]);

  useEffect(() => {
    axios.get('https://portosprivados.org.br/api.php')
      .then(response => {
        setTabConfig(response.data.tabs || []); // Handle case when tabs are undefined
        setConfig(response.data.config || []); // Handle case when tabs are undefined
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

  return <App tabConfig={tabConfig} config={config}/>;
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
  logoContainer: {
    flex:1,
    flexDirection:'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Fundo semitransparente para cobrir o WebView
    paddingHorizontal: 20
  },
});
