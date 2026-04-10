import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../theme/theme';
import { MainTabScreenProps } from '../../types';

// Mock data until Supabase realtime table is populated
const MOCK_CHATS = [
    { id: '1', name: 'Ramesh (Employer)', lastMessage: 'Can you start from Monday?', time: '10:30 AM', unread: 2 },
    { id: '2', name: 'Phase 1 Landlord', lastMessage: 'Yes, water is 24/7.', time: 'Yesterday', unread: 0 },
];

export const InboxScreen: React.FC<MainTabScreenProps<'Inbox'>> = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Messages</Text>
            </View>

            {MOCK_CHATS.length === 0 ? (
                <View style={styles.empty}>
                    <MaterialCommunityIcons name="chat-sleep-outline" size={64} color="#CBD5E1" />
                    <Text style={styles.emptyText}>No messages yet</Text>
                </View>
            ) : (
                <FlatList
                    data={MOCK_CHATS}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={styles.chatRow} 
                            onPress={() => (navigation as any).navigate('ChatRoom', { chatId: item.id, name: item.name })}
                        >
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{item.name[0]}</Text>
                            </View>
                            <View style={styles.chatInfo}>
                                <View style={styles.titleRow}>
                                    <Text style={[styles.name, item.unread > 0 && styles.unreadName]}>{item.name}</Text>
                                    <Text style={[styles.time, item.unread > 0 && styles.unreadTime]}>{item.time}</Text>
                                </View>
                                <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
                            </View>
                            {item.unread > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{item.unread}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    )}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    headerTitle: { fontSize: 24, fontWeight: '900', color: COLORS.text },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: COLORS.textSecondary, marginTop: 16, fontSize: 16 },
    chatRow: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F8FAFC', alignItems: 'center' },
    avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E0E7FF', alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 20, fontWeight: '800', color: '#4F46E5' },
    chatInfo: { flex: 1, marginLeft: 16 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    name: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
    unreadName: { fontWeight: '900' },
    time: { fontSize: 12, color: '#94A3B8' },
    unreadTime: { color: '#4F46E5', fontWeight: 'bold' },
    lastMessage: { fontSize: 14, color: '#64748B' },
    badge: { backgroundColor: '#EF4444', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 12 },
    badgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' }
});
