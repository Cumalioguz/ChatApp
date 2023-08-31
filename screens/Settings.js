import React, { useEffect, useState } from "react";
import { View, Platform, StyleSheet, Alert, Image } from "react-native";
import { Avatar, Title, Subheading, Button } from "react-native-paper";
import auth from "@react-native-firebase/auth";
import storage from "@react-native-firebase/storage";
import ImagePicker from "react-native-image-crop-picker";
import firestore from "@react-native-firebase/firestore";

const Settings = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userImg, setUserImg] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const [userData, setUserData] = useState(null);
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await firestore()
          .collection("users")
          .where("email", "==", user.email)
          .get();

        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data();
          setUserData(userData);
          setName(userData.name);
          setEmail(userData.email);
          setUserImg(userData.userImg);
        }
      }
    });

    return unsubscribe;
  }, [userImg]);

  const choosePhotoFromLibrary = () => {
    ImagePicker.openPicker({
      width: 1200,
      height: 780,
      cropping: true,
    }).then((image) => {
      console.log(image);
      const imageUri = Platform.OS === "ios" ? image.sourceURL : image.path;
      setSelectedImage(imageUri);
    });
  };

  const uploadImage = async () => {
    try {
      if (selectedImage === null) {
        console.log("No image selected!");
        return;
      }
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const filename = selectedImage.substring(selectedImage.lastIndexOf("/") + 1);
      const timestamp = Date.now();
      const newFilename = `${timestamp}_${filename}`;

      const storageRef = storage().ref(`photos/${newFilename}`);
      await storageRef.put(blob);

      const url = await storageRef.getDownloadURL();
      console.log("Uploaded image URL:", url);

      await auth().currentUser.updateProfile({
        photoURL: url,
      });

      // Firestore'da "users" koleksiyonundaki "userImg" değerini güncelle
      const currentUser = auth().currentUser;
      if (currentUser) {
        await firestore().collection("users").doc(currentUser.uid).update({
          userImg: url,
        });
      }

      setUserImg(url);
      setSelectedImage(null);
      Alert.alert("Sistem", "Fotoğraf ekleme başarılı!");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Avatar.Image source={{ uri: userData?.userImg || "" }} size={80} />
        <Title>{userData?.name}</Title>
        <Subheading>{userData?.email}</Subheading>
      </View>

      <Button
        style={styles.button}
        labelStyle={styles.buttonLabel}
        mode="contained"
        onPress={choosePhotoFromLibrary}
      >
        Fotoğraf Seç
      </Button>

      {selectedImage && (
        <View>
          <Button
            style={[styles.button, styles.uploadButton]}
            labelStyle={styles.buttonLabel}
            mode="contained"
            onPress={uploadImage}
          >
            Fotoğraf yükle
          </Button>
        </View>
      )}

      <Button
        style={[styles.button, styles.signOutButton]}
        labelStyle={styles.buttonLabel}
        mode="contained"
        onPress={() => {
          auth().signOut();
          Alert.alert("Sistem", "Çıkış yapma başarılı!");
        }}
      >
        Çıkış Yap
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    backgroundColor: "#fff",
    flex: 1,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
    backgroundColor: "#3498db",
  },
  buttonLabel: {
    color: "#fff",
  },

  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  uploadButton: {
    backgroundColor: "#27ae60",
  },
  signOutButton: {
    backgroundColor: "#e74c3c",
  },
  signOutMessage: {
    marginTop: 10,
  },
});

export default Settings;
