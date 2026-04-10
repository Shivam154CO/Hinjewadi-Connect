import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../theme/theme';
import { MainTabScreenProps } from '../../types';
import { chatService, ChatSession } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';

export const InboxScreen: React.FC<MainTabScreenProps<'Inbox'>> = ({ navigation }) => {
    const { user } = useAuth();
    const [sessions, setSessions] = React.useState<ChatSession[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (!user) return;
        chatService.getInboxSessions(user.id).then(data => {
            setSessions(data);
            setLoading(false);
        });
    }, [user]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Messages</Text>
            </View>

            {loading ? null : sessions.length === 0 ? (
                <View style={styles.empty}>
                    <MaterialCommunityIcons name="chat-sleep-outline" size={64} color="#CBD5E1" />
                    <Text style={styles.emptyText}>No messages yet</Text>
                </View>
            ) : (
                <FlatList
                    data={sessions}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={styles.chatRow} 
                            onPress={() => (navigation as any).navigate('ChatRoom', { chatId: item.id, name: item.other_user?.name })}
                        >
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{item.other_user?.name?.[0] || 'U'}</Text>
                            </View>
                            <View style={styles.chatInfo}>
                                <View style={styles.titleRow}>
                                    <Text style={[styles.name, (item.unread || 0) > 0 && styles.unreadName]}>{item.other_user?.name}</Text>
                                    <Text style={[styles.time, (item.unread || 0) > 0 && styles.unreadTime]}>{new Date(item.updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                                </View>
                                <Text style={styles.lastMessage} numberOfLines={1}>{item.last_message}</Text>
                            </View>
                            {(item.unread || 0) > 0 && (
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
