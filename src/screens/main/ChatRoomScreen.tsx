import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { COLORS, SPACING, BORDER_RADIUS } from '../../theme/theme';
import { supabase } from '../../supabase/supabaseClient';
import { ChatMessage } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';
import { useMessages, useSendMessage } from '../../hooks/useChat';
import { MainStackScreenProps } from '../../types';

export const ChatRoomScreen: React.FC<MainStackScreenProps<'ChatRoom'>> = ({ route, navigation }) => {
    const { user } = useAuth();
    const { chatId, name } = route.params;
    const queryClient = useQueryClient();
    const [inputText, setInputText] = useState('');

    const { data: messages = [], isLoading } = useMessages(chatId);
    const { mutate: sendMessageMutation } = useSendMessage();

    useEffect(() => {
        // Realtime Websocket Subscription
        const channel = supabase.channel(`room_${chatId}`)
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'messages', 
                filter: `chat_id=eq.${chatId}` 
            }, 
            payload => {
                const newMessage = payload.new as ChatMessage;
                // Update TanStack Query cache instead of local state
                queryClient.setQueryData(['messages', chatId], (old: ChatMessage[] | undefined) => {
                    const exists = old?.some(m => m.id === newMessage.id);
                    if (exists) return old;
                    return [...(old || []), newMessage];
                });
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); }
    }, [chatId, queryClient]);

    const handleSend = useCallback(() => {
        if (!inputText.trim() || !user) return;
        const text = inputText;
        setInputText('');
        
        // Use the mutation for sending
        sendMessageMutation({ chatId, senderId: user.id, text });
    }, [chatId, inputText, user, sendMessageMutation]);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={28} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{name}</Text>
                <TouchableOpacity>
                    <MaterialCommunityIcons name="dots-vertical" size={28} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <FlatList
                    data={messages}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: SPACING.md, paddingBottom: SPACING.xl }}
                    renderItem={({ item }) => (
                        <View style={[styles.bubble, item.sender_id === user?.id ? styles.bubbleMe : styles.bubbleThem]}>
                            <Text style={[styles.bubbleText, item.sender_id === user?.id && styles.bubbleTextMe]}>{item.text}</Text>
                            <Text style={[styles.timeText, item.sender_id === user?.id && styles.timeTextMe]}>
                                {new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </Text>
                        </View>
                    )}
                />

                <View style={styles.inputBox}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        placeholderTextColor={COLORS.textMuted}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
                        <MaterialCommunityIcons name="send" size={20} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: SPACING.md, 
        backgroundColor: COLORS.surface, 
        borderBottomWidth: 1, 
        borderBottomColor: COLORS.border 
    },
    headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
    bubble: { maxWidth: '80%', padding: 12, borderRadius: BORDER_RADIUS.lg, marginBottom: 12 },
    bubbleThem: { backgroundColor: COLORS.surface, alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
    bubbleMe: { backgroundColor: COLORS.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
    bubbleText: { fontSize: 15, color: COLORS.text, lineHeight: 22 },
    bubbleTextMe: { color: COLORS.white },
    timeText: { fontSize: 10, color: COLORS.textSecondary, marginTop: 4, alignSelf: 'flex-end' },
    timeTextMe: { color: COLORS.white + 'CC' },
    inputBox: { 
        flexDirection: 'row', 
        padding: SPACING.md, 
        backgroundColor: COLORS.surface, 
        borderTopWidth: 1, 
        borderTopColor: COLORS.border, 
        alignItems: 'flex-end' 
    },
    input: { 
        flex: 1, 
        backgroundColor: COLORS.input, 
        borderRadius: BORDER_RADIUS.lg, 
        paddingHorizontal: SPACING.md, 
        paddingTop: 10, 
        paddingBottom: 10, 
        maxHeight: 100, 
        fontSize: 15,
        color: COLORS.text
    },
    sendBtn: { 
        width: 44, 
        height: 44, 
        borderRadius: 22, 
        backgroundColor: COLORS.primary, 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginLeft: 12 
    }
});
