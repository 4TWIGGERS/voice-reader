import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Image,
} from "react-native";
import Voice, {
  SpeechResultsEvent,
  SpeechErrorEvent,
} from "@react-native-voice/voice";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";

const { width } = Dimensions.get("screen");
const ItemSize = 100;
const Bottom = width - ItemSize;
const Top = 0;
const Left = 0;
const Right = width - ItemSize;
const Middle = (width - ItemSize) / 2;
const shadowWithTiming = {
  damping: 40,
  stiffness: 60,
};
const itemWithTiming = {
  damping: 20,
  stiffness: 90,
};

export default function App() {
  const [results, setResults] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const borderRadius = useSharedValue(0);
  const widthHeight = useSharedValue(100);

  const textValue = useRef("");

  const customSpringStyles = useAnimatedStyle(() => {
    return {
      borderRadius: withSpring(borderRadius.value, itemWithTiming),
      width: withSpring(widthHeight.value, itemWithTiming),
      height: withSpring(widthHeight.value, itemWithTiming),
      transform: [
        {
          translateX: withSpring(offsetX.value, itemWithTiming),
        },
        {
          translateY: withSpring(offsetY.value, itemWithTiming),
        },
        { rotateZ: `${rotation.value}deg` },
      ],
    };
  });
  const customSpringStylesBlur = useAnimatedStyle(() => {
    return {
      borderRadius: withSpring(borderRadius.value, shadowWithTiming),
      width: withSpring(widthHeight.value, shadowWithTiming),
      height: withSpring(widthHeight.value, shadowWithTiming),
      transform: [
        {
          translateX: withSpring(offsetX.value, shadowWithTiming),
        },
        {
          translateY: withSpring(offsetY.value, shadowWithTiming),
        },
        { rotateZ: `${rotation.value}deg` },
      ],
    };
  });

  const splitLastWords = (sentence, lastWordsCount) =>
    sentence.split(" ").splice(-lastWordsCount).join();

  const stopSpeech = async () => {
    offsetY.value = 0;
    offsetX.value = 0;
    return await Voice.destroy(), setIsListening(false);
  };

  const callAction = async (result) => {
    const text = result.value[0];

    if (text !== textValue.current) {
      textValue.current = text;
      const latsWord = splitLastWords(text, 1);
      // setResults([latsWord]);
      switch (latsWord) {
        case "stop":
          await stopSpeech();
          setResults([latsWord]);
          return;
        case "left":
          offsetX.value = Left;
          setResults([latsWord]);
          return;
        case "right":
          offsetX.value = Right;
          setResults([latsWord]);
          return;
        case "bottom":
        case "down":
          offsetY.value = Bottom;
          setResults([latsWord]);
          return;
        case "top":
        case "up":
          offsetY.value = Top;
          setResults([latsWord]);
          return;
        case "middle":
          offsetY.value = Middle;
          offsetX.value = Middle;
          setResults([latsWord]);
          return;
        case "wiggle":
          rotation.value = withSequence(
            withTiming(-10, { duration: 50 }),
            withRepeat(withTiming(20, { duration: 100 }), 6, true),
            withTiming(0, { duration: 50 })
          );
          setResults([latsWord]);
          return;
        case "round":
          borderRadius.value = 100;
          setResults([latsWord]);
          return;
        case "square":
          borderRadius.value = 0;
          setResults([latsWord]);
          return;
        case "shrink":
          widthHeight.value = 50;
          setResults([latsWord]);
          return;
        case "grow":
          widthHeight.value = 100;
          setResults([latsWord]);
          return;
        default:
          break;
      }
    }
  };

  useEffect(() => {
    async function onSpeechResults(e: SpeechResultsEvent) {
      callAction(e);
    }

    function onSpeechError(e: SpeechErrorEvent) {
      console.error(e);
    }

    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  async function toggleListening() {
    try {
      if (isListening) {
        stopSpeech();
        setResults([]);
      } else {
        await Voice.start("en-US");
        setIsListening(true);
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.boxContainer}>
        <Animated.View
          style={[styles.item, StyleSheet.absoluteFill, customSpringStylesBlur]}
        >
          <Image
            style={[styles.imageStyle]}
            source={require("./assets/1290.png")}
          />
        </Animated.View>
        <BlurView intensity={20} style={[StyleSheet.absoluteFill]} />

        <Animated.View style={[styles.item, customSpringStyles]}>
          <Image
            style={styles.imageStyle}
            source={require("./assets/1290.png")}
          />
        </Animated.View>
      </View>
      <Text style={styles.Text}>Press the button and start speaking.</Text>
      <TouchableOpacity style={styles.button} onPress={toggleListening}>
        <Text style={styles.Text}>
          {isListening ? "Stop speaking" : "Start speaking"}
        </Text>
      </TouchableOpacity>
      <Text style={styles.Text}>Results:</Text>
      <View style={styles.resultsCont}>
        {results.map((result, index) => {
          return (
            <Text key={`result-${index}`} style={styles.Text}>
              {result}
            </Text>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  item: {
    overflow: "hidden",
  },

  boxContainer: {
    width,
    height: width,
    backgroundColor: "#000",
    marginBottom: 30,
  },
  resultsCont: {
    height: 30,
  },
  Text: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 6,
    backgroundColor: "#24262C",
    margin: 16,
  },
  imageStyle: {
    width: "100%",
    height: "100%",
  },
});
