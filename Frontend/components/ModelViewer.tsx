import React, { useRef, useState } from "react";
import { View, ActivityIndicator, Text, StyleSheet, ViewStyle } from "react-native";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as FileSystem from "expo-file-system";

type ModelViewerProps = {
  modelUrl: string | null | undefined;
  style?: ViewStyle;
};

const ModelViewer: React.FC<ModelViewerProps> = ({ modelUrl, style }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef<number>();

  const onContextCreate = async (gl: WebGLRenderingContext) => {
    if (!modelUrl) {
      setError("No model URL provided.");
      setLoading(false);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      1000
    );
    camera.position.z = 2;

    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    try {
      let uri = modelUrl;
      // Download remote .glb file to cache if needed
      if (modelUrl.startsWith("http")) {
        const fileUri = FileSystem.cacheDirectory + "model.glb";
        const downloadResumable = FileSystem.createDownloadResumable(
          modelUrl,
          fileUri
        );
        await downloadResumable.downloadAsync();
        uri = fileUri;
      }

      // Polyfill fetch for GLTFLoader if needed
      // @ts-ignore
      if (!global.fetch) global.fetch = FileSystem.fetch || fetch;

      const loader = new GLTFLoader();
      loader.setCrossOrigin("anonymous");

      loader.load(
        uri,
        (gltf) => {
          const object = gltf.scene;
          object.scale.set(1, 1, 1);
          scene.add(object);

          const animate = () => {
            requestRef.current = requestAnimationFrame(animate);
            object.rotation.y += 0.01;
            renderer.render(scene, camera);
            (gl as any).endFrameEXP();
          };
          animate();
          setLoading(false);
        },
        undefined,
        (err) => {
          setError("Failed to load model: " + err.message);
          setLoading(false);
        }
      );
    } catch (err: any) {
      setError("Failed to load model: " + err.message);
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading model...</Text>
        </View>
      )}
      {!!error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      <GLView style={StyleSheet.absoluteFill} onContextCreate={onContextCreate} />
    </View>
  );
};

export default ModelViewer;

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingOverlay: {
    position: "absolute",
    top: "40%",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  loadingText: { marginTop: 10, fontSize: 16, color: "#666" },
  errorContainer: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  errorText: { marginTop: 20, textAlign: "center", color: "red", fontSize: 16 },
});