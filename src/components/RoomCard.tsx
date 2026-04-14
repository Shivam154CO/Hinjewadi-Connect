import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Room } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { marketEngine } from '../services/marketEngineService';
import { useAuth } from '../context/AuthContext';

interface RoomCardProps {
    room: Room;
    onPress: (id: string) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onPress }) => {
    const { user } = useAuth();
    const [saved, setSaved] = useState(false);

    // Calculate dynamic match score based on current user profile
    const match = user ? marketEngine.calculateRoomMatch(user, room) : null;

    return (
        <TouchableOpacity style={s.card} onPress={() => onPress(room.id)} activeOpacity={0.85}>
            {/* Image */}
            <View style={s.imgWrap}>
                {room.images?.[0] ? (
                    <Image source={{ uri: room.images[0] }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                ) : (
                    <View style={s.imgPlaceholder}>
                        <MaterialCommunityIcons name="home-city-outline" size={28} color="#3A3A3C" />
                    </View>
                )}
                
                {/* Advanced Feature: Logic Driven Match Score Overlay */}
                {match && match.score > 70 && (
                    <View style={s.matchBadge}>
                        <MaterialCommunityIcons name="lightning-bolt" size={10} color="#000" />
                        <Text style={s.matchText}>{match.score}% Match</Text>
                    </View>
                )}

                <View style={s.imgOverlay} />
                {/* Type pill */}
                <View style={s.typePill}>
                    <Text style={s.typeText}>{room.type}</Text>
                </View>
                {/* Bookmark */}
                <TouchableOpacity
                    style={s.bookmarkBtn}
                    onPress={(e) => { e.stopPropagation(); setSaved(!saved); }}
                >
                    <MaterialCommunityIcons
                        name={saved ? 'bookmark' : 'bookmark-outline'}
                        size={16}
                        color={saved ? '#00C896' : '#FFFFFF'}
                    />
                </TouchableOpacity>
            </View>

            {/* Details */}
            <View style={s.details}>
                <View style={s.topRow}>
                    <Text style={s.title} numberOfLines={1}>{room.title}</Text>
                    <Text style={s.price}>₹{room.price.toLocaleString()}<Text style={s.priceSub}>/mo</Text></Text>
                </View>
                <View style={s.locationRow}>
                    <MaterialCommunityIcons name="map-marker-outline" size={12} color="#636366" />
                    <Text style={s.locationText}>{room.area}, Pune</Text>
                </View>
                <View style={s.tagsRow}>
                    <View style={s.tag}><Text style={s.tagText}>{room.furnishing}</Text></View>
                    <View style={s.tag}><Text style={s.tagText}>{room.genderPreference}</Text></View>
                    {room.amenities.slice(0, 1).map((a, i) => (
                        <View key={i} style={s.tag}><Text style={s.tagText}>{a}</Text></View>
                    ))}
                    <View style={s.ratingTag}>
                        <MaterialCommunityIcons name="star" size={10} color="#FFD60A" />
                        <Text style={s.ratingText}>4.8</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};


const s = StyleSheet.create({
    card: {
        backgroundColor: '#1C1C1E',
        borderRadius: 20,
        marginBottom: 14,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 6,
    },
    imgWrap: { height: 160, position: 'relative' },
    imgPlaceholder: { flex: 1, backgroundColor: '#252527', alignItems: 'center', justifyContent: 'center' },
    imgOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' },
    typePill: {
        position: 'absolute', top: 12, left: 12,
        backgroundColor: '#00C896', paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 10,
    },
    typeText: { fontSize: 11, fontWeight: '700', color: '#000000' },
    bookmarkBtn: {
        position: 'absolute', top: 12, right: 12,
        width: 32, height: 32, borderRadius: 10,
        backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center',
    },
    details: { padding: 14 },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
    title: { flex: 1, fontSize: 15, fontWeight: '600', color: '#FFFFFF', marginRight: 8 },
    price: { fontSize: 16, fontWeight: '700', color: '#00C896' },
    priceSub: { fontSize: 11, fontWeight: '400', color: '#636366' },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 10 },
    locationText: { fontSize: 12, color: '#636366' },
    tagsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' },
    tag: {
        backgroundColor: '#2C2C2E', paddingHorizontal: 8, paddingVertical: 4,
        borderRadius: 8,
    },
    tagText: { fontSize: 11, color: '#AEAEB2', fontWeight: '500' },
    ratingTag: {
        flexDirection: 'row', alignItems: 'center', gap: 3,
        backgroundColor: '#FFD60A15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
    },
    ratingText: { fontSize: 11, fontWeight: '700', color: '#FFD60A' },
    matchBadge: {
        position: 'absolute', top: 12, left: 70,
        backgroundColor: '#00C896', paddingHorizontal: 8, paddingVertical: 4,
        borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 2,
    },
    matchText: { fontSize: 10, fontWeight: '800', color: '#000000', textTransform: 'uppercase' },
});
