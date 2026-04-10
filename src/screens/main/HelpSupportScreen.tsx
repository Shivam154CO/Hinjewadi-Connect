import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, LayoutAnimation } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../theme/theme';
import { MainStackScreenProps } from '../../types';

const FAQS = [
    { q: 'How do I list my room?', a: 'Go to the Home tab and tap the "Post New Listing" button. Select "Property" and fill in the details.' },
    { q: 'Is it free to apply for jobs?', a: 'Yes! Applying for local jobs in Hinjewadi Connect is 100% free for workers.' },
    { q: 'How do I delete my account?', a: 'You can delete your account by contacting our support team via email or from the Profile Settings.' },
    { q: 'What is the Trust Score?', a: 'The Trust Score is based on verified reviews and verified phone numbers to ensure safety in our community.' },
];

export const HelpSupportScreen: React.FC<MainStackScreenProps<'HelpSupport'>> = ({ navigation }) => {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const toggleExpand = (index: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={28} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.card}>
                    <MaterialCommunityIcons name="headset" size={48} color={COLORS.primary} style={styles.cardIcon}/>
                    <Text style={styles.cardTitle}>We're here to help you</Text>
                    <Text style={styles.cardSubtitle}>Our Hinjewadi support team is available 24/7</Text>
                    
                    <View style={styles.contactRow}>
                        <TouchableOpacity style={[styles.contactBtn, { backgroundColor: '#25D366' }]} onPress={() => Linking.openURL('whatsapp://send?phone=+919999999999')}>
                            <MaterialCommunityIcons name="whatsapp" size={20} color="#FFF" />
                            <Text style={styles.contactText}>Chat</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={[styles.contactBtn, { backgroundColor: COLORS.primary }]} onPress={() => Linking.openURL('mailto:support@hinjewadiconnect.com')}>
                            <MaterialCommunityIcons name="email" size={20} color="#FFF" />
                            <Text style={styles.contactText}>Email</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                
                {FAQS.map((faq, index) => (
                    <TouchableOpacity key={index} style={styles.faqItem} onPress={() => toggleExpand(index)}>
                        <View style={styles.faqHeader}>
                            <Text style={styles.faqQ}>{faq.q}</Text>
                            <MaterialCommunityIcons name={expandedIndex === index ? 'chevron-up' : 'chevron-down'} size={24} color={COLORS.textSecondary} />
                        </View>
                        {expandedIndex === index && (
                            <Text style={styles.faqA}>{faq.a}</Text>
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    backBtn: { marginRight: 16 },
    headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
    scroll: { padding: 16 },
    
    card: { backgroundColor: '#F9FAFB', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 32, ...SHADOWS.light },
    cardIcon: { marginBottom: 16 },
    cardTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
    cardSubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 24 },
    contactRow: { flexDirection: 'row', gap: 12, width: '100%' },
    contactBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, gap: 8 },
    contactText: { color: '#FFF', fontWeight: 'bold' },
    
    sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 16 },
    faqItem: { borderWidth: 1, borderColor: '#F3F4F6', borderRadius: 16, padding: 16, marginBottom: 12 },
    faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    faqQ: { fontSize: 15, fontWeight: '700', color: COLORS.text, flex: 1 },
    faqA: { fontSize: 14, color: COLORS.textSecondary, marginTop: 12, lineHeight: 22 }
});
