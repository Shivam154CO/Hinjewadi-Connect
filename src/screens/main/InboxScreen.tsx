import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../theme/theme';
import { MainTabScreenProps } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useChatSessions } from '../../hooks/useChat';

export const InboxScreen: React.FC<MainTabScreenProps<'Inbox'>> = ({ navigation }) => {
    const { user } = useAuth();
    const { 
        data: sessions = [], 
        isLoading, 
        isRefetching, 
        refetch 
    } = useChatSessions(user?.id);

    const handleRefresh = React.useCallback(() => {
        refetch();
    }, [refetch]);

    return (
        <View style={s.root}>
            <SafeAreaView edges={['top']}>
                <View style={s.header}>
                    <Text style={s.title}>Messages</Text>
                    <TouchableOpacity style={s.headerBtn}>
                        <MaterialCommunityIcons name="pencil-outline" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {isLoading && !isRefetching ? null : sessions.length === 0 ? (
                <View style={s.empty}>
                    <View style={s.emptyIcon}>
                        <MaterialCommunityIcons name="chat-sleep-outline" size={40} color={COLORS.textMuted} />
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
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={handleRefresh}
                            tintColor={COLORS.primary}
                            colors={[COLORS.primary]}
                        />
                    }
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
    root: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, paddingBottom: SPACING.md,
    },
    title: { fontSize: 28, fontWeight: '800', color: COLORS.text, letterSpacing: -0.5 },
    headerBtn: {
        width: 40, height: 40, borderRadius: BORDER_RADIUS.sm,
        backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
    },
    divider: { height: 1, backgroundColor: COLORS.surface, marginLeft: 82 },
    chatRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 14, paddingHorizontal: SPACING.lg,
    },
    avatarWrap: { position: 'relative', marginRight: SPACING.md },
    avatar: {
        width: 52, height: 52, borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.input, alignItems: 'center', justifyContent: 'center',
    },
    avatarActive: { backgroundColor: COLORS.primaryGlow, borderWidth: 1.5, borderColor: COLORS.primary },
    avatarText: { fontSize: 20, fontWeight: '700', color: COLORS.textSecondary },
    onlineDot: {
        position: 'absolute', top: -2, right: -2,
        width: 12, height: 12, borderRadius: 6,
        backgroundColor: COLORS.primary, borderWidth: 2, borderColor: COLORS.background,
    },
    chatContent: { flex: 1 },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    name: { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary },
    nameUnread: { color: COLORS.text, fontWeight: '700' },
    time: { fontSize: 12, color: COLORS.textMuted },
    timeUnread: { color: COLORS.primary },
    lastMsg: { fontSize: 13, color: COLORS.textMuted },
    lastMsgUnread: { color: COLORS.textSecondary },
    badge: {
        width: 22, height: 22, borderRadius: 11,
        backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginLeft: 10,
    },
    badgeText: { fontSize: 11, fontWeight: '800', color: COLORS.black },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
    emptyIcon: {
        width: 80, height: 80, borderRadius: BORDER_RADIUS.xl,
        backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg,
    },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
    emptySubtitle: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', paddingHorizontal: SPACING.xxl, lineHeight: 20 },
});
