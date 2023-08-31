import { useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Text, View ,StyleSheet,Image} from "react-native";
import {
  Avatar,
} from "react-native-paper";
import { GiftedChat,Bubble } from "react-native-gifted-chat";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

const Chat = () => {
  const route = useRoute();

  const [messages, setMessages] = useState([]);

  const [uid, setUID] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    return auth().onAuthStateChanged((user) => {
      setUID(user?.uid);
      setName(user?.displayName);
    });
  }, []);

  useEffect(() => {
    return firestore()
      .doc("chats/" + route.params.chatId)
      .onSnapshot((snapshot) => {
        setMessages(snapshot.data()?.messages ?? []);
      });
  }, [route.params.chatId]);

  const onSend = (newMessages = []) => {
    firestore()
      .doc("chats/" + route.params.chatId)
      .set(
        {
          messages: GiftedChat.append(messages, newMessages),
        },
        { merge: true }
      );
  };

  const renderBubble = (props) => {
    
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: 'lightblue',
          },
          right: {
            backgroundColor: 'purple',
          },
          
        }}
      />
    );
  };
  const renderAvatar = (props) => {
    const otherUserImg=route.params.userImg;
    const { currentMessage } = props;
    const initials = currentMessage.user.name
      ? currentMessage.user.name
          .split(' ')
          .map((name) => name[0])
          .join('')
      : '';
    return (
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>{initials}</Text>
        <Image source={{ uri: otherUserImg }} style={styles.avatarImage} />
      </View>
    );
  };
  

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages.map((x) => ({
          ...x,
          createdAt: x.createdAt?.toDate(),
        }))}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: uid,
          name: name,
        }}
        renderBubble={renderBubble} // Mesaj baloncuklarını özelleştirmek için renderBubble fonksiyonunu kullanıyoruz
        renderAvatar={renderAvatar}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    //marginRight: 8,
  },
  avatarText: {
    color: 'purple',
    fontSize: 16,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    //marginLeft: 8,
  },
});

export default Chat;


  