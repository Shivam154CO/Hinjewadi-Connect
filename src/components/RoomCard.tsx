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
                    <View style={s.imgFallback}>
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
        borderRadius: 12,
        marginBottom: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#2C2C2E',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
    imgWrap: { height: 110, position: 'relative' },
    imgFallback: { flex: 1, backgroundColor: '#252527', alignItems: 'center', justifyContent: 'center' },
    imgOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.15)' },
    typePill: {
        position: 'absolute', top: 8, left: 8,
        backgroundColor: '#00C896', paddingHorizontal: 7, paddingVertical: 2,
        borderRadius: 6,
    },
    typeText: { fontSize: 10, fontWeight: '700', color: '#000000' },
    bookmarkBtn: {
        position: 'absolute', top: 8, right: 8,
        width: 26, height: 26, borderRadius: 6,
        backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center',
    },
    details: { padding: 10 },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 },
    title: { flex: 1, fontSize: 14, fontWeight: '600', color: '#FFFFFF', marginRight: 8 },
    price: { fontSize: 14, fontWeight: '700', color: '#00C896' },
    priceSub: { fontSize: 10, fontWeight: '400', color: '#636366' },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 6 },
    locationText: { fontSize: 11, color: '#636366' },
    tagsRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap', alignItems: 'center' },
    tag: {
        backgroundColor: '#2C2C2E', paddingHorizontal: 6, paddingVertical: 3,
        borderRadius: 6,
    },
    tagText: { fontSize: 10, color: '#AEAEB2', fontWeight: '500' },
    ratingTag: {
        flexDirection: 'row', alignItems: 'center', gap: 2,
        backgroundColor: '#FFD60A15', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6,
    },
    ratingText: { fontSize: 10, fontWeight: '700', color: '#FFD60A' },
    matchBadge: {
        position: 'absolute', top: 8, left: 60,
        backgroundColor: '#00C896', paddingHorizontal: 6, paddingVertical: 2,
        borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 1,
    },
    matchText: { fontSize: 9, fontWeight: '800', color: '#000000', textTransform: 'uppercase' },
});
