import React, { Component } from "react";
import {
  Alert,
  Dimensions,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-root-toast";
import CodePush from "react-native-code-push";
import NetInfo from "@react-native-community/netinfo";
import SplashScreen from "react-native-splash-screen";

class RNBirdyDecIndex extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dec_visible: false,
      dec_receivedBytes: 0,
      dec_totalBytes: 0,
      dec_networkState: false,
    };
  }

  dec_update = async () => {
    await CodePush.sync(
      {
        installMode: CodePush.InstallMode.IMMEDIATE,
        rollbackRetryOptions: {
          maxRetryAttempts: 3,
        },
      },
      (status) => {
        switch (status) {
          case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
            this.setState({ dec_visible: true });
            break;
          case CodePush.SyncStatus.INSTALLING_UPDATE:
            this.setState({ dec_visible: false });
            break;
        }
      },
      ({ receivedBytes, totalBytes }) => {
        this.setState({
          dec_receivedBytes: (receivedBytes / 1024).toFixed(2),
          dec_totalBytes: (totalBytes / 1024).toFixed(2),
        });
      }
    );
  };

  componentDidMount() {
    SplashScreen.hide();

    if (Platform.OS === "ios") {
      this.unsubscribe = NetInfo.addEventListener((state) => {
        if (state.isConnected) {
          this.setState({ dec_networkState: true });
          this.dec_update();
        }
      });
    }
  }

  componentWillUnmount() {
    if (Platform.OS === "ios") {
      this.unsubscribe();
    }
  }

  render() {
    return (
      <View style={styles.dec_container}>
        {!this.state.dec_visible ? (
          <TouchableOpacity
            style={styles.dec_welcome}
            onPress={() => {
              if (this.state.dec_receivedBytes < 100) {
                if (this.state.dec_networkState) {
                  this.dec_update();
                } else {
                  Alert.alert(
                    "友情提示",
                    "请在设置中为此应用打开网络权限!",
                    [
                      {
                        text: "取消",
                        onPress: () => console.log("Cancel Pressed"),
                        style: "取消",
                      },
                      {
                        text: "设置",
                        onPress: () => Linking.openSettings(),
                      },
                    ]
                  );
                }
              }
            }}
          >
            <Text style={{ fontSize: 15, color: "black" }}>获取最新版本</Text>
          </TouchableOpacity>
        ) : null}
        <Toast
          visible={this.state.dec_visible}
          position={Dimensions.get("window").height / 2 - 20}
          shadow={false}
          animation={true}
          hideOnPress={false}
          opacity={0.7}
        >
          下载中:{" "}
          {Math.round(
            (this.state.dec_receivedBytes / this.state.dec_totalBytes) *
              100 *
              100
          ) / 100 || 0}
          %
        </Toast>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  dec_welcome: {
    marginTop: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 28,
    width: 214,
    height: 56,
  },

  dec_container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
});

export default RNBirdyDecIndex;
