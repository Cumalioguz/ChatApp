import React, { useEffect } from "react";
import { Text } from "react-native";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ChatList from "./screens/ChatList";
import Settings from "./screens/Settings";
import Chat from "./screens/Chat";
import SignUp from "./screens/SignUp";
import SignIn from "./screens/SignIn";
import Icon from "react-native-vector-icons/FontAwesome";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Provider as PaperProvider, DefaultTheme } from "react-native-paper";
import auth from "@react-native-firebase/auth";
import { initializeApp } from "@react-native-firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAjkSLFaGIsZ3CpSVYHfXIy1mBT437uu6Y",
  authDomain: "lifemirror-a06da.firebaseapp.com",
  projectId: "lifemirror-a06da",
  storageBucket: "lifemirror-a06da.appspot.com",
  messagingSenderId: "438468519648",
  appId: "1:438468519648:web:d399d581277b3a0b071285"
};

initializeApp(firebaseConfig);
const Stack = createNativeStackNavigator();

const Tabs = createBottomTabNavigator();

const TabsNavigator = () => {
  const navigation = useNavigation();
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (!user) {
        navigation.navigate("SignUp");
      }
    });

    return unsubscribe;
  }, []);

  return (
    <Tabs.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          elevation: 0,
          backgroundColor: 'white',
          height: 60,
          borderTopWidth: 0,
        },
      }}
    >
      <Tabs.Screen name="ChatList" component={ChatList}

        options={{
          title: "Mesajlar",
          presentation: "fullScreenModal",
          headerTintColor: 'white',
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: '#0EBA5E',
          },
          tabBarIcon: ({ focused, color, size }) => {
            return (
              <Icon
                name="commenting"
                color={focused ? '#0EBA5E' : 'black'}
                size={30}
              />
            );
          },
        }} />
      <Tabs.Screen name="Settings" component={Settings}
        options={{
          title: "Profil Ayarları",
          presentation: "fullScreenModal",
          headerTintColor: 'white',
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: '#0EBA5E',
          },
          tabBarIcon: ({ focused, color, size }) => {
            return (
              <Icon
                name="cogs"
                color={focused ? '#0EBA5E' : 'black'}
                size={30}
              />
            );
          },
        }} />
    </Tabs.Navigator>
  );
};

const theme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: "#2196f3",
    accent: "#e91e63",
  },
};

const App = () => {
  return (
    <NavigationContainer>
      <PaperProvider theme={theme}>
        <Stack.Navigator>
          <Stack.Screen
            name="Main"
            component={TabsNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Chat" component={Chat}options={{
              title: "Sohbet",
              presentation: "fullScreenModal",
              headerTintColor: 'white',
              headerTitleAlign: "center",
              headerStyle: {
                backgroundColor: '#0EBA5E',
              },
            }}/>
          <Stack.Screen
            name="SignUp"
            component={SignUp}
            options={{
              title: "Kayıt Ol",
              presentation: "fullScreenModal",
              headerTintColor: 'white',
              headerTitleAlign: "center",
              headerStyle: {
                backgroundColor: '#0EBA5E',
              },
            }}
          />
          <Stack.Screen
            name="SignIn"
            component={SignIn}
            options={{
              title: "Giriş",
              presentation: "fullScreenModal",
              headerTintColor: 'white',
              headerTitleAlign: "center",
              headerStyle: {
                backgroundColor: '#0EBA5E',
              },
            }}
          />
        </Stack.Navigator>
      </PaperProvider>
    </NavigationContainer>
  );
};

export default App;

