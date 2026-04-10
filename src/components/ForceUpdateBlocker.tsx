import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/theme';

interface Props {
    latestVersion?: string;
}

export const ForceUpdateBlocker = ({ latestVersion = "the latest version" }: Props) => {
    
    const handleUpdate = () => {
        // Here you would link to App Store or Play Store based on OS
        const url = Platform.OS === 'ios' ? 'https://apps.apple.com' : 'https://play.google.com/store';
        Linking.openURL(url);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <MaterialCommunityIcons name="rocket-launch" size={80} color="#10B981" style={styles.icon} />
                <Text style={styles.title}>Update Required</Text>
                <Text style={styles.subtitle}>
                    You are using an older version of Hinjewadi Connect. Please update to {latestVersion} to continue using the app securely.
                </Text>
                
                <TouchableOpacity style={styles.button} onPress={handleUpdate}>
                    <Text style={styles.buttonText}>Update Now</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    icon: { marginBottom: 24 },
    title: { fontSize: 26, fontWeight: '900', color: '#1E293B', marginBottom: 12, textAlign: 'center' },
    subtitle: { fontSize: 16, color: '#64748B', textAlign: 'center', marginBottom: 32, lineHeight: 24, paddingHorizontal: 20 },
    button: { backgroundColor: '#10B981', paddingHorizontal: 40, paddingVertical: 16, borderRadius: 16, ...SHADOWS.medium },
    buttonText: { color: "#FFF", fontSize: 16, fontWeight: '800' }
});
