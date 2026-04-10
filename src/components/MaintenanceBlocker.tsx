import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/theme';

interface Props {
    title?: string;
    message?: string;
}

// Shown when app_config sets maintenanceMode to true or app version is extremely outdated
export const MaintenanceBlocker = ({ title = "System Maintenance", message = "We are upgrading Hinjewadi Connect for a better experience. Please check back shortly." }: Props) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <MaterialCommunityIcons name="tools" size={80} color={COLORS.primary} style={styles.icon} />
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{message}</Text>
                
                <TouchableOpacity 
                    style={styles.button} 
                    onPress={() => Linking.openURL('https://hinjewadiconnect.com/status')}
                >
                    <Text style={styles.buttonText}>Check Live Status</Text>
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
    button: { backgroundColor: '#F1F5F9', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
    buttonText: { color: COLORS.primary, fontSize: 16, fontWeight: '800' }
});
