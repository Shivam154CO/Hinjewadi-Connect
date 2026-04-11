import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
        <View style={s.root}>
            <SafeAreaView edges={['top']}>
                <View style={s.header}>
                    <Text style={s.title}>Messages</Text>
                    <TouchableOpacity style={s.headerBtn}>
                        <MaterialCommunityIcons name="pencil-outline" size={20} color="#00C896" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {loading ? null : sessions.length === 0 ? (
                <View style={s.empty}>
                    <View style={s.emptyIcon}>
                        <MaterialCommunityIcons name="chat-sleep-outline" size={40} color="#636366" />
                    </View>
                    <Text style={s.emptyTitle}>No messages yet</Text>
                    <Text style={s.emptySubtitle}>When someone contacts you, it'll show up here.</Text>
                </View>
            ) : (
                <FlatList
                    data={sessions}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingBottom: 110 }}
                    ItemSeparatorComponent={() => <View style={s.divider} />}
                    renderItem={({ item }) => {
                        const hasUnread = (item.unread || 0) > 0;
                        const initial = item.other_user?.name?.[0]?.toUpperCase() || 'U';
                        const time = new Date(item.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                        return (
                            <TouchableOpacity
                                style={s.chatRow}
                                onPress={() => (navigation as any).navigate('ChatRoom', {
                                    chatId: item.id, name: item.other_user?.name,
                                })}
                                activeOpacity={0.7}
                            >
                                {/* Avatar */}
                                <View style={s.avatarWrap}>
                                    <View style={[s.avatar, hasUnread && s.avatarActive]}>
                                        <Text style={s.avatarText}>{initial}</Text>
                                    </View>
                                    {hasUnread && <View style={s.onlineDot} />}
                                </View>

                                {/* Content */}
                                <View style={s.chatContent}>
                                    <View style={s.topRow}>
                                        <Text style={[s.name, hasUnread && s.nameUnread]}>{item.other_user?.name}</Text>
                                        <Text style={[s.time, hasUnread && s.timeUnread]}>{time}</Text>
                                    </View>
                                    <Text style={[s.lastMsg, hasUnread && s.lastMsgUnread]} numberOfLines={1}>
                                        {item.last_message}
                                    </Text>
                                </View>

                                {/* Unread badge */}
                                {hasUnread && (
                                    <View style={s.badge}>
                                        <Text style={s.badgeText}>{item.unread}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    }}
                />
            )}
        </View>
    );
};

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#0F0F0F' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
    },
    title: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
    headerBtn: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: '#1C1C1E', alignItems: 'center', justifyContent: 'center',
    },
    divider: { height: 1, backgroundColor: '#1C1C1E', marginLeft: 82 },
    chatRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 14, paddingHorizontal: 20,
    },
    avatarWrap: { position: 'relative', marginRight: 14 },
    avatar: {
        width: 52, height: 52, borderRadius: 18,
        backgroundColor: '#2C2C2E', alignItems: 'center', justifyContent: 'center',
    },
    avatarActive: { backgroundColor: '#00C89620', borderWidth: 1.5, borderColor: '#00C896' },
    avatarText: { fontSize: 20, fontWeight: '700', color: '#AEAEB2' },
    onlineDot: {
        position: 'absolute', top: -2, right: -2,
        width: 12, height: 12, borderRadius: 6,
        backgroundColor: '#00C896', borderWidth: 2, borderColor: '#0F0F0F',
    },
    chatContent: { flex: 1 },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    name: { fontSize: 15, fontWeight: '600', color: '#AEAEB2' },
    nameUnread: { color: '#FFFFFF', fontWeight: '700' },
    time: { fontSize: 12, color: '#3A3A3C' },
    timeUnread: { color: '#00C896' },
    lastMsg: { fontSize: 13, color: '#3A3A3C' },
    lastMsgUnread: { color: '#636366' },
    badge: {
        width: 22, height: 22, borderRadius: 11,
        backgroundColor: '#00C896', alignItems: 'center', justifyContent: 'center', marginLeft: 10,
    },
    badgeText: { fontSize: 11, fontWeight: '800', color: '#000000' },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
    emptyIcon: {
        width: 80, height: 80, borderRadius: 28,
        backgroundColor: '#1C1C1E', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
    },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
    emptySubtitle: { fontSize: 14, color: '#636366', textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 },
});
