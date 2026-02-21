import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Pressable,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../theme/theme';
import { ReportReason, ReportTargetType } from '../types';
import { REPORT_REASONS, submitReport, blockUser, addToBlockedList, confirmBlock } from '../utils/trustSafetyUtils';

interface ReportSheetProps {
    visible: boolean;
    onClose: () => void;
    targetId: string;
    targetType: ReportTargetType;
    targetName: string;
    reporterId: string;
    /** If targeting a user (owner/employer), show block option */
    targetUserId?: string;
    targetUserName?: string;
    targetUserPhone?: string;
}

export const ReportSheet: React.FC<ReportSheetProps> = ({
    visible,
    onClose,
    targetId,
    targetType,
    targetName,
    reporterId,
    targetUserId,
    targetUserName,
    targetUserPhone,
}) => {
    const [step, setStep] = useState<'reason' | 'details' | 'submitted'>('reason');
    const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [alsoBlock, setAlsoBlock] = useState(false);

    const handleSubmit = async () => {
        if (!selectedReason) return;
        setLoading(true);
        try {
            await submitReport(reporterId, targetId, targetType, selectedReason, description);

            if (alsoBlock && targetUserId && targetUserName && targetUserPhone) {
                const blocked = await blockUser(
                    reporterId,
                    targetUserId,
                    targetUserName,
                    targetUserPhone,
                    `Blocked via report: ${selectedReason}`,
                );
                addToBlockedList(blocked);
            }

            setStep('submitted');
        } catch {
            Alert.alert('Error', 'Failed to submit report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep('reason');
        setSelectedReason(null);
        setDescription('');
        setAlsoBlock(false);
        onClose();
    };

    const typeLabel = {
        room: 'Room Listing',
        job: 'Job Listing',
        service: 'Service Provider',
        user: 'User',
    }[targetType];

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
            <Pressable style={styles.overlay} onPress={handleClose}>
                <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
                    {/* Handle */}
                    <View style={styles.handle} />

                    {step === 'reason' && (
                        <>
                            {/* Header */}
                            <View style={styles.headerRow}>
                                <View style={styles.reportIconCircle}>
                                    <MaterialCommunityIcons name="flag-outline" size={22} color="#EF4444" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.title}>Report {typeLabel}</Text>
                                    <Text style={styles.subtitle} numberOfLines={1}>{targetName}</Text>
                                </View>
                            </View>

                            <Text style={styles.sectionLabel}>Why are you reporting this?</Text>

                            {/* Reason List */}
                            {REPORT_REASONS.map(reason => (
                                <TouchableOpacity
                                    key={reason.key}
                                    style={[
                                        styles.reasonRow,
                                        selectedReason === reason.key && styles.reasonRowSelected,
                                    ]}
                                    onPress={() => setSelectedReason(reason.key)}
                                    activeOpacity={0.8}
                                >
                                    <View style={[
                                        styles.reasonIcon,
                                        selectedReason === reason.key && styles.reasonIconSelected,
                                    ]}>
                                        <MaterialCommunityIcons
                                            name={reason.icon as any}
                                            size={18}
                                            color={selectedReason === reason.key ? COLORS.white : COLORS.textSecondary}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.reasonLabel}>{reason.label}</Text>
                                        <Text style={styles.reasonDesc}>{reason.description}</Text>
                                    </View>
                                    <View style={[
                                        styles.radioOuter,
                                        selectedReason === reason.key && styles.radioOuterSelected,
                                    ]}>
                                        {selectedReason === reason.key && <View style={styles.radioInner} />}
                                    </View>
                                </TouchableOpacity>
                            ))}

                            {/* Continue */}
                            <TouchableOpacity
                                style={[styles.continueBtn, !selectedReason && styles.continueBtnDisabled]}
                                disabled={!selectedReason}
                                onPress={() => setStep('details')}
                            >
                                <Text style={styles.continueBtnText}>Continue</Text>
                                <MaterialCommunityIcons name="arrow-right" size={18} color={COLORS.white} />
                            </TouchableOpacity>
                        </>
                    )}

                    {step === 'details' && (
                        <>
                            <View style={styles.headerRow}>
                                <TouchableOpacity onPress={() => setStep('reason')}>
                                    <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
                                </TouchableOpacity>
                                <Text style={[styles.title, { marginLeft: 12 }]}>Add Details</Text>
                            </View>

                            <Text style={styles.sectionLabel}>
                                Tell us more (optional)
                            </Text>
                            <TextInput
                                style={styles.detailsInput}
                                placeholder="Describe the issue..."
                                placeholderTextColor={COLORS.textSecondary}
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />

                            {/* Block option */}
                            {targetUserId && (
                                <TouchableOpacity
                                    style={styles.blockRow}
                                    onPress={() => setAlsoBlock(!alsoBlock)}
                                >
                                    <MaterialCommunityIcons
                                        name={alsoBlock ? 'checkbox-marked' : 'checkbox-blank-outline'}
                                        size={22}
                                        color={alsoBlock ? '#EF4444' : COLORS.textSecondary}
                                    />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.blockRowText}>Also block {targetUserName || 'this user'}</Text>
                                        <Text style={styles.blockRowSubtext}>You won't see their listings</Text>
                                    </View>
                                </TouchableOpacity>
                            )}

                            {/* Submit */}
                            <TouchableOpacity
                                style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                                disabled={loading}
                                onPress={handleSubmit}
                            >
                                {loading ? (
                                    <ActivityIndicator color={COLORS.white} size="small" />
                                ) : (
                                    <>
                                        <MaterialCommunityIcons name="flag" size={18} color={COLORS.white} />
                                        <Text style={styles.submitBtnText}>Submit Report</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </>
                    )}

                    {step === 'submitted' && (
                        <View style={styles.submittedContainer}>
                            <View style={styles.submittedIcon}>
                                <MaterialCommunityIcons name="check-circle" size={48} color="#10B981" />
                            </View>
                            <Text style={styles.submittedTitle}>Report Submitted</Text>
                            <Text style={styles.submittedDesc}>
                                Thank you for helping keep Hinjewadi Connect safe.{'\n'}
                                Our team will review this report within 24 hours.
                            </Text>
                            {alsoBlock && (
                                <View style={styles.blockedNotice}>
                                    <MaterialCommunityIcons name="account-cancel" size={16} color="#EF4444" />
                                    <Text style={styles.blockedNoticeText}>
                                        {targetUserName || 'User'} has been blocked
                                    </Text>
                                </View>
                            )}
                            <TouchableOpacity style={styles.doneBtn} onPress={handleClose}>
                                <Text style={styles.doneBtnText}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </Pressable>
            </Pressable>
        </Modal>
    );
};

// ── Standalone Block Button (for profile / detail screens) ──
interface BlockButtonProps {
    userId: string;
    userName: string;
    userPhone: string;
    currentUserId: string;
    onBlocked?: () => void;
}

export const BlockButton: React.FC<BlockButtonProps> = ({
    userId,
    userName,
    userPhone,
    currentUserId,
    onBlocked,
}) => {
    const handleBlock = () => {
        confirmBlock(userName, async () => {
            const blocked = await blockUser(currentUserId, userId, userName, userPhone, 'Manually blocked');
            addToBlockedList(blocked);
            Alert.alert('Blocked', `${userName} has been blocked.`);
            onBlocked?.();
        });
    };

    return (
        <TouchableOpacity style={styles.blockBtn} onPress={handleBlock}>
            <MaterialCommunityIcons name="account-cancel" size={18} color="#EF4444" />
            <Text style={styles.blockBtnText}>Block User</Text>
        </TouchableOpacity>
    );
};

// ── Report + Block Quick Actions Row (for cards) ──
interface ReportBlockActionsProps {
    onReport: () => void;
    onBlock: () => void;
}

export const ReportBlockActions: React.FC<ReportBlockActionsProps> = ({ onReport, onBlock }) => (
    <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={onReport}>
            <MaterialCommunityIcons name="flag-outline" size={16} color="#EF4444" />
            <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Report</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onBlock}>
            <MaterialCommunityIcons name="account-cancel-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.actionBtnText}>Block</Text>
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: BORDER_RADIUS.xl,
        borderTopRightRadius: BORDER_RADIUS.xl,
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.xxl,
        maxHeight: '85%',
        ...SHADOWS.medium,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.border,
        alignSelf: 'center',
        marginTop: SPACING.md,
        marginBottom: SPACING.md,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        marginBottom: SPACING.md,
    },
    reportIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFEBEE',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
    },
    subtitle: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
    },
    // Reason rows
    reasonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: BORDER_RADIUS.md,
        gap: SPACING.sm,
        marginBottom: 4,
    },
    reasonRowSelected: {
        backgroundColor: '#FFF5F5',
    },
    reasonIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    reasonIconSelected: {
        backgroundColor: '#EF4444',
    },
    reasonLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
    reasonDesc: {
        fontSize: 11,
        color: COLORS.textSecondary,
        marginTop: 1,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioOuterSelected: {
        borderColor: '#EF4444',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#EF4444',
    },
    // Continue
    continueBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EF4444',
        paddingVertical: 14,
        borderRadius: BORDER_RADIUS.full,
        gap: 8,
        marginTop: SPACING.md,
    },
    continueBtnDisabled: {
        opacity: 0.4,
    },
    continueBtnText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 15,
    },
    // Details step
    detailsInput: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        fontSize: 14,
        color: COLORS.text,
        minHeight: 100,
        backgroundColor: '#F8FAFC',
        marginBottom: SPACING.md,
    },
    blockRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.sm,
        backgroundColor: '#FFF5F5',
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.md,
    },
    blockRowText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
    blockRowSubtext: {
        fontSize: 11,
        color: COLORS.textSecondary,
    },
    submitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EF4444',
        paddingVertical: 14,
        borderRadius: BORDER_RADIUS.full,
        gap: 8,
    },
    submitBtnText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 15,
    },
    // Submitted
    submittedContainer: {
        alignItems: 'center',
        paddingVertical: SPACING.lg,
    },
    submittedIcon: {
        marginBottom: SPACING.md,
    },
    submittedTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 8,
    },
    submittedDesc: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: SPACING.md,
    },
    blockedNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFEBEE',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: BORDER_RADIUS.full,
        gap: 6,
        marginBottom: SPACING.md,
    },
    blockedNoticeText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#EF4444',
    },
    doneBtn: {
        backgroundColor: '#10B981',
        paddingHorizontal: 40,
        paddingVertical: 14,
        borderRadius: BORDER_RADIUS.full,
    },
    doneBtnText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 15,
    },
    // Block button
    blockBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: '#FFEBEE',
        borderRadius: BORDER_RADIUS.full,
    },
    blockBtnText: {
        color: '#EF4444',
        fontWeight: '600',
        fontSize: 13,
    },
    // Quick Actions
    actionsRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: '#F8FAFC',
    },
    actionBtnText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
});
