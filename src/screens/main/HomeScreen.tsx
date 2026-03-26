import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { MainTabScreenProps } from '../../types';
import { COLORS, SPACING } from '../../theme/theme';

const HomeScreen: React.FC<MainTabScreenProps<'Home'>> = () => {
    const { user } = useAuth();

    const userName = user?.name || 'Guest';

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Hello, {userName}</Text>
                <Text style={styles.subtitle}>
                    Browse rooms, jobs or services using the tabs below.
                </Text>
            </View>
        </SafeAreaView>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SPACING.lg },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
    },
});
