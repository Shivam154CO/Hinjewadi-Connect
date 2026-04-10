import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../theme/theme';
import { supabase } from '../../supabase/supabaseClient';
import { chatService, ChatMessage } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';

export const ChatRoomScreen = ({ route, navigation }: any) => {
    const { user } = useAuth();
    const { chatId, name } = route.params || { chatId: '1', name: 'Unknown' };
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');

    React.useEffect(() => {
        // Initial Fetch
        supabase.from('messages').select('*').eq('chat_id', chatId).order('created_at', { ascending: true })
            .then(({ data }) => setMessages(data as any || []));

        // Realtime Websocket Subscription
        const channel = supabase.channel(`room_${chatId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` }, 
            payload => {
                setMessages(prev => {
                    const isDup = prev.some(m => m.id === payload.new.id);
                    return isDup ? prev : [...prev, payload.new as any];
                });
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); }
    }, [chatId]);

    const sendMessage = async () => {
        if (!inputText.trim() || !user) return;
        const tempText = inputText;
        setInputText('');
        
        // Optimistic UI update
        const tempMsg: ChatMessage = { id: Date.now().toString(), chat_id: chatId, sender_id: user.id, text: tempText, created_at: new Date().toISOString() };
        setMessages(prev => [...prev, tempMsg]);

        // Send to backend
        await chatService.sendMessage(chatId, user.id, tempText);
    };

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
                    contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
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
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
                        <MaterialCommunityIcons name="send" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
    bubble: { maxWidth: '80%', padding: 12, borderRadius: 20, marginBottom: 12 },
    bubbleThem: { backgroundColor: '#FFF', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
    bubbleMe: { backgroundColor: '#4F46E5', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
    bubbleText: { fontSize: 15, color: '#1E293B', lineHeight: 22 },
    bubbleTextMe: { color: '#FFF' },
    timeText: { fontSize: 10, color: '#94A3B8', marginTop: 4, alignSelf: 'flex-end' },
    timeTextMe: { color: '#C7D2FE' },
    inputBox: { flexDirection: 'row', padding: 12, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F1F5F9', alignItems: 'flex-end' },
    input: { flex: 1, backgroundColor: '#F1F5F9', borderRadius: 20, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, maxHeight: 100, fontSize: 15 },
    sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#4F46E5', alignItems: 'center', justifyContent: 'center', marginLeft: 12 }
});
