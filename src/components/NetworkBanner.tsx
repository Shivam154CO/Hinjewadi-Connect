import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

export const NetworkBanner = () => {
    const [isConnected, setIsConnected] = useState<boolean | null>(true);
    const translateY = useSharedValue(-150);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            const connected = state.isConnected && state.isInternetReachable !== false;
            setIsConnected(connected);
            
            if (!connected && state.isConnected !== null) {
                translateY.value = withSpring(0, { damping: 15, stiffness: 90 });
            } else {
                translateY.value = withSpring(-150);
            }
        });
        return () => unsubscribe();
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <SafeAreaView edges={['top']} style={styles.safeArea}>
                <View style={styles.content}>
                    <MaterialCommunityIcons name="wifi-off" size={24} color="#FFFFFF" />
                    <Text style={styles.text}>No Internet Connection</Text>
                </View>
            </SafeAreaView>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 99999, elevation: 15 },
    safeArea: { backgroundColor: '#EF4444' }, // Red background
    content: { flexDirection: 'row', alignItems: 'center', padding: 16, justifyContent: 'center', gap: 10 },
    text: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' }
});
