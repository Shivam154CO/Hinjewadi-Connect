import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PrimaryButton } from '../../components/PrimaryButton';
import { AppTextInput } from '../../components/AppTextInput';
import { MainStackScreenProps, Room } from '../../types';
import { checkForSpam } from '../../utils/trustSafetyUtils';
import { roomService } from '../../services/roomService';
import { useAuth } from '../../context/AuthContext';

const TYPES = ['Room', 'PG', 'Flat'];
const FURNISHING = ['Unfurnished', 'Semi-furnished', 'Fully-furnished'];
const GENDER = ['Male', 'Female', 'Any'];
const PHASES = ['Phase 1', 'Phase 2', 'Phase 3'];

export const PostListingScreen: React.FC<MainStackScreenProps<'PostListing'>> = ({ navigation }) => {
    const [type, setType] = useState('Room');
    const [phase, setPhase] = useState('Phase 1');
    const [furnishing, setFurnishing] = useState('Semi-furnished');
    const [gender, setGender] = useState('Any');

    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [deposit, setDeposit] = useState('');
    const [description, setDescription] = useState('');
    const [contactPhone, setContactPhone] = useState(user?.phone || '');
    const [loading, setLoading] = useState(false);

    const handlePost = () => {
        if (!title || !price || !deposit) {
            Alert.alert('Error', 'Please fill in all mandatory fields');
            return;
        }

        // Spam detection
        const spamCheck = checkForSpam(`${title} ${description}`);
        if (spamCheck.isSpam) {
            Alert.alert(
                '⚠️ Spam Detected',
                `Your listing may contain spam content (${Math.round(spamCheck.confidence * 100)}% confidence).\n\nReasons:\n${spamCheck.reasons.join('\n')}\n\nPlease review and edit your listing.`,
                [
                    { text: 'Edit Listing', style: 'cancel' },
                    { text: 'Post Anyway', style: 'destructive', onPress: doPost },
                ]
            );
            return;
        }

        doPost();
    };

    const doPost = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const newRoom: Omit<Room, 'id' | 'createdAt'> = {
                ownerId: user.id,
                title,
                description,
                price: parseInt(price),
                deposit: parseInt(deposit),
                area: phase,
                type: type as any,
                furnishing: furnishing as any,
                genderPreference: gender as any,
                amenities: [], // Add amenity selection later
                images: [], // Handled by storage utility later
                status: 'Available',
                contactPhone: contactPhone,
            };

            await roomService.createRoom(newRoom);

            Alert.alert('Success', 'Your listing has been posted successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Error posting listing:', error);
            Alert.alert('Error', 'Failed to post listing. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderSelector = (label: string, options: string[], value: string, setValue: (v: string) => void) => (
        <View style={styles.selectorContainer}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.chipRow}>
                {options.map(option => (
                    <TouchableOpacity
                        key={option}
                        style={[styles.chip, value === option && styles.chipActive]}
                        onPress={() => setValue(option)}
                    >
                        <Text style={[styles.chipText, value === option && styles.chipTextActive]}>{option}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Post Your Listing</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {renderSelector('Listing Type', TYPES, type, setType)}
                {renderSelector('Locality', PHASES, phase, setPhase)}

                <AppTextInput
                    label="Title (e.g. Spacious 1RK near Wipro)"
                    placeholder="Enter a catchy title"
                    value={title}
                    onChangeText={setTitle}
                />

                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: SPACING.md }}>
                        <AppTextInput
                            label="Monthly Rent (₹)"
                            placeholder="7000"
                            keyboardType="number-pad"
                            value={price}
                            onChangeText={setPrice}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <AppTextInput
                            label="Security Deposit (₹)"
                            placeholder="15000"
                            keyboardType="number-pad"
                            value={deposit}
                            onChangeText={setDeposit}
                        />
                    </View>
                </View>

                {renderSelector('Furnishing State', FURNISHING, furnishing, setFurnishing)}
                {renderSelector('Gender Preference', GENDER, gender, setGender)}

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Describe your property, rules, and nearby landmarks..."
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>

                <View style={[styles.imageUpload, SHADOWS.light]}>
                    <MaterialCommunityIcons name="camera-plus-outline" size={40} color={COLORS.primary} />
                    <Text style={styles.uploadText}>Add Property Photos</Text>
                    <Text style={styles.uploadSubtext}>Add up to 5 photos for better visibility</Text>
                </View>

                <PrimaryButton
                    title="Publish Listing"
                    onPress={handlePost}
                    loading={loading}
                    style={styles.postButton}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.white,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
    },
    scrollContent: {
        padding: SPACING.lg,
    },
    selectorContainer: {
        marginBottom: SPACING.lg,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    chipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    chipText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    chipTextActive: {
        color: COLORS.white,
        fontWeight: '700',
    },
    row: {
        flexDirection: 'row',
    },
    inputGroup: {
        marginBottom: SPACING.lg,
    },
    textArea: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        height: 120,
        borderWidth: 1,
        borderColor: COLORS.border,
        fontSize: 14,
    },
    imageUpload: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.xl,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.primary + '30',
        borderStyle: 'dashed',
        marginBottom: SPACING.xl,
    },
    uploadText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.primary,
        marginTop: SPACING.sm,
    },
    uploadSubtext: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    postButton: {
        marginTop: SPACING.md,
        marginBottom: SPACING.xl,
    }
});
