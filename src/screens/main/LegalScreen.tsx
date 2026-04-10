import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../theme/theme';
import { MainStackScreenProps } from '../../types';

export const LegalScreen: React.FC<MainStackScreenProps<'Legal'>> = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={28} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Legal & Privacy</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.section}>
                    <Text style={styles.title}>Terms of Service</Text>
                    <Text style={styles.paragraph}>
                        By using Hinjewadi Connect, you agree to post authentic and reliable information.
                        Any false job listings or property scams will result in permanent suspension via our Trust Score mechanics.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.title}>Privacy Policy</Text>
                    <Text style={styles.paragraph}>
                        We value your privacy. Phone numbers and email addresses are securely stored and only shared 
                        when you explicitly contact or accept a request from a service provider, employer, or tenant.
                    </Text>
                    <Text style={styles.paragraph}>
                        We do not sell your personal data to third parties. All AI analytical data is anonymized.
                    </Text>
                </View>
                
                <View style={styles.section}>
                    <Text style={styles.title}>Licenses</Text>
                    <Text style={styles.paragraph}>
                        App powered by React Native & Expo. Icons provided by MaterialCommunityIcons.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    backBtn: { marginRight: 16 },
    headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
    scroll: { padding: 24, paddingBottom: 60 },
    section: { marginBottom: 32 },
    title: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 12 },
    paragraph: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 12 }
});
