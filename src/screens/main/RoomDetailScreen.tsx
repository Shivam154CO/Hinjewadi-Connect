import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PrimaryButton } from '../../components/PrimaryButton';
import { executeContact, ContactInfo } from '../../utils/contactUtils';

import { MainStackScreenProps } from '../../types';

export const RoomDetailScreen: React.FC<MainStackScreenProps<'RoomDetail'>> = ({ route, navigation }) => {
    // Mock data for now
    const room = {
        id: '1',
        title: 'Spacious 1RK near IT Park',
        description: 'Beautiful 1RK apartment with attached bathroom and balcony. 24/7 water supply, power backup, and security. Walking distance from major IT companies in Phase 1.',
        price: 8500,
        area: 'Phase 1',
        type: 'Room',
        amenities: ['Wifi', 'Water Purifier', 'Geyser', 'Security', 'Parking', 'Fridge'],
        contactPhone: '9876543210'
    };

    const [isSaved, setIsSaved] = React.useState(false);
    const [isOccupied, setIsOccupied] = React.useState(false);

    // Mock: check if current user is owner
    const isOwner = true; // In real app, check user.id === room.ownerId

    const roomContact: ContactInfo = {
        name: 'Room Owner',
        phone: room.contactPhone,
        context: 'room',
        contextTitle: room.title,
    };

    const handleCall = () => executeContact('call', roomContact);
    const handleWhatsApp = () => executeContact('whatsapp', roomContact);

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this room in ${room.area}, Hinjewadi: ${room.title} for ₹${room.price}/mo. Contact: ${room.contactPhone}`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.imageGallery}>
                    <View style={styles.mainImage}>
                        <MaterialCommunityIcons name="image-area" size={80} color={COLORS.border} />
                    </View>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
                    </TouchableOpacity>

                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.headerActionButton}
                            onPress={() => setIsSaved(!isSaved)}
                        >
                            <MaterialCommunityIcons
                                name={isSaved ? "heart" : "heart-outline"}
                                size={24}
                                color={isSaved ? COLORS.secondary : COLORS.text}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.headerActionButton}
                            onPress={handleShare}
                        >
                            <MaterialCommunityIcons name="share-variant" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.content}>
                    <View style={styles.headerRow}>
                        <View style={styles.typeTag}>
                            <Text style={styles.typeTagText}>{room.type}</Text>
                        </View>
                        <View style={styles.areaTag}>
                            <Text style={styles.areaTagText}>{room.area}</Text>
                        </View>
                        <View style={[styles.statusTag, isOccupied && { backgroundColor: COLORS.error + '15' }]}>
                            <Text style={[styles.statusTagText, isOccupied && { color: COLORS.error }]}>
                                {isOccupied ? 'Occupied' : 'Available'}
                            </Text>
                        </View>
                    </View>

                    {isOwner && (
                        <TouchableOpacity
                            style={styles.ownerManageBtn}
                            onPress={() => setIsOccupied(!isOccupied)}
                        >
                            <MaterialCommunityIcons
                                name={isOccupied ? "check-circle-outline" : "close-circle-outline"}
                                size={20}
                                color={COLORS.primary}
                            />
                            <Text style={styles.ownerManageText}>
                                {isOccupied ? 'Mark as Available' : 'Mark as Occupied'}
                            </Text>
                        </TouchableOpacity>
                    )}

                    <Text style={styles.title}>{room.title}</Text>
                    <View style={styles.pricingContainer}>
                        <View>
                            <Text style={styles.priceLabel}>Monthly Rent</Text>
                            <Text style={styles.price}>₹{room.price.toLocaleString()}</Text>
                        </View>
                        <View style={styles.priceDivider} />
                        <View>
                            <Text style={styles.priceLabel}>Security Deposit</Text>
                            <Text style={styles.deposit}>₹15,000</Text>
                        </View>
                    </View>

                    <View style={styles.quickInfoRow}>
                        <View style={styles.infoChip}>
                            <MaterialCommunityIcons name="sofa-outline" size={20} color={COLORS.primary} />
                            <Text style={styles.infoChipText}>Semi-furnished</Text>
                        </View>
                        <View style={styles.infoChip}>
                            <MaterialCommunityIcons name="account-group-outline" size={20} color={COLORS.primary} />
                            <Text style={styles.infoChipText}>Any Gender</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.description}>{room.description}</Text>

                    <Text style={styles.sectionTitle}>Amenities</Text>
                    <View style={styles.amenitiesGrid}>
                        {room.amenities.map((item, index) => (
                            <View key={index} style={styles.amenityItem}>
                                <MaterialCommunityIcons name="check-circle" size={18} color={COLORS.success} />
                                <Text style={styles.amenityText}>{item}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.safetyCard}>
                        <MaterialCommunityIcons name="shield-check" size={24} color={COLORS.primary} />
                        <View style={styles.safetyTextContainer}>
                            <Text style={styles.safetyTitle}>Direct Contact</Text>
                            <Text style={styles.safetySubtitle}>No brokers involved. Contact the owner directly for a visit.</Text>
                        </View>
                    </View>
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.footerActions}>
                <TouchableOpacity style={styles.whatsappButton} onPress={handleWhatsApp}>
                    <MaterialCommunityIcons name="whatsapp" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <PrimaryButton
                    title="Call Owner"
                    onPress={handleCall}
                    style={styles.callButton}
                    textStyle={{ fontSize: 18 }}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    imageGallery: {
        height: 300,
        backgroundColor: COLORS.surface,
        position: 'relative',
    },
    mainImage: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        backgroundColor: COLORS.white,
        padding: 10,
        borderRadius: BORDER_RADIUS.full,
        ...SHADOWS.medium,
        zIndex: 10,
    },
    headerActions: {
        position: 'absolute',
        top: 50,
        right: 20,
        flexDirection: 'row',
        gap: SPACING.sm,
        zIndex: 10,
    },
    headerActionButton: {
        backgroundColor: COLORS.white,
        padding: 10,
        borderRadius: BORDER_RADIUS.full,
        ...SHADOWS.medium,
    },
    ownerManageBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: COLORS.primary + '10',
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.primary + '30',
        gap: 8,
    },
    ownerManageText: {
        color: COLORS.primary,
        fontWeight: '700',
        fontSize: 14,
    },
    content: {
        padding: SPACING.lg,
        marginTop: -BORDER_RADIUS.xl,
        backgroundColor: COLORS.white,
        borderTopLeftRadius: BORDER_RADIUS.xl,
        borderTopRightRadius: BORDER_RADIUS.xl,
    },
    headerRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    typeTag: {
        backgroundColor: COLORS.secondary,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
    },
    typeTagText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '700',
    },
    areaTag: {
        backgroundColor: COLORS.primary + '15',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
    },
    areaTagText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '700',
    },
    statusTag: {
        backgroundColor: COLORS.success + '15',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
        marginLeft: 'auto',
    },
    statusTagText: {
        color: COLORS.success,
        fontSize: 12,
        fontWeight: '700',
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    pricingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.lg,
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
    },
    priceLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    price: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.primary,
    },
    deposit: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.text,
    },
    priceDivider: {
        width: 1,
        height: 30,
        backgroundColor: COLORS.border,
        marginHorizontal: SPACING.lg,
    },
    quickInfoRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginBottom: SPACING.xl,
    },
    infoChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary + '08',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: BORDER_RADIUS.md,
        gap: 8,
        flex: 1,
    },
    infoChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.text,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    description: {
        fontSize: 15,
        color: COLORS.textSecondary,
        lineHeight: 24,
        marginBottom: SPACING.xl,
    },
    amenitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.md,
        marginBottom: SPACING.xl,
    },
    amenityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '45%',
        marginBottom: SPACING.xs,
    },
    amenityText: {
        fontSize: 14,
        color: COLORS.text,
        marginLeft: 8,
    },
    safetyCard: {
        flexDirection: 'row',
        padding: SPACING.md,
        backgroundColor: COLORS.primary + '08',
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.primary + '20',
    },
    safetyTextContainer: {
        marginLeft: SPACING.md,
        flex: 1,
    },
    safetyTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.text,
    },
    safetySubtitle: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    footerActions: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        padding: SPACING.lg,
        paddingBottom: 40,
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    whatsappButton: {
        width: 56,
        height: 56,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: '#25D366',
        alignItems: 'center',
        justifyContent: 'center',
    },
    callButton: {
        flex: 1,
    },
});
