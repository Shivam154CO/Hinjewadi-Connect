import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, SHADOWS } from '../theme/theme';
import { Room } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface RoomCardProps {
    room: Room;
    onPress: (id: string) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onPress }) => {
    const [saved, setSaved] = useState(false);

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onPress(room.id)}
            activeOpacity={0.85}
        >
            {/* Image — left side */}
            <View style={styles.imageWrap}>
                {room.images && room.images.length > 0 ? (
                    <Image source={{ uri: room.images[0] }} style={styles.image} />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <MaterialCommunityIcons name="home-city-outline" size={32} color="#D1D5DB" />
                    </View>
                )}
                <View style={styles.typePill}>
                    <Text style={styles.typeText}>{room.type}</Text>
                </View>
            </View>

            {/* Details — right side */}
            <View style={styles.details}>
                <View style={styles.topRow}>
                    <Text style={styles.title} numberOfLines={2}>{room.title}</Text>
                    <TouchableOpacity
                        onPress={(e) => { e.stopPropagation(); setSaved(!saved); }}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <MaterialCommunityIcons
                            name={saved ? 'bookmark' : 'bookmark-outline'}
                            size={20}
                            color={saved ? COLORS.primary : '#D1D5DB'}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.locationRow}>
                    <MaterialCommunityIcons name="map-marker-outline" size={12} color={COLORS.textMuted} />
                    <Text style={styles.locationText}>{room.area}</Text>
                </View>

                {/* Price */}
                <Text style={styles.price}>
                    ₹{room.price.toLocaleString()}
                    <Text style={styles.priceUnit}> / Per Month</Text>
                </Text>

                {/* Rating row */}
                <View style={styles.ratingRow}>
                    {[1, 2, 3, 4, 5].map(i => (
                        <MaterialCommunityIcons
                            key={i}
                            name={i <= 4 ? 'star' : 'star-half-full'}
                            size={12}
                            color="#F59E0B"
                        />
                    ))}
                    <Text style={styles.ratingText}>4.4</Text>
                    <View style={styles.furnDot} />
                    <Text style={styles.furnText}>{room.furnishing}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const COLORS_REF = COLORS;

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        ...SHADOWS.light,
    },
    imageWrap: {
        width: 120,
        height: 130,
        position: 'relative',
        flexShrink: 0,
    },
    image: { width: '100%', height: '100%' },
    imagePlaceholder: {
        width: '100%', height: '100%', backgroundColor: '#F3F4F6',
        alignItems: 'center', justifyContent: 'center',
    },
    typePill: {
        position: 'absolute', bottom: 8, left: 8,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6,
    },
    typeText: { fontSize: 10, color: '#FFFFFF', fontWeight: '700' },

    details: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
        flex: 1,
        marginRight: 6,
        lineHeight: 20,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        marginTop: 3,
    },
    locationText: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
    price: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.primary,
        marginTop: 6,
    },
    priceUnit: { fontSize: 11, fontWeight: '400', color: '#9CA3AF' },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        marginTop: 8,
    },
    ratingText: { fontSize: 11, fontWeight: '700', color: '#111827', marginLeft: 3 },
    furnDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#D1D5DB', marginHorizontal: 5 },
    furnText: { fontSize: 11, color: '#6B7280' },
});
