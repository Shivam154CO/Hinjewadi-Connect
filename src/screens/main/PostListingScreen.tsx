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
import { MainStackScreenProps, Room, Job, JobCategory } from '../../types';
import { checkForSpam } from '../../utils/trustSafetyUtils';
import { roomService } from '../../services/roomService';
import { jobService } from '../../services/jobService';
import { useAuth } from '../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
import { imageService } from '../../services/imageService';
import { validation } from '../../utils/validation';

const TYPES = ['Room', 'PG', 'Flat'];
const FURNISHING = ['Unfurnished', 'Semi-furnished', 'Fully-furnished'];
const GENDER = ['Male', 'Female', 'Any'];
const PHASES = ['Phase 1', 'Phase 2', 'Phase 3'];
const JOB_CATEGORIES: JobCategory[] = ['Peon', 'Guard', 'Office Boy', 'Watchman', 'Helper', 'Security', 'Driver', 'Cook'];

export const PostListingScreen: React.FC<MainStackScreenProps<'PostListing'>> = ({ navigation }) => {
    const { user } = useAuth();

    // Mode selection Stage
    const [postingType, setPostingType] = useState<'room' | 'job' | null>(
        user?.listingCategory === 'job' ? 'job' :
            user?.listingCategory === 'property' ? 'room' : null
    );

    // Common fields
    const [phase, setPhase] = useState('Phase 1');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [contactPhone, setContactPhone] = useState(user?.phone || '');
    const [loading, setLoading] = useState(false);

    // Room specific
    const [roomType, setRoomType] = useState('Room');
    const [price, setPrice] = useState('');
    const [deposit, setDeposit] = useState('');
    const [furnishing, setFurnishing] = useState('Semi-furnished');
    const [gender, setGender] = useState('Any');

    // Job specific
    const [jobCategory, setJobCategory] = useState<JobCategory>('Helper');
    const [salary, setSalary] = useState('');
    const [company, setCompany] = useState(user?.name || '');
    const [isUrgent, setIsUrgent] = useState(false);

    // Images picker state
    const [selectedImages, setSelectedImages] = useState<string[]>([]);

    const pickImages = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Permission Denied', 'Permission to access gallery is required to add photos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            selectionLimit: 5,
            quality: 0.8,
        });

        if (!result.canceled) {
            const uris = result.assets.map(asset => asset.uri);
            setSelectedImages(prev => {
                const combined = [...prev, ...uris];
                if (combined.length > 5) {
                    Alert.alert('Limit Reached', 'You can upload up to 5 images only.');
                    return combined.slice(0, 5);
                }
                return combined;
            });
        }
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    const handlePost = async () => {
        if (!title.trim() || !description.trim() || !contactPhone.trim()) {
            Alert.alert('Required Fields', 'Please fill in title, description, and contact phone.');
            return;
        }

        const phoneValidation = validation.phone(contactPhone);
        if (!phoneValidation.isValid) {
            Alert.alert('Invalid Phone', phoneValidation.error || 'Please enter a valid 10-digit Indian mobile number.');
            return;
        }

        if (postingType === 'room') {
            const priceValidation = validation.price(price);
            if (!priceValidation.isValid) {
                Alert.alert('Invalid Rent', priceValidation.error || 'Please enter a valid monthly rent amount greater than 0.');
                return;
            }

            const depositNum = parseInt(deposit);
            if (!deposit || isNaN(depositNum) || depositNum < 0) {
                Alert.alert('Invalid Deposit', 'Please enter a valid security deposit amount.');
                return;
            }
        }

        if (postingType === 'job') {
            if (!salary.trim()) {
                Alert.alert('Salary Required', 'Please enter the salary offered for this position.');
                return;
            }
            if (!company.trim()) {
                Alert.alert('Company Required', 'Please enter the company or employer name.');
                return;
            }
        }

        const spamCheck = checkForSpam(`${title} ${description}`);
        if (spamCheck.isSpam) {
            Alert.alert('Spam Detected', spamCheck.reasons.join('\n'), [
                { text: 'Edit', style: 'cancel' },
                { text: 'Post Anyway', style: 'destructive', onPress: doPost },
            ]);
            return;
        }

        doPost();
    };

    const doPost = async () => {
        if (!user) return;
        setLoading(true);

        try {
            let uploadedUrls: string[] = [];
            if (postingType === 'room' && selectedImages.length > 0) {
                // Upload all selected local images to Supabase room-images bucket
                for (const uri of selectedImages) {
                    try {
                        const url = await imageService.uploadImage(uri, 'room-images');
                        uploadedUrls.push(url);
                    } catch (uploadError) {
                        console.error('Failed to upload image:', uri, uploadError);
                    }
                }
            }

            if (postingType === 'room') {
                const newRoom: Omit<Room, 'id' | 'createdAt'> = {
                    ownerId: user.id,
                    title: title.trim(),
                    description: description.trim(),
                    price: parseInt(price),
                    deposit: parseInt(deposit),
                    area: phase,
                    type: roomType as any,
                    furnishing: furnishing as any,
                    genderPreference: gender as any,
                    amenities: [],
                    images: uploadedUrls,
                    status: 'Available',
                    contactPhone: contactPhone.trim(),
                };
                await roomService.createRoom(newRoom);
            } else {
                const newJob: Omit<Job, 'id' | 'postedAgo'> = {
                    employerId: user.id,
                    title: title.trim(),
                    category: jobCategory,
                    company: company.trim(),
                    description: description.trim(),
                    salary: salary.trim(),
                    area: phase,
                    type: 'Full Time',
                    experience: '0-2 years',
                    contactPhone: contactPhone.trim(),
                    urgent: isUrgent,
                    requirements: [],
                    benefits: [],
                };
                await jobService.createJob(newJob);
            }

            Alert.alert('Success', 'Listing published!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
        } catch (error) {
            Alert.alert('Error', 'Publication failed');
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

    if (!postingType) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialCommunityIcons name="close" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>New Posting</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.modeSelection}>
                    <Text style={styles.modeTitle}>What are you posting today?</Text>
                    <TouchableOpacity
                        style={styles.modeCard}
                        onPress={() => setPostingType('room')}
                    >
                        <MaterialCommunityIcons name="home-city" size={32} color={COLORS.primary} />
                        <View style={{ marginLeft: 16 }}>
                            <Text style={styles.modeCardTitle}>Property/Room</Text>
                            <Text style={styles.modeCardSub}>List a Flat, PG, or Room to rent</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.modeCard}
                        onPress={() => setPostingType('job')}
                    >
                        <MaterialCommunityIcons name="briefcase" size={32} color={COLORS.success} />
                        <View style={{ marginLeft: 16 }}>
                            <Text style={styles.modeCardTitle}>Job Opening</Text>
                            <Text style={styles.modeCardSub}>Hire help like Cook, Guard, Peon etc.</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => {
                    if (user?.listingCategory === 'both') setPostingType(null);
                    else navigation.goBack();
                }}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {postingType === 'room' ? 'Post Property' : 'Post Job'}
                </Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {postingType === 'room' ? renderSelector('Room Type', TYPES, roomType, setRoomType) :
                    renderSelector('Job Category', JOB_CATEGORIES, jobCategory, (v) => setJobCategory(v as any))}

                {renderSelector('Locality', PHASES, phase, setPhase)}

                <AppTextInput
                    label={postingType === 'room' ? "Property Title" : "Job Title"}
                    placeholder={postingType === 'room' ? "1RK with Balcony" : "Urgently need Day Guard"}
                    value={title}
                    onChangeText={setTitle}
                />

                {postingType === 'room' ? (
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: SPACING.md }}>
                            <AppTextInput label="Rent (₹)" keyboardType="number-pad" value={price} onChangeText={setPrice} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <AppTextInput label="Deposit (₹)" keyboardType="number-pad" value={deposit} onChangeText={setDeposit} />
                        </View>
                    </View>
                ) : (
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: SPACING.md }}>
                            <AppTextInput label="Salary Offer" placeholder="e.g. 15k-18k" value={salary} onChangeText={setSalary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <AppTextInput label="Company/Name" value={company} onChangeText={setCompany} />
                        </View>
                    </View>
                )}

                {postingType === 'room' && (
                    <>
                        {renderSelector('Furnishing', FURNISHING, furnishing, setFurnishing)}
                        {renderSelector('Gender', GENDER, gender, setGender)}

                        {/* Image picker Section */}
                        <View style={styles.imageSection}>
                            <Text style={styles.label}>Photos (Max 5)</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageScroll}>
                                {selectedImages.map((uri, idx) => (
                                    <View key={idx} style={styles.imageContainer}>
                                        <Image source={{ uri }} style={styles.previewImage} />
                                        <TouchableOpacity style={styles.deleteBadge} onPress={() => removeImage(idx)}>
                                            <MaterialCommunityIcons name="close-circle" size={20} color={COLORS.error} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                {selectedImages.length < 5 && (
                                    <TouchableOpacity style={styles.uploadBox} onPress={pickImages}>
                                        <MaterialCommunityIcons name="camera-plus" size={30} color={COLORS.primary} />
                                        <Text style={styles.uploadBoxText}>Add Photo</Text>
                                    </TouchableOpacity>
                                )}
                            </ScrollView>
                        </View>
                    </>
                )}

                {postingType === 'job' && (
                    <TouchableOpacity
                        style={styles.urgentToggle}
                        onPress={() => setIsUrgent(!isUrgent)}
                    >
                        <MaterialCommunityIcons
                            name={isUrgent ? "checkbox-marked" : "checkbox-blank-outline"}
                            size={24}
                            color={isUrgent ? COLORS.error : COLORS.textSecondary}
                        />
                        <Text style={[styles.urgentText, isUrgent && { color: COLORS.error }]}>Mark as URGENT hiring</Text>
                    </TouchableOpacity>
                )}

                <AppTextInput
                    label="Contact Number"
                    placeholder="Enter phone number for inquiries"
                    keyboardType="phone-pad"
                    value={contactPhone}
                    onChangeText={setContactPhone}
                />

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Add more details..."
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>

                <PrimaryButton title="Publish Now" onPress={handlePost} loading={loading} style={styles.postButton} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.white,
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
    scrollContent: { padding: SPACING.lg },
    modeSelection: { padding: SPACING.xl, flex: 1, justifyContent: 'center' },
    modeTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 32, textAlign: 'center' },
    modeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: 16,
        ...SHADOWS.light,
    },
    modeCardTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
    modeCardSub: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
    selectorContainer: { marginBottom: SPACING.lg },
    label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    chipText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
    chipTextActive: { color: COLORS.white, fontWeight: '700' },
    row: { flexDirection: 'row' },
    inputGroup: { marginBottom: SPACING.lg },
    textArea: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        height: 120,
        borderWidth: 1,
        borderColor: COLORS.border,
        fontSize: 14,
    },
    urgentToggle: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg, gap: 8 },
    urgentText: { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary },
    postButton: { marginTop: SPACING.md, marginBottom: SPACING.xl },
    imageSection: { marginBottom: SPACING.lg },
    imageScroll: { gap: SPACING.md, paddingVertical: 4 },
    imageContainer: { position: 'relative', width: 90, height: 90, borderRadius: BORDER_RADIUS.md, overflow: 'hidden' },
    previewImage: { width: 90, height: 90, borderRadius: BORDER_RADIUS.md },
    deleteBadge: { position: 'absolute', top: 2, right: 2, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 10 },
    uploadBox: {
        width: 90, height: 90, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderStyle: 'dashed',
        borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white, gap: 4,
    },
    uploadBoxText: { fontSize: 11, color: COLORS.primary, fontWeight: '700' },
});
