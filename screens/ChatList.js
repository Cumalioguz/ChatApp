import React, { useState, useEffect } from "react";
import { Text, View } from "react-native";
import {
  List,
  Avatar,
  Divider,
  FAB,
  Portal,
  Dialog,
  Button,
  TextInput,
  Searchbar,
} from "react-native-paper";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { useNavigation } from "@react-navigation/native";

const ChatList = () => {
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [otherUserImg, setOtherUserImg] = useState("");
  const [userImages, setUserImages] = useState({});

  useEffect(() => {
    auth().onAuthStateChanged((user) => {
      setEmail(user?.email ?? "");
    });
  }, []);

  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();

  const createChat = async () => {
    if (!email || !userEmail) return;
    setIsLoading(true);
    const response = await firestore().collection("chats").add({
      users: [email, userEmail],
    });
    setIsLoading(false);
    setIsDialogVisible(false);
    navigation.navigate("Chat", { chatId: response.id });
  };

  const [chats, setChats] = useState([]);

  const onChangeSearch = (query) => {
    setSearchQuery(query);
    if (!query) {
      firestore()
        .collection("chats")
        .where("users", "array-contains", email)
        .onSnapshot((querySnapshot) => {
          setChats(querySnapshot?.docs ?? []);
        });
    } else {
      firestore()
        .collection("chats")
        .where("users", "array-contains", email)
        .onSnapshot((querySnapshot) => {
          const filteredChats = querySnapshot.docs.filter((doc) => {
            const otherUser = doc
              .data()
              .users.find((user) => user !== email)
              .toLowerCase();
            return otherUser.includes(query.toLowerCase());
          });
          setChats(filteredChats);
        });
    }
  };

  useEffect(() => {
    return firestore()
      .collection("chats")
      .where("users", "array-contains", email)
      .onSnapshot((querySnapshot) => {
        setChats(querySnapshot.docs);
      });
  }, [email]);

  const getUserImage = async (email) => {
    try {
      const userQuerySnapshot = await firestore()
        .collection("users")
        .where("email", "==", email)
        .get();

      if (!userQuerySnapshot.empty) {
        const userData = userQuerySnapshot.docs[0].data();
        const userImg = userData.userImg;
        if (userImg) {
          return userImg;
        }
      }
      return null;
    } catch (error) {
      console.log("Error retrieving user image:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchUserImages = async () => {
      const userImagePromises = chats.map(async (chat) => {
        const otherUser = chat
          .data()
          .users.find((x) => x !== email);

        const userImg = await getUserImage(otherUser);
        return { user: otherUser, image: userImg };
      });

      const userImages = await Promise.all(userImagePromises);

      const updatedUserImages = {};
      userImages.forEach(({ user, image }) => {
        updatedUserImages[user] = image;
      });

      setUserImages(updatedUserImages);
    };

    fetchUserImages();
  }, [chats, email]);
  return (
    <View style={{ flex: 1,backgroundColor:'white' }}>
      <Searchbar
      style={{margin:10}}
        placeholder="Ara..."
        onChangeText={onChangeSearch}
        value={searchQuery}
      />
      <View style={{ padding: 10, marginLeft: 5, flex: 1 }}>
        {chats.map((chat, index) => {
          const otherUser = chat.data().users.find((x) => x !== email);
          const otherUserImg = userImages[otherUser];

          return (
            <React.Fragment key={chat.id}>
              <List.Item
                title={otherUser}
                description={(chat.data().messages ?? [])[0]?.text ?? undefined}
                left={() =>
                  otherUserImg ? (
                    <Avatar.Image source={{ uri: otherUserImg }} size={56} /> // Kullanıcı resmini göster
                  ) : (
                    <Avatar.Text
                      label={otherUser.split(' ').reduce((prev, current) => prev + current[0], '')} // İlk harfi kullan
                      size={56}
                    />
                  )
                }
                onPress={() => navigation.navigate("Chat", { chatId: chat.id ,userImg: otherUserImg})}
              />
              {/* Divider'ı chatlerden sonuncudan sonra koymazsak */}
              {index < chats.length - 1 && <Divider />}
            </React.Fragment>
          );
        })} 
        {!((chats.length - 1) === chats.length - 1) && <Divider />}  
      </View>
      <Portal>
        <Dialog
          visible={isDialogVisible}
          onDismiss={() => setIsDialogVisible(false)}
        >
          <Dialog.Title>Yeni Sohbet</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Kullanıcının emaili giriniz"
              value={userEmail}
              onChangeText={(text) => setUserEmail(text)}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDialogVisible(false)}>İptal Et</Button>
            <Button onPress={() => createChat()} loading={isLoading}>
              Ekle
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB
        icon="plus"
        style={{ position: "absolute", bottom: 85, right: 16 }}
        onPress={() => setIsDialogVisible(true)}
      />
    </View>
  );
};

export default ChatList;
